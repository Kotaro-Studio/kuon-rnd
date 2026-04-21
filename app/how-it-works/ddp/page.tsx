'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

// ─────────────────────────────────────────────
// Design tokens
// ─────────────────────────────────────────────
const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const mono = '"SF Mono", "Fira Code", "Consolas", monospace';
const ACCENT = '#0284c7';
const ACCENT_LIGHT = '#0ea5e9';

type L5 = Record<Lang, string>;
type L5Node = Record<Lang, React.ReactNode>;

const t = (m: L5, lang: Lang) => m[lang];
const tn = (m: L5Node, lang: Lang) => m[lang];

// ─────────────────────────────────────────────
// Scroll-reveal hook
// ─────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, style: { opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 0.8s ease, transform 0.8s ease' } as React.CSSProperties };
}

// ─────────────────────────────────────────────
// Byte diagram component
// ─────────────────────────────────────────────
function ByteDiagram({ bytes, label }: { bytes: Array<{ offset: number; length: number; label: string; color: string }>, label: string }) {
  const totalWidth = Math.max(...bytes.map(b => b.offset + b.length));
  const pixelsPerByte = 16;
  const width = Math.min(totalWidth * pixelsPerByte, 600);

  return (
    <div style={{ marginBottom: '2rem' }}>
      <p style={{ fontFamily: mono, fontSize: '0.75rem', color: '#666', marginBottom: '0.5rem' }}>
        {label}
      </p>
      <div style={{
        background: 'linear-gradient(to right, #f8f9fa, #f0f1f2)',
        border: '1px solid #e0e1e2',
        borderRadius: 8,
        padding: '1rem',
        overflowX: 'auto',
      }}>
        <svg width={width} height={120} style={{ minWidth: '100%' }}>
          {/* Byte ruler */}
          {Array.from({ length: Math.ceil(totalWidth / 10) }).map((_, i) => {
            const offset = i * 10;
            const x = (offset / totalWidth) * width;
            return (
              <g key={i}>
                <line x1={x} y1={0} x2={x} y2={8} stroke="#ccc" strokeWidth={1} />
                <text x={x} y={20} fontSize={10} fill="#999" textAnchor="middle">
                  {offset}
                </text>
              </g>
            );
          })}

          {/* Byte ranges */}
          {bytes.map((b, i) => {
            const x = (b.offset / totalWidth) * width;
            const w = (b.length / totalWidth) * width;
            return (
              <g key={i}>
                <rect x={x} y={40} width={w} height={30} fill={b.color} opacity={0.7} rx={4} />
                <text
                  x={x + w / 2}
                  y={60}
                  fontSize={11}
                  fill="#fff"
                  fontWeight={600}
                  textAnchor="middle"
                  fontFamily={mono}
                >
                  {b.label}
                </text>
                <text
                  x={x + w / 2}
                  y={75}
                  fontSize={9}
                  fill="#666"
                  textAnchor="middle"
                  fontFamily={mono}
                >
                  {b.offset}-{b.offset + b.length - 1}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Color-coded code block
// ─────────────────────────────────────────────
function CodeBlock({ code, lang: codeLang }: { code: string; lang: string }) {
  return (
    <div style={{
      background: '#1e293b',
      color: '#e2e8f0',
      padding: '1.5rem',
      borderRadius: 8,
      overflowX: 'auto',
      marginBottom: '2rem',
      fontFamily: mono,
      fontSize: '0.85rem',
      lineHeight: 1.6,
    }}>
      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
        {codeLang}
      </div>
      <pre style={{ margin: 0, fontFamily: 'inherit', fontSize: 'inherit' }}>
        {code}
      </pre>
    </div>
  );
}

// ─────────────────────────────────────────────
// Content strings
// ─────────────────────────────────────────────
const HERO_TITLE: L5 = {
  ja: 'DDPチェッカーの仕組み',
  en: 'How DDP Checker Works',
  ko: 'DDP 체커의 작동 원리',
  pt: 'Como o DDP Checker Funciona',
  es: 'Cómo Funciona DDP Checker',
};

const HERO_SUBTITLE: L5 = {
  ja: 'CD マスタリング用バイナリフォーマット DDP を、ブラウザで完全に解析・再生する技術',
  en: 'Technical deep-dive: How we parse, visualize, and play CD mastering binary format DDP entirely in the browser',
  ko: 'CD 마스터링 바이너리 포맷 DDP를 브라우저에서 완전히 분석하고 재생하는 기술',
  pt: 'Análise profunda: Como analisamos, visualizamos e reproduzimos o formato binário DDP inteiramente no navegador',
  es: 'Análisis profundo: Cómo analizamos, visualizamos y reproducimos el formato binario DDP en el navegador',
};

const WHAT_IS_DDP_TITLE: L5 = {
  ja: 'DDP とは何か',
  en: 'What is DDP?',
  ko: 'DDP란 무엇인가',
  pt: 'O que é DDP?',
  es: '¿Qué es DDP?',
};

const WHAT_IS_DDP: L5Node = {
  ja: <>
    DDP（Disc Description Protocol）は Doug Carson & Associates が開発した CD マスタリング用バイナリフォーマット。<br />
    レコード会社や CD 製造所が使用する業界標準。<br /><br />
    CD の全情報を含む：<br />
    • トラック数・曲順・タイムコード<br />
    • 各トラック間の無音部分（gap）の長さ<br />
    • ISRC コード（国際標準録音コード）<br />
    • UPC / EAN バーコード<br />
    • 最大 99 トラックまでの完全な PQ シート情報<br />
    • 44.1kHz, 16-bit ステレオの PCM オーディオデータ（赤本仕様）
  </>,
  en: <>
    DDP (Disc Description Protocol) is a binary mastering format developed by Doug Carson & Associates.<br />
    Industry standard used by record labels and CD pressing plants worldwide.<br /><br />
    Contains complete CD information:<br />
    • Track count, sequence, timecode<br />
    • Gap duration between tracks<br />
    • ISRC codes (International Standard Recording Code)<br />
    • UPC / EAN barcode data<br />
    • Full PQ sheet metadata for up to 99 tracks<br />
    • Red Book compliant PCM audio (44.1kHz, 16-bit stereo)
  </>,
  ko: <>
    DDP(Disc Description Protocol)는 Doug Carson & Associates가 개발한 CD 마스터링용 바이너리 포맷입니다.<br />
    레코드사와 CD 제조사에서 사용하는 업계 표준입니다.<br /><br />
    CD의 완전한 정보를 포함합니다:<br />
    • 트랙 수, 순서, 타임코드<br />
    • 트랙 간 무음 구간(gap) 길이<br />
    • ISRC 코드 (국제 표준 레코딩 코드)<br />
    • UPC / EAN 바코드 데이터<br />
    • 최대 99개 트랙의 완전한 PQ 시트 메타데이터<br />
    • Red Book 호환 PCM 오디오 (44.1kHz, 16-bit 스테레오)
  </>,
  pt: <>
    DDP (Disc Description Protocol) é um formato binário de masterização desenvolvido por Doug Carson & Associates.<br />
    Padrão industrial usado por gravadoras e fábricas de prensagem de CD em todo o mundo.<br /><br />
    Contém informações completas do CD:<br />
    • Contagem de faixas, sequência, timecode<br />
    • Duração do gap entre faixas<br />
    • Códigos ISRC (Código Internacional de Gravação Normalizado)<br />
    • Dados de código de barras UPC / EAN<br />
    • Metadados completos da folha PQ para até 99 faixas<br />
    • Áudio PCM compatível com Red Book (44.1kHz, 16-bit estéreo)
  </>,
  es: <>
    DDP (Disc Description Protocol) es un formato binario de masterización desarrollado por Doug Carson & Associates.<br />
    Estándar industrial utilizado por discográficas y plantas de prensado de CD en todo el mundo.<br /><br />
    Contiene información completa del CD:<br />
    • Cantidad de pistas, secuencia, código de tiempo<br />
    • Duración del gap entre pistas<br />
    • Códigos ISRC (Código Internacional de Grabación Normalizado)<br />
    • Datos de código de barras UPC / EAN<br />
    • Metadatos completos de hoja PQ para hasta 99 pistas<br />
    • Audio PCM compatible con Red Book (44.1kHz, 16-bit estéreo)
  </>,
};

const BINARY_STRUCTURE_TITLE: L5 = {
  ja: 'バイナリ構造の解析',
  en: 'Binary Structure Analysis',
  ko: '바이너리 구조 분석',
  pt: 'Análise da Estrutura Binária',
  es: 'Análisis de la Estructura Binaria',
};

const BINARY_STRUCTURE: L5Node = {
  ja: <>
    DDP ファイルは複数の小さなファイルで構成されます。それぞれが異なる役割を持っています。<br /><br />
    <strong>DDPID ファイル：識別情報</strong><br />
    固定 128 バイト。CD マスターの識別子を格納。<br /><br />
    <strong>DDPMS ファイル：マップストリーム</strong><br />
    128 バイト単位のパケット。各データストリームの型・ポインタ・長さ・CD モード・トラック情報を含む。<br /><br />
    <strong>PQ ディスクリプタ：トラック・インデックス情報</strong><br />
    64 バイト単位の PQ パケット。各トラックのタイムコード、ISRC、UPC/EAN を含む。<br /><br />
    <strong>オーディオデータ：PCM 音声</strong><br />
    赤本仕様：44.1kHz, 16-bit, ステレオ。セクタサイズ 2,352 バイト（CD-DA 標準）。
  </>,
  en: <>
    DDP files are composed of multiple small files, each with a distinct purpose.<br /><br />
    <strong>DDPID File: Identification</strong><br />
    Fixed 128 bytes. Contains master identifier, version, UPC/EAN, master ID code.<br /><br />
    <strong>DDPMS File: Map Stream</strong><br />
    Packets of 128 bytes each. Specifies stream type, pointer, length, CD mode, and track metadata for each stream.<br /><br />
    <strong>PQ Descriptor: Track & Index Info</strong><br />
    PQ packets of 64 bytes. Contains timecode, ISRC code, and UPC/EAN for each track/index point.<br /><br />
    <strong>Audio Data: PCM Audio</strong><br />
    Red Book compliant: 44.1kHz, 16-bit, stereo. Sector size: 2,352 bytes (CD-DA standard).
  </>,
  ko: <>
    DDP 파일은 여러 개의 작은 파일로 구성되며, 각각 고유한 역할을 합니다.<br /><br />
    <strong>DDPID 파일: 식별 정보</strong><br />
    고정 128 바이트. CD 마스터의 식별자를 포함합니다.<br /><br />
    <strong>DDPMS 파일: 맵 스트림</strong><br />
    128 바이트 단위의 패킷. 각 데이터 스트림의 유형, 포인터, 길이, CD 모드, 트랙 정보를 포함합니다.<br /><br />
    <strong>PQ 디스크립터: 트랙 및 인덱스 정보</strong><br />
    64 바이트 단위의 PQ 패킷. 각 트랙의 타임코드, ISRC, UPC/EAN을 포함합니다.<br /><br />
    <strong>오디오 데이터: PCM 오디오</strong><br />
    Red Book 호환: 44.1kHz, 16-bit, 스테레오. 섹터 크기: 2,352바이트 (CD-DA 표준).
  </>,
  pt: <>
    Arquivos DDP são compostos de múltiplos arquivos pequenos, cada um com um propósito distinto.<br /><br />
    <strong>Arquivo DDPID: Identificação</strong><br />
    Fixo de 128 bytes. Contém identificador do master, versão, UPC/EAN, código ID do master.<br /><br />
    <strong>Arquivo DDPMS: Mapa Stream</strong><br />
    Pacotes de 128 bytes cada. Especifica tipo de stream, ponteiro, comprimento, modo CD e metadados de pista.<br /><br />
    <strong>Descritor PQ: Informações de Faixa & Índice</strong><br />
    Pacotes PQ de 64 bytes. Contém timecode, código ISRC e UPC/EAN para cada faixa/índice.<br /><br />
    <strong>Dados de Áudio: Áudio PCM</strong><br />
    Compatível com Red Book: 44.1kHz, 16-bit, estéreo. Tamanho de setor: 2.352 bytes (padrão CD-DA).
  </>,
  es: <>
    Los archivos DDP están compuestos de múltiples archivos pequeños, cada uno con un propósito distinto.<br /><br />
    <strong>Archivo DDPID: Identificación</strong><br />
    Fijo de 128 bytes. Contiene identificador del máster, versión, UPC/EAN, código ID del máster.<br /><br />
    <strong>Archivo DDPMS: Mapa Stream</strong><br />
    Paquetes de 128 bytes cada. Especifica tipo de stream, puntero, longitud, modo CD y metadatos de pista.<br /><br />
    <strong>Descriptor PQ: Información de Pista e Índice</strong><br />
    Paquetes PQ de 64 bytes. Contiene timecode, código ISRC y UPC/EAN para cada pista/índice.<br /><br />
    <strong>Datos de Áudio: Áudio PCM</strong><br />
    Compatible con Red Book: 44.1kHz, 16-bit, estéreo. Tamaño de sector: 2.352 bytes (estándar CD-DA).
  </>,
};

const TRACK_BUILDING_TITLE: L5 = {
  ja: 'トラック構築アルゴリズム',
  en: 'Track Building Algorithm',
  ko: '트랙 구축 알고리즘',
  pt: 'Algoritmo de Construção de Faixa',
  es: 'Algoritmo de Construcción de Pista',
};

const TRACK_BUILDING: L5Node = {
  ja: <>
    DDP の複数の PQ パケットを解析してひとつのトラックを構築するプロセス：<br /><br />
    <strong>1. Index Points の識別</strong><br />
    • Index 00：プリギャップ開始（音声なし）<br />
    • Index 01：音声開始（実際の演奏データ）<br />
    • Index 02～99：追加インデックスポイント（オプション）<br /><br />
    <strong>2. ギャップ計算</strong><br />
    前トラックの最後の Index 01 から、次トラックの Index 00 までの距離をセクタ数で計算。<br />
    標準では 2 秒（150 セクタ）ですが、特殊なマスタリングでは異なる場合があります。<br /><br />
    <strong>3. バイトオフセット計算</strong><br />
    セクタ数 × 2,352 バイト/セクタ = ファイル上のバイト位置<br /><br />
    <strong>4. タイムコード変換</strong><br />
    BCD エンコード（Binary-Coded Decimal）から MM:SS:FF（分:秒:フレーム）へ変換。<br />
    1 秒 = 75 フレーム（CD-DA 規格）
  </>,
  en: <>
    The process of parsing multiple DDP PQ packets and building a single track:<br /><br />
    <strong>1. Index Point Identification</strong><br />
    • Index 00: Pre-gap start (silent)<br />
    • Index 01: Audio start (actual performance data)<br />
    • Index 02–99: Additional index points (optional)<br /><br />
    <strong>2. Gap Calculation</strong><br />
    Distance from previous track's Index 01 to next track's Index 00, measured in sectors.<br />
    Standard is 2 seconds (150 sectors), but specialized masterings may differ.<br /><br />
    <strong>3. Byte Offset Calculation</strong><br />
    Sector count × 2,352 bytes/sector = file byte position<br /><br />
    <strong>4. Timecode Conversion</strong><br />
    BCD (Binary-Coded Decimal) → MM:SS:FF (minute:second:frame) conversion.<br />
    1 second = 75 frames (CD-DA spec)
  </>,
  ko: <>
    DDP의 여러 PQ 패킷을 분석하여 단일 트랙을 구축하는 프로세스:<br /><br />
    <strong>1. 인덱스 포인트 식별</strong><br />
    • Index 00: 프리갭 시작 (무음)<br />
    • Index 01: 오디오 시작 (실제 성능 데이터)<br />
    • Index 02~99: 추가 인덱스 포인트 (선택사항)<br /><br />
    <strong>2. 갭 계산</strong><br />
    이전 트랙의 Index 01에서 다음 트랙의 Index 00까지의 거리 (섹터 단위).<br />
    표준은 2초 (150섹터)이지만, 특수한 마스터링에서는 다를 수 있습니다.<br /><br />
    <strong>3. 바이트 오프셋 계산</strong><br />
    섹터 수 × 2,352 바이트/섹터 = 파일 바이트 위치<br /><br />
    <strong>4. 타임코드 변환</strong><br />
    BCD (Binary-Coded Decimal) → MM:SS:FF (분:초:프레임) 변환.<br />
    1초 = 75프레임 (CD-DA 규격)
  </>,
  pt: <>
    O processo de análise de múltiplos pacotes DDP PQ e construção de uma única faixa:<br /><br />
    <strong>1. Identificação de Pontos de Índice</strong><br />
    • Index 00: Início do pré-gap (silencioso)<br />
    • Index 01: Início do áudio (dados de performance real)<br />
    • Index 02–99: Pontos de índice adicionais (opcional)<br /><br />
    <strong>2. Cálculo do Gap</strong><br />
    Distância do Index 01 da faixa anterior ao Index 00 da próxima faixa, em setores.<br />
    Padrão é 2 segundos (150 setores), mas masterizações especializadas podem diferir.<br /><br />
    <strong>3. Cálculo de Offset de Bytes</strong><br />
    Contagem de setores × 2.352 bytes/setor = posição de byte do arquivo<br /><br />
    <strong>4. Conversão de Timecode</strong><br />
    BCD (Binary-Coded Decimal) → MM:SS:FF (minuto:segundo:frame).<br />
    1 segundo = 75 frames (especificação CD-DA)
  </>,
  es: <>
    El proceso de análisis de múltiples paquetes DDP PQ y construcción de una sola pista:<br /><br />
    <strong>1. Identificación de Puntos de Índice</strong><br />
    • Index 00: Inicio del pre-gap (silencioso)<br />
    • Index 01: Inicio del audio (datos de performance real)<br />
    • Index 02–99: Puntos de índice adicionales (opcional)<br /><br />
    <strong>2. Cálculo del Gap</strong><br />
    Distancia desde Index 01 de la pista anterior hasta Index 00 de la siguiente pista, en sectores.<br />
    Estándar es 2 segundos (150 sectores), pero masterizaciones especializadas pueden diferir.<br /><br />
    <strong>3. Cálculo de Offset de Bytes</strong><br />
    Conteo de sectores × 2.352 bytes/sector = posición de byte del archivo<br /><br />
    <strong>4. Conversión de Timecode</strong><br />
    BCD (Binary-Coded Decimal) → MM:SS:FF (minuto:segundo:frame).<br />
    1 segundo = 75 frames (especificación CD-DA)
  </>,
};

const AUDIO_EXTRACTION_TITLE: L5 = {
  ja: 'オーディオデータの抽出と再生',
  en: 'Audio Data Extraction & Playback',
  ko: '오디오 데이터 추출 및 재생',
  pt: 'Extração e Reprodução de Dados de Áudio',
  es: 'Extracción y Reproducción de Datos de Audio',
};

const AUDIO_EXTRACTION: L5Node = {
  ja: <>
    各トラックのオーディオデータは ArrayBuffer として メモリに読み込まれます。<br /><br />
    <strong>赤本仕様の遵守</strong><br />
    • サンプリング周波数：44.1 kHz（CD 標準）<br />
    • ビット深度：16-bit（符号付き）<br />
    • チャンネル：ステレオ（L/R）<br />
    • バイトオーダー：リトルエンディアン<br /><br />
    <strong>トラック分離</strong><br />
    DDP ファイルの全 PCM データから、各トラックのバイト範囲を `ArrayBuffer.slice()` で抽出。<br />
    先頭トラック：バイト 0 からトラック長まで<br />
    以降のトラック：前トラックの終了位置 + ギャップサイズ からスタート。<br /><br />
    <strong>Web Audio API との連携</strong><br />
    抽出した ArrayBuffer を `AudioContext.decodeAudioData()` で WAV/PCM に復号化。<br />
    AudioBuffer が生成され、ブラウザの `&lt;audio&gt;` タグで再生可能な状態に。<br /><br />
    <strong>リアルタイムアナライザー</strong><br />
    Web Audio API の AnalyserNode を使用し、再生中のリアルタイム波形・スペクトラム可視化が可能。
  </>,
  en: <>
    Audio data for each track is loaded into memory as an ArrayBuffer.<br /><br />
    <strong>Red Book Compliance</strong><br />
    • Sample rate: 44.1 kHz (CD standard)<br />
    • Bit depth: 16-bit (signed)<br />
    • Channels: Stereo (L/R)<br />
    • Byte order: Little-endian<br /><br />
    <strong>Track Separation</strong><br />
    Each track's byte range is extracted from the full PCM data using `ArrayBuffer.slice()`.<br />
    First track: bytes 0 to track length<br />
    Subsequent tracks: end of previous track + gap size.<br /><br />
    <strong>Web Audio API Integration</strong><br />
    The extracted ArrayBuffer is decoded via `AudioContext.decodeAudioData()` into playable format.<br />
    An AudioBuffer is generated, ready for browser `&lt;audio&gt;` playback or raw access.<br /><br />
    <strong>Real-time Visualization</strong><br />
    Using Web Audio API's AnalyserNode, real-time waveform and frequency spectrum visualization is possible during playback.
  </>,
  ko: <>
    각 트랙의 오디오 데이터는 메모리에 ArrayBuffer로 로드됩니다.<br /><br />
    <strong>Red Book 준수</strong><br />
    • 샘플링 레이트: 44.1 kHz (CD 표준)<br />
    • 비트 깊이: 16-bit (부호 있음)<br />
    • 채널: 스테레오 (L/R)<br />
    • 바이트 오더: 리틀 엔디안<br /><br />
    <strong>트랙 분리</strong><br />
    `ArrayBuffer.slice()`를 사용하여 전체 PCM 데이터에서 각 트랙의 바이트 범위를 추출합니다.<br />
    첫 번째 트랙: 바이트 0에서 트랙 길이까지<br />
    이후 트랙: 이전 트랙의 끝 + 갭 크기에서 시작.<br /><br />
    <strong>Web Audio API 통합</strong><br />
    추출된 ArrayBuffer는 `AudioContext.decodeAudioData()`를 통해 재생 가능한 형식으로 디코딩됩니다.<br />
    AudioBuffer가 생성되어 브라우저 &lt;audio&gt; 재생에 준비됩니다.<br /><br />
    <strong>실시간 시각화</strong><br />
    Web Audio API의 AnalyserNode를 사용하여 재생 중 실시간 파형 및 주파수 스펙트럼 시각화가 가능합니다.
  </>,
  pt: <>
    Os dados de áudio de cada faixa são carregados na memória como um ArrayBuffer.<br /><br />
    <strong>Conformidade Red Book</strong><br />
    • Taxa de amostragem: 44.1 kHz (padrão CD)<br />
    • Profundidade de bits: 16-bit (com sinal)<br />
    • Canais: Estéreo (L/R)<br />
    • Ordem de bytes: Little-endian<br /><br />
    <strong>Separação de Faixas</strong><br />
    Cada intervalo de bytes da faixa é extraído dos dados PCM completos usando `ArrayBuffer.slice()`.<br />
    Primeira faixa: bytes 0 até comprimento da faixa<br />
    Faixas subsequentes: fim da faixa anterior + tamanho do gap.<br /><br />
    <strong>Integração Web Audio API</strong><br />
    O ArrayBuffer extraído é decodificado via `AudioContext.decodeAudioData()` em formato reproduzível.<br />
    Um AudioBuffer é gerado, pronto para reprodução no navegador &lt;audio&gt;.<br /><br />
    <strong>Visualização em Tempo Real</strong><br />
    Usando o AnalyserNode da Web Audio API, é possível visualizar forma de onda e espectro de frequência em tempo real.
  </>,
  es: <>
    Los datos de audio de cada pista se cargan en la memoria como un ArrayBuffer.<br /><br />
    <strong>Cumplimiento Red Book</strong><br />
    • Frecuencia de muestreo: 44.1 kHz (estándar CD)<br />
    • Profundidad de bits: 16-bit (con signo)<br />
    • Canales: Estéreo (L/R)<br />
    • Orden de bytes: Little-endian<br /><br />
    <strong>Separación de Pistas</strong><br />
    El rango de bytes de cada pista se extrae del datos PCM completo usando `ArrayBuffer.slice()`.<br />
    Primera pista: bytes 0 a longitud de la pista<br />
    Pistas posteriores: fin de la pista anterior + tamaño del gap.<br /><br />
    <strong>Integración Web Audio API</strong><br />
    El ArrayBuffer extraído se decodifica a través de `AudioContext.decodeAudioData()` en formato reproducible.<br />
    Se genera un AudioBuffer, listo para reproducción en navegador &lt;audio&gt;.<br /><br />
    <strong>Visualización en Tiempo Real</strong><br />
    Usando AnalyserNode de Web Audio API, es posible visualizar forma de onda y espectro de frecuencia en tiempo real.
  </>,
};

const GAP_LISTEN_TITLE: L5 = {
  ja: 'ギャップリッスン機能',
  en: 'Gap Listen Feature',
  ko: '갭 리스닝 기능',
  pt: 'Recurso de Audição de Gap',
  es: 'Función Gap Listen',
};

const GAP_LISTEN: L5Node = {
  ja: <>
    KUON DDP チェッカーの最大の特徴：前のトラックの最後と次のトラックの最初を繋いで、曲間を自然に聞く機能。<br /><br />
    <strong>実装方法</strong><br />
    • 前トラック：最後の 15 秒を抽出<br />
    • 曲間：完全な無音ギャップ（マスタリング意図を保持）<br />
    • 次トラック：最初の 5 秒を抽出<br />
    • 連続再生：3 つのセグメントをシームレスに OfflineAudioContext で処理。<br /><br />
    <strong>なぜ重要か</strong><br />
    CD マスタリング時、エンジニアはギャップの長さを非常に慎重に設定します。<br />
    標準の 2 秒ではなく、楽曲の性質やコンセプトに応じて 1.5 秒だったり 3 秒だったりします。<br /><br />
    従来のプレーヤーではギャップを聞く手段がありません。<br />
    KUON のギャップリッスンなら、マスタリングエンジニアが意図した「音と音の繋がり」を検証できます。
  </>,
  en: <>
    The signature feature of KUON DDP Checker: seamless transition playback that connects the end of one track to the beginning of the next, allowing natural listening across the gap.<br /><br />
    <strong>Implementation</strong><br />
    • Previous track: last 15 seconds extracted<br />
    • Gap: complete silence (preserving mastering intent)<br />
    • Next track: first 5 seconds extracted<br />
    • Seamless playback: all three segments processed in OfflineAudioContext.<br /><br />
    <strong>Why It Matters</strong><br />
    During CD mastering, engineers set gap length with extreme care.<br />
    It may be 1.5 seconds, 2 seconds (standard), or 3+ seconds depending on song character and album concept.<br /><br />
    Conventional players offer no way to hear gaps.<br />
    With KUON Gap Listen, mastering engineers can verify the sonic continuity they intended between songs.
  </>,
  ko: <>
    KUON DDP 체커의 최대 특징: 이전 트랙의 끝과 다음 트랙의 시작을 연결하여 곡간을 자연스럽게 듣는 기능입니다.<br /><br />
    <strong>구현 방법</strong><br />
    • 이전 트랙: 마지막 15초 추출<br />
    • 곡간: 완전한 무음 갭 (마스터링 의도 보존)<br />
    • 다음 트랙: 첫 5초 추출<br />
    • 연속 재생: OfflineAudioContext에서 3개 세그먼트를 매끄럽게 처리.<br /><br />
    <strong>중요한 이유</strong><br />
    CD 마스터링 시 엔지니어는 갭 길이를 매우 신중하게 설정합니다.<br />
    표준 2초가 아니라 곡의 성질과 앨범 컨셉에 따라 1.5초 또는 3초 이상이 될 수 있습니다.<br /><br />
    기존 플레이어에서는 갭을 들을 수 있는 방법이 없습니다.<br />
    KUON Gap Listen을 사용하면 마스터링 엔지니어가 의도한 "곡과 곡 사이의 연결"을 검증할 수 있습니다.
  </>,
  pt: <>
    O recurso de assinatura do KUON DDP Checker: reprodução de transição contínua que conecta o final de uma faixa ao início da próxima, permitindo audição natural entre o gap.<br /><br />
    <strong>Implementação</strong><br />
    • Faixa anterior: últimos 15 segundos extraídos<br />
    • Gap: silêncio completo (preservando intenção de masterização)<br />
    • Próxima faixa: primeiros 5 segundos extraídos<br />
    • Reprodução contínua: todos os três segmentos processados em OfflineAudioContext.<br /><br />
    <strong>Por Que Importa</strong><br />
    Durante a masterização de CD, os engenheiros definem o comprimento do gap com extremo cuidado.<br />
    Pode ser 1,5 segundos, 2 segundos (padrão) ou 3+ segundos dependendo do caráter da música e conceito do álbum.<br /><br />
    Players convencionais não oferecem forma de ouvir gaps.<br />
    Com KUON Gap Listen, engenheiros de masterização podem verificar a continuidade sônica que pretenderam entre as músicas.
  </>,
  es: <>
    La característica distintiva de KUON DDP Checker: reproducción de transición sin interrupciones que conecta el final de una pista con el inicio de la siguiente, permitiendo una audición natural a través del gap.<br /><br />
    <strong>Implementación</strong><br />
    • Pista anterior: últimos 15 segundos extraídos<br />
    • Gap: silencio completo (preservando intención de masterización)<br />
    • Siguiente pista: primeros 5 segundos extraídos<br />
    • Reproducción continua: los tres segmentos procesados en OfflineAudioContext.<br /><br />
    <strong>Por Qué Importa</strong><br />
    Durante la masterización de CD, los ingenieros establecen la duración del gap con extremo cuidado.<br />
    Puede ser 1,5 segundos, 2 segundos (estándar) o 3+ segundos dependiendo del carácter de la canción y concepto del álbum.<br /><br />
    Los reproductores convencionales no ofrecen forma de escuchar gaps.<br />
    Con KUON Gap Listen, los ingenieros de masterización pueden verificar la continuidad sónica que pretendieron entre canciones.
  </>,
};

const PRIVACY_TITLE: L5 = {
  ja: 'プライバシーとセキュリティ',
  en: 'Privacy & Security',
  ko: '프라이버시 및 보안',
  pt: 'Privacidade e Segurança',
  es: 'Privacidad y Seguridad',
};

const PRIVACY: L5Node = {
  ja: <>
    DDP Checker のすべての処理は、ユーザーのブラウザ内で完結します。<br /><br />
    <strong>サーバーへの送信：0</strong><br />
    DDP ファイルはサーバーにアップロードされません。<br />
    ファイル API と ArrayBuffer を使用して、ローカルメモリのみで処理。<br /><br />
    <strong>通信履歴：なし</strong><br />
    ネットワークトラフィックが生じるのは Web ページの読み込み時のみ。<br />
    DDP 解析・再生時は通信なし。<br /><br />
    <strong>データ永続性：なし</strong><br />
    ファイルの内容は localStorage や IndexedDB に保存されません。<br />
    ブラウザを閉じると全て削除。<br /><br />
    <strong>メタデータのみ保存（オプション）</strong><br />
    ユーザーが明示的に「メタデータを保存」を選択した場合のみ、<br />
    トラック名・タイムコードなどの基本情報が localStorage に保存されます。<br />
    オーディオデータやマスター ID は保存されません。
  </>,
  en: <>
    All DDP Checker processing happens entirely within your browser.<br /><br />
    <strong>Server Upload: Zero</strong><br />
    DDP files never reach our servers.<br />
    Using File API and ArrayBuffer, processing happens only in local memory.<br /><br />
    <strong>Network History: None</strong><br />
    Network traffic occurs only on page load.<br />
    During DDP parsing and playback, zero network activity.<br /><br />
    <strong>Data Persistence: None</strong><br />
    File contents are not saved to localStorage or IndexedDB.<br />
    Everything is cleared when you close the browser.<br /><br />
    <strong>Metadata Only (Optional)</strong><br />
    Only if you explicitly choose "Save Metadata," basic info like track names and timecodes<br />
    are saved to localStorage—never audio data or master IDs.
  </>,
  ko: <>
    모든 DDP Checker 처리는 브라우저 내에서 완전히 수행됩니다.<br /><br />
    <strong>서버 업로드: 0</strong><br />
    DDP 파일은 서버로 전송되지 않습니다.<br />
    File API와 ArrayBuffer를 사용하여 로컬 메모리에서만 처리합니다.<br /><br />
    <strong>네트워크 기록: 없음</strong><br />
    네트워크 트래픽은 웹 페이지 로드 시에만 발생합니다.<br />
    DDP 분석 및 재생 중에는 통신이 없습니다.<br /><br />
    <strong>데이터 지속성: 없음</strong><br />
    파일 내용은 localStorage 또는 IndexedDB에 저장되지 않습니다.<br />
    브라우저를 닫으면 모두 삭제됩니다.<br /><br />
    <strong>메타데이터만 저장 (선택사항)</strong><br />
    명시적으로 "메타데이터 저장"을 선택한 경우에만<br />
    트랙 이름 및 타임코드와 같은 기본 정보가 localStorage에 저장됩니다.
  </>,
  pt: <>
    Todo o processamento do DDP Checker acontece inteiramente no seu navegador.<br /><br />
    <strong>Upload de Servidor: Zero</strong><br />
    Arquivos DDP nunca chegam aos nossos servidores.<br />
    Usando File API e ArrayBuffer, processamento acontece apenas na memória local.<br /><br />
    <strong>Histórico de Rede: Nenhum</strong><br />
    Tráfego de rede ocorre apenas no carregamento da página.<br />
    Durante análise e reprodução de DDP, zero atividade de rede.<br /><br />
    <strong>Persistência de Dados: Nenhuma</strong><br />
    Conteúdos do arquivo não são salvos em localStorage ou IndexedDB.<br />
    Tudo é apagado quando você fecha o navegador.<br /><br />
    <strong>Apenas Metadados (Opcional)</strong><br />
    Somente se você escolher explicitamente "Salvar Metadados," informações básicas como nomes de faixas<br />
    e timecodes são salvos em localStorage—nunca dados de áudio ou IDs de master.
  </>,
  es: <>
    Todo el procesamiento de DDP Checker sucede completamente dentro de tu navegador.<br /><br />
    <strong>Carga de Servidor: Cero</strong><br />
    Los archivos DDP nunca llegan a nuestros servidores.<br />
    Usando File API y ArrayBuffer, el procesamiento ocurre solo en memoria local.<br /><br />
    <strong>Historial de Red: Ninguno</strong><br />
    El tráfico de red ocurre solo en la carga de página.<br />
    Durante análisis y reproducción de DDP, cero actividad de red.<br /><br />
    <strong>Persistencia de Datos: Ninguna</strong><br />
    El contenido del archivo no se guarda en localStorage o IndexedDB.<br />
    Todo se borra cuando cierras el navegador.<br /><br />
    <strong>Solo Metadatos (Opcional)</strong><br />
    Solo si eliges explícitamente "Guardar Metadatos," información básica como nombres de pistas<br />
    y timecodes se guardan en localStorage—nunca datos de audio o IDs de master.
  </>,
};

const CTA_SECTION: L5Node = {
  ja: <>
    DDP Checker を試す → <Link href="/ddp-checker" style={{ color: ACCENT, textDecoration: 'underline' }}>DDP チェッカーを開く</Link><br />
    別の記事を読む → <Link href="/how-it-works/dsd" style={{ color: ACCENT, textDecoration: 'underline' }}>DSD コンバーターの仕組み</Link>
  </>,
  en: <>
    Try DDP Checker → <Link href="/ddp-checker" style={{ color: ACCENT, textDecoration: 'underline' }}>Open DDP Checker</Link><br />
    Read another article → <Link href="/how-it-works/dsd" style={{ color: ACCENT, textDecoration: 'underline' }}>How DSD Converter Works</Link>
  </>,
  ko: <>
    DDP Checker 시도해보기 → <Link href="/ddp-checker" style={{ color: ACCENT, textDecoration: 'underline' }}>DDP 체커 열기</Link><br />
    다른 기사 읽기 → <Link href="/how-it-works/dsd" style={{ color: ACCENT, textDecoration: 'underline' }}>DSD 컨버터의 작동 원리</Link>
  </>,
  pt: <>
    Experimente DDP Checker → <Link href="/ddp-checker" style={{ color: ACCENT, textDecoration: 'underline' }}>Abrir DDP Checker</Link><br />
    Leia outro artigo → <Link href="/how-it-works/dsd" style={{ color: ACCENT, textDecoration: 'underline' }}>Como o Conversor DSD Funciona</Link>
  </>,
  es: <>
    Prueba DDP Checker → <Link href="/ddp-checker" style={{ color: ACCENT, textDecoration: 'underline' }}>Abrir DDP Checker</Link><br />
    Lee otro artículo → <Link href="/how-it-works/dsd" style={{ color: ACCENT, textDecoration: 'underline' }}>Cómo Funciona el Conversor DSD</Link>
  </>,
};

// ─────────────────────────────────────────────
// Main page component
// ─────────────────────────────────────────────
export default function DDPHowItWorksPage() {
  const { lang } = useLang();

  const r1 = useReveal();
  const r2 = useReveal();
  const r3 = useReveal();
  const r4 = useReveal();
  const r5 = useReveal();
  const r6 = useReveal();
  const r7 = useReveal();

  const sectionTitle: React.CSSProperties = {
    fontFamily: serif,
    fontSize: 'clamp(1.6rem, 3vw, 2rem)',
    fontWeight: 400,
    letterSpacing: '0.08em',
    color: '#111',
    marginBottom: 'clamp(1.5rem, 2.5vw, 2rem)',
    lineHeight: 1.5,
  };

  const bodyText: React.CSSProperties = {
    fontFamily: serif,
    fontSize: 'clamp(0.9rem, 1.1vw, 1rem)',
    lineHeight: 1.9,
    color: '#333',
    letterSpacing: '0.02em',
  };

  return (
    <div style={{ background: '#fafafa', minHeight: '100vh' }}>

      {/* ═══ HERO ═══ */}
      <section style={{
        padding: 'clamp(5rem, 10vw, 8rem) clamp(1.5rem, 5vw, 4rem) clamp(3rem, 6vw, 5rem)',
        background: 'linear-gradient(135deg, rgba(2,132,199,0.05) 0%, rgba(255,255,255,0.5) 100%)',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
      }}>
        <div ref={r1.ref} style={r1.style}>
          <h1 style={{
            fontFamily: serif,
            fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
            fontWeight: 300,
            letterSpacing: '0.1em',
            color: '#111',
            marginBottom: '1rem',
            lineHeight: 1.3,
          }}>
            {t(HERO_TITLE, lang)}
          </h1>
          <p style={{
            fontFamily: serif,
            fontSize: 'clamp(1rem, 1.2vw, 1.1rem)',
            color: '#666',
            lineHeight: 1.8,
            maxWidth: 700,
          }}>
            {t(HERO_SUBTITLE, lang)}
          </p>
        </div>
      </section>

      {/* ═══ WHAT IS DDP ═══ */}
      <section style={{ padding: 'clamp(4rem, 8vw, 6rem) clamp(1.5rem, 5vw, 4rem)', background: '#fff' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div ref={r2.ref} style={r2.style}>
            <h2 style={sectionTitle}>{t(WHAT_IS_DDP_TITLE, lang)}</h2>
            <div style={bodyText}>
              {tn(WHAT_IS_DDP, lang)}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BINARY STRUCTURE ═══ */}
      <section style={{ padding: 'clamp(4rem, 8vw, 6rem) clamp(1.5rem, 5vw, 4rem)', background: '#fafafa' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div ref={r3.ref} style={r3.style}>
            <h2 style={sectionTitle}>{t(BINARY_STRUCTURE_TITLE, lang)}</h2>
            <div style={bodyText}>
              {tn(BINARY_STRUCTURE, lang)}
            </div>

            {/* Byte diagram */}
            <div style={{ marginTop: '2.5rem' }}>
              <ByteDiagram
                label={t({ ja: 'DDPID 構造（128 バイト）', en: 'DDPID Structure (128 bytes)', ko: 'DDPID 구조 (128 바이트)', pt: 'Estrutura DDPID (128 bytes)', es: 'Estructura DDPID (128 bytes)' }, lang)}
                bytes={[
                  { offset: 0, length: 8, label: 'Version', color: '#0284c7' },
                  { offset: 8, length: 13, label: 'UPC/EAN', color: '#06b6d4' },
                  { offset: 38, length: 48, label: 'Master ID', color: '#0ea5e9' },
                ]}
              />
              <ByteDiagram
                label={t({ ja: 'DDPMS パケット（128 バイト）', en: 'DDPMS Packet (128 bytes)', ko: 'DDPMS 패킷 (128 바이트)', pt: 'Pacote DDPMS (128 bytes)', es: 'Paquete DDPMS (128 bytes)' }, lang)}
                bytes={[
                  { offset: 0, length: 2, label: 'Type', color: '#7c3aed' },
                  { offset: 2, length: 6, label: 'Pointer', color: '#a855f7' },
                  { offset: 8, length: 4, label: 'Length', color: '#d946ef' },
                  { offset: 12, length: 1, label: 'CD Mode', color: '#ec4899' },
                  { offset: 13, length: 1, label: 'Track', color: '#f43f5e' },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TRACK BUILDING ═══ */}
      <section style={{ padding: 'clamp(4rem, 8vw, 6rem) clamp(1.5rem, 5vw, 4rem)', background: '#fff' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div ref={r4.ref} style={r4.style}>
            <h2 style={sectionTitle}>{t(TRACK_BUILDING_TITLE, lang)}</h2>
            <div style={bodyText}>
              {tn(TRACK_BUILDING, lang)}
            </div>

            {/* Code example */}
            <CodeBlock
              code={`// Timecode conversion (BCD → MM:SS:FF)
function parseBCDTimecode(minutes: number, seconds: number, frames: number): string {
  const m = ((minutes >> 4) * 10) + (minutes & 0x0F);
  const s = ((seconds >> 4) * 10) + (seconds & 0x0F);
  const f = ((frames >> 4) * 10) + (frames & 0x0F);
  return \`\${m.toString().padStart(2, '0')}:\${s.toString().padStart(2, '0')}:\${f.toString().padStart(2, '0')}\`;
}

// Byte offset calculation
const sectorSize = 2352; // bytes per CD sector
const byteOffset = sectorNumber * sectorSize;`}
              lang="TypeScript"
            />
          </div>
        </div>
      </section>

      {/* ═══ AUDIO EXTRACTION ═══ */}
      <section style={{ padding: 'clamp(4rem, 8vw, 6rem) clamp(1.5rem, 5vw, 4rem)', background: '#fafafa' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div ref={r5.ref} style={r5.style}>
            <h2 style={sectionTitle}>{t(AUDIO_EXTRACTION_TITLE, lang)}</h2>
            <div style={bodyText}>
              {tn(AUDIO_EXTRACTION, lang)}
            </div>

            <CodeBlock
              code={`// Extract track audio from DDP file
function extractTrackAudio(
  buffer: ArrayBuffer,
  startSector: number,
  endSector: number
): ArrayBuffer {
  const sectorSize = 2352;
  const startByte = startSector * sectorSize;
  const endByte = endSector * sectorSize;
  return buffer.slice(startByte, endByte);
}

// Decode to playable format
async function decodeAudio(
  context: AudioContext,
  arrayBuffer: ArrayBuffer
): Promise<AudioBuffer> {
  return await context.decodeAudioData(arrayBuffer);
}`}
              lang="TypeScript"
            />
          </div>
        </div>
      </section>

      {/* ═══ GAP LISTEN ═══ */}
      <section style={{ padding: 'clamp(4rem, 8vw, 6rem) clamp(1.5rem, 5vw, 4rem)', background: '#fff' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div ref={r6.ref} style={r6.style}>
            <h2 style={sectionTitle}>{t(GAP_LISTEN_TITLE, lang)}</h2>
            <div style={bodyText}>
              {tn(GAP_LISTEN, lang)}
            </div>

            {/* Visual gap listen diagram */}
            <div style={{
              marginTop: '2.5rem',
              padding: '1.5rem',
              background: 'linear-gradient(to right, rgba(2,132,199,0.1), rgba(245,158,11,0.1))',
              borderRadius: 8,
              border: `1px solid ${ACCENT}22`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{
                  flex: '1 1 100px',
                  textAlign: 'center',
                  padding: '1rem',
                  background: 'rgba(2,132,199,0.1)',
                  borderRadius: 6,
                }}>
                  <div style={{ fontFamily: sans, fontSize: '0.7rem', color: '#666', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
                    {t({ ja: 'トラック1\n最後15秒', en: 'Track 1\nLast 15s', ko: '트랙 1\n마지막 15초', pt: 'Faixa 1\nÚltimos 15s', es: 'Pista 1\nÚltimos 15s' }, lang).split('\n').join(' ')}
                  </div>
                  <span style={{ fontFamily: mono, fontSize: '0.8rem', color: ACCENT, fontWeight: 600 }}>■■■</span>
                </div>
                <div style={{ fontSize: '1.2rem', color: '#999' }}>→</div>
                <div style={{
                  flex: '0.5 1 60px',
                  textAlign: 'center',
                  padding: '1rem',
                  background: 'rgba(107,114,128,0.1)',
                  borderRadius: 6,
                }}>
                  <div style={{ fontFamily: sans, fontSize: '0.7rem', color: '#999', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
                    {t({ ja: 'ギャップ\n自然な\n無音', en: 'Gap\nSilence', ko: '갭\n무음', pt: 'Gap\nSilêncio', es: 'Gap\nSilencio' }, lang).split('\n').join(' ')}
                  </div>
                  <span style={{ fontFamily: mono, fontSize: '0.8rem', color: '#999', fontWeight: 600 }}>──</span>
                </div>
                <div style={{ fontSize: '1.2rem', color: '#999' }}>→</div>
                <div style={{
                  flex: '1 1 100px',
                  textAlign: 'center',
                  padding: '1rem',
                  background: 'rgba(245,158,11,0.1)',
                  borderRadius: 6,
                }}>
                  <div style={{ fontFamily: sans, fontSize: '0.7rem', color: '#666', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
                    {t({ ja: 'トラック2\n最初5秒', en: 'Track 2\nFirst 5s', ko: '트랙 2\n첫 5초', pt: 'Faixa 2\nPrimeiros 5s', es: 'Pista 2\nPrimeros 5s' }, lang).split('\n').join(' ')}
                  </div>
                  <span style={{ fontFamily: mono, fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600 }}>■■■</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PRIVACY & SECURITY ═══ */}
      <section style={{ padding: 'clamp(4rem, 8vw, 6rem) clamp(1.5rem, 5vw, 4rem)', background: '#fafafa' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div ref={r7.ref} style={r7.style}>
            <h2 style={sectionTitle}>{t(PRIVACY_TITLE, lang)}</h2>
            <div style={bodyText}>
              {tn(PRIVACY, lang)}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER CTA ═══ */}
      <section style={{
        padding: 'clamp(4rem, 8vw, 6rem) clamp(1.5rem, 5vw, 4rem)',
        background: 'linear-gradient(135deg, rgba(2,132,199,0.05) 0%, rgba(255,255,255,0.5) 100%)',
        borderTop: '1px solid rgba(0,0,0,0.05)',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{
            textAlign: 'center',
            background: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(16px)',
            padding: 'clamp(2rem, 4vw, 3rem)',
            borderRadius: 12,
            border: '1px solid rgba(2,132,199,0.1)',
          }}>
            <p style={{
              fontFamily: serif,
              fontSize: 'clamp(0.95rem, 1.1vw, 1.05rem)',
              color: '#333',
              lineHeight: 2,
              margin: 0,
            }}>
              {tn(CTA_SECTION, lang)}
            </p>

            <div style={{ marginTop: 'clamp(2rem, 3vw, 2.5rem)' }}>
              <Link href="/" style={{
                fontFamily: sans,
                fontSize: '0.8rem',
                color: '#999',
                textDecoration: 'none',
                letterSpacing: '0.1em',
              }}>
                {t({ ja: '← トップに戻る', en: '← Back to Top', ko: '← 홈으로', pt: '← Voltar ao Início', es: '← Volver al Inicio' }, lang)}
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
