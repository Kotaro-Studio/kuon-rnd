use wasm_bindgen::prelude::*;
use js_sys::Uint8Array;

/// FIR filter spans this many output PCM samples.
/// 8 gives ~-74 dB stopband (Blackman window). Excellent for 24-bit audio.
const FILTER_ORDER: usize = 8;

// ═══════════════════════════════════════════════
// Public API: Header-only parsing
// ═══════════════════════════════════════════════

/// Parse the header of a DSD file. Only needs the first ~100KB of the file.
/// Returns JSON with format info.
#[wasm_bindgen]
pub fn dsd_parse_header(header_bytes: &[u8]) -> Result<String, JsValue> {
    let header = parse_dsd(header_bytes).map_err(|e| JsValue::from_str(&e))?;
    Ok(format!(
        r#"{{"format":"{}","channels":{},"dsdSampleRate":{},"totalDsdSamples":{},"dataOffset":{},"dataSize":{},"blockSizePerChannel":{}}}"#,
        header.format_name(),
        header.channels,
        header.dsd_sample_rate,
        header.total_dsd_samples,
        header.data_offset,
        header.data_size,
        header.block_size_per_channel,
    ))
}

// ═══════════════════════════════════════════════
// Public API: Streaming DSD Processor with FIR filter
// ═══════════════════════════════════════════════

#[wasm_bindgen]
pub struct DsdProcessor {
    channels: usize,
    is_dsf: bool,
    block_size_per_channel: usize,
    decimation_ratio: usize,
    bytes_per_output: usize, // ratio / 8

    // FIR lowpass filter: byte-level lookup table
    // lookup[byte_group_index][byte_value] = partial dot-product
    lookup: Vec<[f64; 256]>,
    filter_bytes: usize, // = FILTER_ORDER * ratio / 8

    // Per-channel circular history buffer + counter
    ch_byte_history: Vec<Vec<u8>>,
    ch_write_pos: Vec<usize>,
    ch_byte_count: Vec<usize>,

    // DSF frame assembly
    dsf_frame_buffer: Vec<u8>,
    dsf_frame_pos: usize,
    dsf_frame_size: usize,

    // DFF partial interleave frame
    dff_partial: Vec<u8>,
}

#[wasm_bindgen]
impl DsdProcessor {
    /// Create a new processor from parsed header info.
    #[wasm_bindgen(constructor)]
    pub fn new(
        format: &str,
        channels: u32,
        dsd_sample_rate: u32,
        target_rate: u32,
        block_size_per_channel: u32,
    ) -> Result<DsdProcessor, JsValue> {
        let valid_rates = [44100u32, 48000, 88200, 96000, 176400, 192000];
        if !valid_rates.contains(&target_rate) {
            return Err(JsValue::from_str("Invalid target sample rate"));
        }
        if dsd_sample_rate % target_rate != 0 {
            return Err(JsValue::from_str(
                "DSD sample rate must be an integer multiple of target rate",
            ));
        }

        let ratio = (dsd_sample_rate / target_rate) as usize;
        if ratio % 8 != 0 {
            return Err(JsValue::from_str(
                "Decimation ratio must be a multiple of 8",
            ));
        }

        let ch = channels as usize;
        let bspc = block_size_per_channel as usize;
        let is_dsf = format == "DSF";

        let filter_len = FILTER_ORDER * ratio;
        let filter_bytes = filter_len / 8;
        let bytes_per_output = ratio / 8;

        // Design windowed-sinc FIR lowpass filter
        let coeffs = design_lowpass(filter_len, ratio);
        // Build byte-level lookup table (bit order depends on DSF vs DFF)
        let lookup = build_lookup(&coeffs, is_dsf);

        let ch_byte_history = vec![vec![0u8; filter_bytes]; ch];
        let ch_write_pos = vec![0usize; ch];
        let ch_byte_count = vec![0usize; ch];

        let dsf_frame_size = if is_dsf { bspc * ch } else { 0 };

        Ok(DsdProcessor {
            channels: ch,
            is_dsf,
            block_size_per_channel: bspc,
            decimation_ratio: ratio,
            bytes_per_output,
            lookup,
            filter_bytes,
            ch_byte_history,
            ch_write_pos,
            ch_byte_count,
            dsf_frame_buffer: Vec::with_capacity(dsf_frame_size),
            dsf_frame_pos: 0,
            dsf_frame_size,
            dff_partial: Vec::new(),
        })
    }

