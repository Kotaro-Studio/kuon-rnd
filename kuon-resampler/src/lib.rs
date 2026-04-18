use wasm_bindgen::prelude::*;
use std::f64::consts::PI;

// ═══════════════════════════════════════════════════════════
// Windowed-Sinc Sample Rate Converter
//
// Algorithm: Bandlimited interpolation using a windowed sinc kernel.
// Window: Kaiser window (β configurable for quality/speed tradeoff).
//
// Theory:
//   For each output sample at time t_out:
//     1. Map to input time: t_in = t_out * (sr_in / sr_out)
//     2. Apply sinc(π·x) kernel centered at t_in
//     3. Window the kernel with Kaiser(β)
//     4. When downsampling, scale the cutoff to prevent aliasing
//
// Quality presets:
//   Standard (half_len=32):  Good for most conversions
//   High     (half_len=64):  Professional quality
//   Ultra    (half_len=128): Reference-grade, maximum fidelity
// ═══════════════════════════════════════════════════════════

/// Zeroth-order modified Bessel function I₀(x)
/// Used by Kaiser window. Converges fast for audio β values (4–14).
fn bessel_i0(x: f64) -> f64 {
    let mut sum = 1.0_f64;
    let mut term = 1.0_f64;
    let half_x = x * 0.5;
    for k in 1..=25 {
        term *= (half_x / k as f64) * (half_x / k as f64);
        sum += term;
        if term < 1e-20 { break; }
    }
    sum
}

/// Kaiser window: w(n) = I₀(β·√(1-(n/N)²)) / I₀(β)
/// `pos` is in [-1, 1], returns 0 outside that range.
#[inline]
fn kaiser_window(pos: f64, beta: f64, inv_i0_beta: f64) -> f64 {
    if pos.abs() >= 1.0 { return 0.0; }
    let arg = 1.0 - pos * pos;
    if arg <= 0.0 { return 0.0; }
    bessel_i0(beta * arg.sqrt()) * inv_i0_beta
}

/// Normalized sinc function: sinc(x) = sin(πx) / (πx)
#[inline]
fn sinc(x: f64) -> f64 {
    if x.abs() < 1e-12 { return 1.0; }
    let px = PI * x;
    px.sin() / px
}

/// Resample a single channel of f32 PCM audio.
///
/// - `input`:    source PCM samples (f32)
/// - `sr_in`:    source sample rate (e.g. 96000)
/// - `sr_out`:   target sample rate (e.g. 44100)
/// - `half_len`: filter half-length (number of zero-crossings per side)
/// - `beta`:     Kaiser window β parameter
///
/// Returns the resampled output samples.
fn resample_channel(
    input: &[f32],
    sr_in: u32,
    sr_out: u32,
    half_len: usize,
    beta: f64,
) -> Vec<f32> {
    let in_len = input.len();
    if in_len == 0 { return vec![]; }

    let ratio = sr_out as f64 / sr_in as f64;
    let out_len = ((in_len as f64) * ratio).ceil() as usize;

    // Anti-aliasing: when downsampling, shrink the sinc lobe
    // When upsampling, cutoff = 1.0 (no AA needed)
    let cutoff = if ratio < 1.0 { ratio } else { 1.0 };
    // Filter scale: sinc argument is multiplied by cutoff
    // Gain compensation: multiply output by cutoff when downsampling
    let gain = cutoff;

    let inv_i0_beta = 1.0 / bessel_i0(beta);

    let mut output = Vec::with_capacity(out_len);

    for i in 0..out_len {
        // Position in input sample space
        let t = i as f64 / ratio;
        let center = t.floor() as i64;

        let mut sum = 0.0_f64;

        let start = (center - half_len as i64 + 1).max(0);
        let end = (center + half_len as i64).min(in_len as i64 - 1);

        for j in start..=end {
            let delta = t - j as f64;

            // Sinc value scaled by cutoff for anti-aliasing
            let sinc_val = sinc(delta * cutoff);

            // Kaiser window: normalize delta to [-1, 1] range
            let window_pos = delta / half_len as f64;
            let window_val = kaiser_window(window_pos, beta, inv_i0_beta);

            sum += input[j as usize] as f64 * sinc_val * window_val;
        }

        output.push((sum * gain) as f32);
    }

    output
}

// ═══════════════════════════════════════════════════════════
// Public Wasm API
// ═══════════════════════════════════════════════════════════

/// Quality preset: 0 = Standard (32-tap), 1 = High (64-tap), 2 = Ultra (128-tap)
fn quality_params(preset: u32) -> (usize, f64) {
    match preset {
        0 => (32, 6.0),     // Standard: fast, good quality (~-80dB stopband)
        1 => (64, 9.0),     // High: professional (~-100dB stopband)
        _ => (128, 12.0),   // Ultra: reference-grade (~-120dB stopband)
    }
}

/// Resample interleaved stereo (or mono) PCM f32 data.
///
/// Parameters:
/// - `input_ptr`:  pointer to f32 PCM data (interleaved if stereo)
/// - `input_len`:  number of f32 samples total (frames * channels)
/// - `channels`:   1 for mono, 2 for stereo
/// - `sr_in`:      source sample rate
/// - `sr_out`:     target sample rate
/// - `quality`:    0=standard, 1=high, 2=ultra
///
/// Returns a Vec<f32> of resampled interleaved PCM data.
#[wasm_bindgen]
pub fn resample(
    input_data: &[f32],
    channels: u32,
    sr_in: u32,
    sr_out: u32,
    quality: u32,
) -> Vec<f32> {
    let ch = channels as usize;
    let (half_len, beta) = quality_params(quality);
    let frames = input_data.len() / ch;

    if ch == 1 {
        // Mono: direct resample
        return resample_channel(input_data, sr_in, sr_out, half_len, beta);
    }

    // Multi-channel: de-interleave → resample each → re-interleave
    let mut channel_data: Vec<Vec<f32>> = (0..ch)
        .map(|c| {
            (0..frames).map(|f| input_data[f * ch + c]).collect()
        })
        .collect();

    let mut resampled: Vec<Vec<f32>> = Vec::with_capacity(ch);
    for c in 0..ch {
        let r = resample_channel(&channel_data[c], sr_in, sr_out, half_len, beta);
        resampled.push(r);
    }
    // Free original channel data
    channel_data.clear();

    // Find shortest resampled length (should be identical, but safety)
    let out_frames = resampled.iter().map(|r| r.len()).min().unwrap_or(0);

    // Re-interleave
    let mut output = Vec::with_capacity(out_frames * ch);
    for f in 0..out_frames {
        for c in 0..ch {
            output.push(resampled[c][f]);
        }
    }

    output
}

/// Get the expected output length (in total samples, i.e. frames * channels)
/// without performing the conversion. Useful for progress estimation.
#[wasm_bindgen]
pub fn get_output_length(
    input_len: u32,
    channels: u32,
    sr_in: u32,
    sr_out: u32,
) -> u32 {
    let frames = input_len / channels;
    let ratio = sr_out as f64 / sr_in as f64;
    let out_frames = (frames as f64 * ratio).ceil() as u32;
    out_frames * channels
}