    /// Process a chunk of raw DSD audio data.
    /// Returns interleaved PCM Float32 LE bytes.
    pub fn process_chunk(&mut self, audio_chunk: &[u8]) -> Uint8Array {
        let pcm_f32 = if self.is_dsf {
            self.process_dsf_chunk(audio_chunk)
        } else {
            self.process_dff_chunk(audio_chunk)
        };

        let mut bytes = Vec::with_capacity(pcm_f32.len() * 4);
        for &s in &pcm_f32 {
            bytes.extend_from_slice(&s.to_le_bytes());
        }

        let result = Uint8Array::new_with_length(bytes.len() as u32);
        result.copy_from(&bytes);
        result
    }

    pub fn channels(&self) -> u32 {
        self.channels as u32
    }

    pub fn ratio(&self) -> u32 {
        self.decimation_ratio as u32
    }
}

// ─── Core FIR filter operation ───────────────────────────────

impl DsdProcessor {
    /// Push one DSD byte for a channel through the FIR filter.
    /// Returns Some(pcm_sample) when enough bits have been accumulated.
    #[inline]
    fn push_byte(&mut self, ch: usize, byte: u8) -> Option<f32> {
        // Write into circular buffer
        let wp = self.ch_write_pos[ch];
        self.ch_byte_history[ch][wp] = byte;
        self.ch_write_pos[ch] = (wp + 1) % self.filter_bytes;
        self.ch_byte_count[ch] += 1;

        if self.ch_byte_count[ch] == self.bytes_per_output {
            self.ch_byte_count[ch] = 0;

            // Convolve: walk the ring buffer from oldest to newest
            let mut sum = 0.0f64;
            let mut rp = self.ch_write_pos[ch]; // == oldest position
            let fb = self.filter_bytes;
            let history = &self.ch_byte_history[ch];
            let lookup = &self.lookup;

            for group in 0..fb {
                let b = history[rp] as usize;
                sum += lookup[group][b];
                rp = (rp + 1) % fb;
            }

            Some(sum.max(-1.0).min(1.0) as f32)
        } else {
            None
        }
    }
}

// ─── DSF chunk processing ────────────────────────────────────

impl DsdProcessor {
    fn process_dsf_chunk(&mut self, chunk: &[u8]) -> Vec<f32> {
        let mut pcm_out: Vec<f32> = Vec::new();
        let mut pos = 0;

        while pos < chunk.len() {
            let need = self.dsf_frame_size - self.dsf_frame_pos;
            let available = chunk.len() - pos;
            let take = need.min(available);

            self.dsf_frame_buffer
                .extend_from_slice(&chunk[pos..pos + take]);
            self.dsf_frame_pos += take;
            pos += take;

            if self.dsf_frame_pos == self.dsf_frame_size {
                self.process_dsf_frame(&mut pcm_out);
                self.dsf_frame_buffer.clear();
                self.dsf_frame_pos = 0;
            }
        }

        pcm_out
    }

    fn process_dsf_frame(&mut self, pcm_out: &mut Vec<f32>) {
        let bspc = self.block_size_per_channel;
        let channels = self.channels;

        // DSF frame: [block_ch0 (bspc bytes)][block_ch1 (bspc bytes)]...
        // Each block's bytes are LSB-first DSD data for that channel.

        // Process each channel independently, collect per-channel PCM
        let mut ch_outputs: Vec<Vec<f32>> = Vec::with_capacity(channels);
        for ch in 0..channels {
            let block_start = ch * bspc;
            let mut ch_pcm = Vec::new();
            for i in 0..bspc {
                let byte = self.dsf_frame_buffer[block_start + i];
                if let Some(sample) = self.push_byte(ch, byte) {
                    ch_pcm.push(sample);
                }
            }
            ch_outputs.push(ch_pcm);
        }

        // Interleave: [ch0_s0, ch1_s0, ch0_s1, ch1_s1, ...]
        let num_samples = ch_outputs.iter().map(|v| v.len()).min().unwrap_or(0);
        for i in 0..num_samples {
            for ch in 0..channels {
                pcm_out.push(ch_outputs[ch][i]);
            }
        }
    }
}

// ─── DFF chunk processing ────────────────────────────────────

impl DsdProcessor {
    fn process_dff_chunk(&mut self, chunk: &[u8]) -> Vec<f32> {
        let channels = self.channels;
        let mut pcm_out: Vec<f32> = Vec::new();
        let mut start = 0;

        // Complete any partial interleave frame from previous chunk
        if !self.dff_partial.is_empty() {
            let need = channels - self.dff_partial.len();
            if chunk.len() >= need {
                self.dff_partial.extend_from_slice(&chunk[..need]);
                start = need;
                // Process the completed frame
                for ch in 0..channels {
                    let byte = self.dff_partial[ch];
                    if let Some(s) = self.push_byte(ch, byte) {
                        pcm_out.push(s);
                    }
                }
                self.dff_partial.clear();
            } else {
                self.dff_partial.extend_from_slice(chunk);
                return pcm_out;
            }
        }

        // Process complete frames from the chunk
        let data = &chunk[start..];
        let full_frames = data.len() / channels;
        for f in 0..full_frames {
            let base = f * channels;
            for ch in 0..channels {
                let byte = data[base + ch];
                if let Some(s) = self.push_byte(ch, byte) {
                    pcm_out.push(s);
                }
            }
        }

        // Save leftover bytes (incomplete frame)
        let consumed = full_frames * channels;
        if consumed < data.len() {
            self.dff_partial.extend_from_slice(&data[consumed..]);
        }

        pcm_out
    }
}

// ═══════════════════════════════════════════════
// FIR Lowpass Filter Design
// ═══════════════════════════════════════════════

/// Design a windowed-sinc lowpass FIR filter.
/// Cutoff at Nyquist of the target rate (= 1/(2*ratio) of DSD rate).
/// Uses Blackman window (~-74 dB stopband attenuation).
fn design_lowpass(filter_len: usize, ratio: usize) -> Vec<f64> {
    let fc = 1.0 / (2.0 * ratio as f64); // normalized cutoff
    let m = (filter_len - 1) as f64 / 2.0;
    let pi = std::f64::consts::PI;

    let mut h = vec![0.0f64; filter_len];
    let mut sum = 0.0;

    for i in 0..filter_len {
        let n = i as f64 - m;

        // Sinc function
        let sinc_val = if n.abs() < 1e-10 {
            2.0 * fc
        } else {
            (2.0 * pi * fc * n).sin() / (pi * n)
        };

        // Blackman window
        let x = i as f64 / (filter_len - 1) as f64;
        let w = 0.42 - 0.5 * (2.0 * pi * x).cos() + 0.08 * (4.0 * pi * x).cos();

        h[i] = sinc_val * w;
        sum += h[i];
    }

    // Normalize for unity DC gain
    if sum.abs() > 1e-10 {
        for v in &mut h {
            *v /= sum;
        }
    }

    h
}

/// Build byte-level lookup table for fast FIR evaluation.
/// Since DSD bits are only +1/-1, we precompute the dot product
/// for each group of 8 consecutive coefficients × all 256 byte values.
/// This reduces per-sample computation from `filter_len` multiply-adds
/// to `filter_len/8` table lookups.
fn build_lookup(coeffs: &[f64], lsb_first: bool) -> Vec<[f64; 256]> {
    let num_groups = coeffs.len() / 8;
    let mut lookup = vec![[0.0f64; 256]; num_groups];

    for g in 0..num_groups {
        for byte_val in 0u16..256 {
            let mut sum = 0.0;
            for bit_idx in 0..8u16 {
                let coeff = coeffs[g * 8 + bit_idx as usize];
                // DSF: LSB first (bit 0 = earliest sample in time)
                // DFF: MSB first (bit 7 = earliest sample in time)
                let bit = if lsb_first {
                    (byte_val >> bit_idx) & 1
                } else {
                    (byte_val >> (7 - bit_idx)) & 1
                };
                sum += coeff * (bit as f64 * 2.0 - 1.0);
            }
            lookup[g][byte_val as usize] = sum;
        }
    }

    lookup
}

// ═══════════════════════════════════════════════
// WAV Encoder (24-bit)
// ═══════════════════════════════════════════════

/// Encode interleaved f32 PCM samples as a 24-bit WAV file.
#[wasm_bindgen]
pub fn encode_wav_24bit(pcm_f32_bytes: &[u8], channels: u16, sample_rate: u32) -> Uint8Array {
    let num_samples = pcm_f32_bytes.len() / 4;
    let bytes_per_sample = 3u16; // 24-bit
    let block_align = channels * bytes_per_sample;
    let byte_rate = sample_rate * block_align as u32;
    let data_size = num_samples as u32 * bytes_per_sample as u32;
    let file_size = 36 + data_size;

    let mut wav: Vec<u8> = Vec::with_capacity(file_size as usize + 8);

    // RIFF header
    wav.extend_from_slice(b"RIFF");
    wav.extend_from_slice(&file_size.to_le_bytes());
    wav.extend_from_slice(b"WAVE");

    // fmt chunk
    wav.extend_from_slice(b"fmt ");
    wav.extend_from_slice(&16u32.to_le_bytes());
    wav.extend_from_slice(&1u16.to_le_bytes()); // PCM
    wav.extend_from_slice(&channels.to_le_bytes());
    wav.extend_from_slice(&sample_rate.to_le_bytes());
    wav.extend_from_slice(&byte_rate.to_le_bytes());
    wav.extend_from_slice(&block_align.to_le_bytes());
    wav.extend_from_slice(&24u16.to_le_bytes());

    // data chunk
    wav.extend_from_slice(b"data");
    wav.extend_from_slice(&data_size.to_le_bytes());

    let max_val = 8_388_607.0f64; // 2^23 - 1
    let mut offset = 0;
    for _ in 0..num_samples {
        if offset + 4 > pcm_f32_bytes.len() {
            break;
        }
        let f = f32::from_le_bytes([
            pcm_f32_bytes[offset],
            pcm_f32_bytes[offset + 1],
            pcm_f32_bytes[offset + 2],
            pcm_f32_bytes[offset + 3],
        ]);
        offset += 4;
        let clamped = (f as f64).max(-1.0).min(1.0);
        let int_val = (clamped * max_val) as i32;
        wav.push((int_val & 0xFF) as u8);
        wav.push(((int_val >> 8) & 0xFF) as u8);
        wav.push(((int_val >> 16) & 0xFF) as u8);
    }

    let result = Uint8Array::new_with_length(wav.len() as u32);
    result.copy_from(&wav);
    result
}

// ═══════════════════════════════════════════════
// DSD File Header Parsing
// ═══════════════════════════════════════════════

#[derive(Debug, Clone)]
enum DsdFormat {
    Dsf,
    Dff,
}

#[derive(Debug, Clone)]
struct DsdHeader {
    format: DsdFormat,
    channels: u32,
    dsd_sample_rate: u32,
    total_dsd_samples: u64,
    data_offset: usize,
    data_size: usize,
    block_size_per_channel: u32,
}

impl DsdHeader {
    fn format_name(&self) -> &str {
        match self.format {
            DsdFormat::Dsf => "DSF",
            DsdFormat::Dff => "DFF",
        }
    }
}

fn parse_dsd(data: &[u8]) -> Result<DsdHeader, String> {
    if data.len() < 28 {
        return Err("File too small to be a DSD file".into());
    }

    if &data[0..4] == b"DSD " {
        return parse_dsf(data);
    }

    if &data[0..4] == b"FRM8" && data.len() > 15 && &data[12..16] == b"DSD " {
        return parse_dff(data);
    }

    Err("Not a valid DSD file. Expected DSF or DFF (DSDIFF) format.".into())
}

// ─── DSF Parser ──────────────────────────────────────────────

fn read_u32_le(data: &[u8], offset: usize) -> u32 {
    u32::from_le_bytes([
        data[offset],
        data[offset + 1],
        data[offset + 2],
        data[offset + 3],
    ])
}

fn read_u64_le(data: &[u8], offset: usize) -> u64 {
    u64::from_le_bytes([
        data[offset],
        data[offset + 1],
        data[offset + 2],
        data[offset + 3],
        data[offset + 4],
        data[offset + 5],
        data[offset + 6],
        data[offset + 7],
    ])
}

fn parse_dsf(data: &[u8]) -> Result<DsdHeader, String> {
    if data.len() < 28 {
        return Err("DSF: file too small for DSD chunk".into());
    }
    let dsd_chunk_size = read_u64_le(data, 4) as usize;

    let fmt_offset = dsd_chunk_size;
    if data.len() < fmt_offset + 52 {
        return Err("DSF: file too small for fmt chunk".into());
    }
    if &data[fmt_offset..fmt_offset + 4] != b"fmt " {
        return Err("DSF: expected 'fmt ' chunk".into());
    }

    let fmt_version = read_u32_le(data, fmt_offset + 12);
    if fmt_version != 1 {
        return Err(format!("DSF: unsupported format version {}", fmt_version));
    }

    // DSF fmt chunk layout (offsets from fmt_offset):
    //  +0:  "fmt " (4 bytes)
    //  +4:  chunk size (8 bytes, uint64 LE)
    // +12:  format version (4 bytes)
    // +16:  format ID (4 bytes)
    // +20:  channel type (4 bytes)
    // +24:  channel num (4 bytes)    ← actual channel count
    // +28:  sample rate (4 bytes)
    // +32:  bits per sample (4 bytes) = 1
    // +36:  sample count per channel (8 bytes, uint64 LE)
    // +44:  block size per channel (4 bytes)
    // +48:  reserved (4 bytes)

    let channels = read_u32_le(data, fmt_offset + 24);
    if channels == 0 || channels > 6 {
        return Err(format!("DSF: unsupported channel count {}", channels));
    }

    let sample_rate = read_u32_le(data, fmt_offset + 28);
    let bits_per_sample = read_u32_le(data, fmt_offset + 32);
    if bits_per_sample != 1 {
        return Err(format!(
            "DSF: expected 1 bit per sample, got {}",
            bits_per_sample
        ));
    }

    let total_samples = read_u64_le(data, fmt_offset + 36);
    let block_size_per_channel = read_u32_le(data, fmt_offset + 44);

    let data_offset = fmt_offset + read_u64_le(data, fmt_offset + 4) as usize;
    if data.len() < data_offset + 12 {
        // Only header portion available — that's fine for streaming
        return Ok(DsdHeader {
            format: DsdFormat::Dsf,
            channels,
            dsd_sample_rate: sample_rate,
            total_dsd_samples: total_samples,
            data_offset: data_offset + 12,
            data_size: 0,
            block_size_per_channel,
        });
    }
    if &data[data_offset..data_offset + 4] != b"data" {
        return Err("DSF: expected 'data' chunk".into());
    }
    let data_chunk_size = read_u64_le(data, data_offset + 4) as usize;
    let audio_offset = data_offset + 12;
    let audio_size = data_chunk_size - 12;

    Ok(DsdHeader {
        format: DsdFormat::Dsf,
        channels,
        dsd_sample_rate: sample_rate,
        total_dsd_samples: total_samples,
        data_offset: audio_offset,
        data_size: audio_size,
        block_size_per_channel,
    })
}

// ─── DFF (DSDIFF) Parser ─────────────────────────────────────

fn read_u16_be(data: &[u8], offset: usize) -> u16 {
    u16::from_be_bytes([data[offset], data[offset + 1]])
}

fn read_u32_be(data: &[u8], offset: usize) -> u32 {
    u32::from_be_bytes([
        data[offset],
        data[offset + 1],
        data[offset + 2],
        data[offset + 3],
    ])
}

fn read_u64_be(data: &[u8], offset: usize) -> u64 {
    u64::from_be_bytes([
        data[offset],
        data[offset + 1],
        data[offset + 2],
        data[offset + 3],
        data[offset + 4],
        data[offset + 5],
        data[offset + 6],
        data[offset + 7],
    ])
}

fn parse_dff(data: &[u8]) -> Result<DsdHeader, String> {
    let mut offset: usize = 16;
    let mut channels: u32 = 0;
    let mut sample_rate: u32 = 0;
    let mut audio_offset: usize = 0;
    let mut audio_size: usize = 0;
    let mut found_prop = false;
    let mut found_dsd = false;

    while offset + 12 <= data.len() {
        let chunk_id = &data[offset..offset + 4];
        let chunk_size = read_u64_be(data, offset + 4) as usize;

        match chunk_id {
            b"PROP" => {
                let prop_end = offset + 12 + chunk_size;
                let mut sub_offset = offset + 12 + 4;

                while sub_offset + 12 <= prop_end && sub_offset + 12 <= data.len() {
                    let sub_id = &data[sub_offset..sub_offset + 4];
                    let sub_size = read_u64_be(data, sub_offset + 4) as usize;

                    match sub_id {
                        b"FS  " => {
                            if sub_offset + 12 + 4 <= data.len() {
                                sample_rate = read_u32_be(data, sub_offset + 12);
                            }
                        }
                        b"CHNL" => {
                            if sub_offset + 12 + 2 <= data.len() {
                                channels = read_u16_be(data, sub_offset + 12) as u32;
                            }
                        }
                        _ => {}
                    }

                    sub_offset += 12 + sub_size;
                    if sub_size % 2 != 0 {
                        sub_offset += 1;
                    }
                }
                found_prop = true;
            }
            b"DSD " => {
                audio_offset = offset + 12;
                audio_size = chunk_size;
                found_dsd = true;
            }
            _ => {}
        }

        offset += 12 + chunk_size;
        if chunk_size % 2 != 0 {
            offset += 1;
        }
    }

    if !found_prop {
        return Err("DFF: PROP chunk not found".into());
    }
    if !found_dsd {
        if channels == 0 || sample_rate == 0 {
            return Err("DFF: missing channel or sample rate info".into());
        }
        return Ok(DsdHeader {
            format: DsdFormat::Dff,
            channels,
            dsd_sample_rate: sample_rate,
            total_dsd_samples: 0,
            data_offset: 0,
            data_size: 0,
            block_size_per_channel: 0,
        });
    }

    if channels == 0 || sample_rate == 0 {
        return Err("DFF: missing channel or sample rate info".into());
    }

    let total_samples = (audio_size as u64 * 8) / channels as u64;

    Ok(DsdHeader {
        format: DsdFormat::Dff,
        channels,
        dsd_sample_rate: sample_rate,
        total_dsd_samples: total_samples,
        data_offset: audio_offset,
        data_size: audio_size,
        block_size_per_channel: 0,
    })
}
