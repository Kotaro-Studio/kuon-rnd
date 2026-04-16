"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const AUDIO_BASE = 'https://kuon-rnd-audio-worker.369-1d5.workers.dev/api/audio';
const ACCENT = '#0284c7';
const serif  = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans   = '"Helvetica Neue", Arial, sans-serif';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type T5 = Record<Lang, string>;

// ─────────────────────────────────────────────
// Style helpers
// ─────────────────────────────────────────────

const ctaPrimary = (size: 'lg' | 'md' | 'sm' = 'md'): CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  textDecoration: 'none', color: '#fff',
  fontFamily: sans, backgroundColor: ACCENT,
  fontSize: size === 'lg' ? 'clamp(0.95rem,1.5vw,1.1rem)' : size === 'sm' ? '0.82rem' : '0.9rem',
  letterSpacing: '0.12em',
  padding: size === 'lg' ? 'clamp(1.2rem,2.5vw,1.6rem) clamp(3rem,6vw,6rem)' : size === 'sm' ? '0.8rem 2rem' : '1.1rem 3rem',
  borderRadius: '50px',
  boxShadow: '0 8px 28px rgba(2,132,199,0.3)',
  transition: 'all 0.3s ease', cursor: 'pointer', whiteSpace: 'nowrap',
  border: 'none',
});

const ctaOutline = (size: 'md' | 'sm' = 'md'): CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  textDecoration: 'none', color: ACCENT,
  fontFamily: sans, backgroundColor: 'rgba(255,255,255,0.85)',
  fontSize: size === 'sm' ? '0.82rem' : '0.9rem',
  letterSpacing: '0.12em',
  padding: size === 'sm' ? '0.8rem 2rem' : '1.1rem 3rem',
  borderRadius: '50px', border: `1px solid rgba(2,132,199,0.35)`,
  backdropFilter: 'blur(8px)', transition: 'all 0.3s ease',
  cursor: 'pointer', whiteSpace: 'nowrap',
});

const glass: CSSProperties = {
  backgroundColor: 'rgba(255,255,255,0.85)',
  backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
  borderRadius: '20px', border: '1px solid rgba(255,255,255,1)',
  boxShadow: '0 12px 40px rgba(0,0,0,0.05)',
};

const imgWrap: CSSProperties = {
  borderRadius: '14px', overflow: 'hidden',
  border: '3px solid rgba(255,255,255,0.9)',
  boxShadow: '0 12px 32px rgba(0,0,0,0.07)',
  transition: 'transform 0.45s cubic-bezier(0.2,0.8,0.4,1), box-shadow 0.45s ease',
};

// ─────────────────────────────────────────────
// Data – Comparison tracks
// ─────────────────────────────────────────────
type CompareTrack = {
  id: 'A' | 'B' | 'C';
  file: string;
  revealName: T5;
  revealPrice: T5;
  recorder: string;
  isHero: boolean;
};

const COMPARE: CompareTrack[] = [
  { id:'A', file:'hikaku/DPA4006_F6.mp3',
    revealName: { ja:'DPA 4006', en:'DPA 4006', es:'DPA 4006' },
    revealPrice: { ja:'総額 ¥700,000 超', en:'Total $7,000+', es:'Total $7,000+' },
    recorder:'Zoom F6', isHero:false },
  { id:'B', file:'hikaku/P-86S_DR05.mp3',
    revealName: { ja:'P-86S by 空音開発', en:'P-86S by Kuon R&D', es:'P-86S de Kuon R&D' },
    revealPrice: { ja:'¥13,900（税込）', en:'¥13,900', es:'¥13,900' },
    recorder:'Zoom DR-05', isHero:true },
  { id:'C', file:'hikaku/X-86S_F6 M.mp3',
    revealName: { ja:'X-86S by 空音開発', en:'X-86S by Kuon R&D', es:'X-86S de Kuon R&D' },
    revealPrice: { ja:'¥39,600（税込）', en:'¥39,600', es:'¥39,600' },
    recorder:'Zoom F6', isHero:false },
];

// ─────────────────────────────────────────────
// Data – Music sample tracks
// ─────────────────────────────────────────────
type SampleTrack = {
  id:string; file:string; label:T5; desc:T5;
  mic:'P-86S'|'X-86S'; category:'music'|'field';
  recorder?:string; group?:string;
};
const SAMPLES: SampleTrack[] = [
  // ── P-86S プラグインパワー × 音楽収録 ────────────────────
  { id:'sax-gt',      file:'SAX + GT TASCAM sample.mp3',  mic:'P-86S', category:'music', recorder:'TASCAM',
    label:{ ja:'テナーサックス × ギター', en:'Tenor Sax & Guitar', es:'Saxofón & Guitarra' },
    desc:{ ja:'テナーサックスとギターのデュオ。ふたつの音色の絡み合いを自然な残響とともに。', en:'Tenor sax & guitar duo — two voices intertwining with natural reverb.', es:'Dúo de saxofón y guitarra en reverberación natural.' } },
  { id:'violin',      file:'バイオリンソロ.mp3',             mic:'P-86S', category:'music', recorder:'TASCAM',
    label:{ ja:'バイオリン ソロ', en:'Violin Solo', es:'Solo de Violín' },
    desc:{ ja:'弦の艶、弓の呼吸、空間の残響——バイオリンの全てを無指向性ペアで記録。', en:'Strings, bow articulation, and spatial reverb — all captured by the omnidirectional pair.', es:'Cuerdas, arco y reverberación — todo captado.' } },
  { id:'grand-piano', file:'グランドピアノ.mp3',            mic:'P-86S', category:'music', recorder:'TASCAM', group:'フルコンサートグランドピアノ',
    label:{ ja:'グランドピアノ', en:'Grand Piano', es:'Piano de Cola' },
    desc:{ ja:'フルコンサートグランドの広大なダイナミックレンジ。無指向性ペアが余すところなく捉える。', en:'Full concert grand — the entire dynamic range captured by omnidirectional stereo.', es:'Piano de cola completo — amplio rango dinámico.' } },
  { id:'battlefield', file:'戦場のピアニスト.mp3',           mic:'P-86S', category:'music', recorder:'TASCAM', group:'YAMAHA S400B',
    label:{ ja:'戦場のピアニスト', en:'The Pianist', es:'El Pianista' },
    desc:{ ja:'ポランスキー映画の名曲を YAMAHA S400B グランドピアノで。情感と静寂が交差する。', en:"Polanski's masterpiece on a YAMAHA S400B grand piano — emotion and silence intersecting.", es:'Obra maestra de Polanski en piano de cola YAMAHA S400B.' } },
  { id:'chopin',      file:'ショパンワルツ9番op69-1.mp3',   mic:'P-86S', category:'music', recorder:'TASCAM', group:'YAMAHA S400B',
    label:{ ja:'ショパン ワルツ第9番', en:'Chopin Waltz No.9', es:'Vals Chopin N.°9' },
    desc:{ ja:'YAMAHA S400B グランドピアノで演奏。繊細なタッチと自然な残響。', en:'YAMAHA S400B grand piano — delicate touch in natural reverb.', es:'Piano de cola YAMAHA S400B — toque delicado.' } },
  { id:'mozart',      file:'モーツァルト メヌエット.mp3',   mic:'P-86S', category:'music', recorder:'TASCAM', group:'YAMAHA S400B',
    label:{ ja:'モーツァルト メヌエット', en:'Mozart Menuet', es:'Minueto Mozart' },
    desc:{ ja:'古典派の典雅さ。YAMAHA S400B の音色と自然空間が響き合う。', en:'Classical elegance — YAMAHA S400B tone in natural acoustic space.', es:'Elegancia clásica — YAMAHA S400B en espacio acústico natural.' } },
  // ── X-86S ミニXLR版 × 音楽収録 ──────────────────────────
  { id:'handel',      file:'ヘンデル組曲ニ短調.mp3',        mic:'X-86S', category:'music', recorder:'Zoom F3',
    label:{ ja:'G.F.ヘンデル 組曲ニ短調', en:'G.F. Handel Suite in D minor', es:'Händel Suite en Re menor' },
    desc:{ ja:'バロックの精巧さを X-86S の 48V ファンタム＋ミニXLR で。繊細な響きを余すなく。', en:'Baroque precision — X-86S 48V phantom + mini XLR capturing delicate sonority.', es:'Precisión barroca con X-86S + Zoom F3.' } },
  { id:'byrd',        file:'William-Byrd-La-Volta.mp3',   mic:'X-86S', category:'music', recorder:'Zoom F3',
    label:{ ja:'W.バード ラ・ヴォルタ', en:'W. Byrd — La Volta', es:'W. Byrd — La Volta' },
    desc:{ ja:'16世紀イングランドの舞曲。X-86S のバランス出力が鍵盤の粒立ちを忠実に再現。', en:"16th century English dance — X-86S balanced output faithfully captures keyboard clarity.", es:'Danza inglesa del siglo XVI. Salida balanceada del X-86S.' } },
  { id:'flute-high',  file:'フルート高音修正版.mp3',        mic:'X-86S', category:'music', recorder:'Zoom F3',
    label:{ ja:'フルート 高音域（修正版）', en:'Flute — High Register', es:'Flauta — Registro Agudo' },
    desc:{ ja:'高音域のきらめきと息の流れ。X-86S の精密なトランジェント再現性。', en:'High register shimmer and breath — precise transient reproduction by X-86S.', es:'Brillo del registro agudo y flujo de aire.' } },
  { id:'flute-low',   file:'フルート低音.mp3',               mic:'X-86S', category:'music', recorder:'Zoom F3',
    label:{ ja:'フルート 低音域', en:'Flute — Low Register', es:'Flauta — Registro Grave' },
    desc:{ ja:'フルート低音域の豊かな倍音と温かみ。X-86S の広帯域特性で余すところなく。', en:'Rich overtones and warmth of the low flute register — X-86S wide bandwidth.', es:'Ricos armónicos del registro grave de la flauta.' } },
  // ── X-86S ミニXLR版 × フィールド録音（Australia）────────
  { id:'kuranda-train', file:'キュランダ鉄道の車内.mp3', mic:'X-86S', category:'field', recorder:'Zoom F3',
    label:{ ja:'キュランダ鉄道 車内', en:'Kuranda Railway Interior', es:'Interior del Tren Kuranda' },
    desc:{ ja:'世界遺産の熱帯雨林を走るキュランダ鉄道の車内。X-86S が捉えた空間と揺れの音。', en:'Inside the Kuranda Scenic Railway through World Heritage rainforest — space and motion via X-86S.', es:'Interior del tren Kuranda por la selva tropical del Patrimonio Mundial.' } },
  { id:'cairns-bus',  file:'ケアンズのバスの音.mp3',      mic:'X-86S', category:'field', recorder:'Zoom F3',
    label:{ ja:'ケアンズ 市バス', en:'Cairns City Bus', es:'Autobús de Cairns' },
    desc:{ ja:'オーストラリア・ケアンズ市内のバス。都市の日常音を X-86S のバランス出力で記録。', en:'Cairns city bus, Australia — urban soundscape via X-86S balanced output.', es:'Autobús urbano de Cairns — paisaje sonoro urbano.' } },
  { id:'trinity',     file:'トリニティービーチ.mp3',      mic:'X-86S', category:'field', recorder:'Zoom F3',
    label:{ ja:'トリニティービーチ', en:'Trinity Beach', es:'Trinity Beach' },
    desc:{ ja:'ケアンズ近郊 Trinity Beach の波音。48V ファンタム × XLR バランスが空間を広げる。', en:'Waves at Trinity Beach near Cairns — 48V phantom and XLR balanced output.', es:'Olas en Trinity Beach cerca de Cairns.' } },
  // ── P-86S プラグインパワー × フィールド録音 ──────────────
  { id:'iwakojima', file:'DR-60岩子島.mp3',                            mic:'P-86S', category:'field', recorder:'TASCAM DR-100mkIII',
    label:{ ja:'岩子島（広島）', en:'Iwakojima Island', es:'Isla Iwakojima' },
    desc:{ ja:'広島県・岩子島の自然音。TASCAM DR-100mkIII との組み合わせで収録。', en:'Natural sounds of Iwakojima Island, Hiroshima — P-86S + TASCAM DR-100mkIII.', es:'Sonidos naturales de la isla Iwakojima.' } },
  { id:'tatara',    file:'tatara.mp3',                                   mic:'P-86S', category:'field', recorder:'TASCAM DR-05',
    label:{ ja:'たたら（製鉄の音）', en:'Tatara Ironwork', es:'Herrería Tatara' },
    desc:{ ja:'日本の伝統的なたたら製鉄の音。鉄と火の共鳴を無指向性ペアで記録。', en:'Traditional Japanese tatara ironmaking — iron and fire in omnidirectional stereo.', es:'Fundición de hierro japonesa tradicional.' } },
  { id:'ferry',     file:'渡し舟エンジン〜出発前.mp3',                   mic:'P-86S', category:'field', recorder:'TASCAM DR-100mkIII',
    label:{ ja:'渡し舟 エンジン始動', en:'Ferry Engine Starting', es:'Motor del Ferry' },
    desc:{ ja:'尾道の渡し舟エンジン始動〜出発前。低周波の振動と水音が交差する。', en:'Onomichi ferry engine starting — low-frequency vibration and water sounds crossing.', es:'Motor del ferry de Onomichi arrancando.' } },
  { id:'fish-oil',  file:'尾道商店街おさかなドッグ油の音.mp3',           mic:'P-86S', category:'field', recorder:'TASCAM DR-100mkIII',
    label:{ ja:'尾道 おさかなドッグ揚げ油', en:'Onomichi Fish Dog — Frying Oil', es:'Aceite Friendo — Onomichi' },
    desc:{ ja:'尾道商店街のおさかなドッグ屋さん。揚げ油の泡と熱が交じる日常の音風景。', en:"Onomichi fish dog shop — the sizzle of frying oil in a daily soundscape.", es:'Tienda de Onomichi — el chisporroteo del aceite.' } },
  { id:'truck',     file:'50m先からトヨタハイラックスが近づいてくる.mp3', mic:'P-86S', category:'field', recorder:'Zoom H1 Essential',
    label:{ ja:'ハイラックス 接近音 50m', en:'Hilux Approaching 50m', es:'Hilux acercándose 50m' },
    desc:{ ja:'50m先からトヨタ ハイラックスが接近。方向感と空間の広がりが際立つフィールド収録。', en:'Toyota Hilux approaching from 50m — directional cues and spatial depth.', es:'Toyota Hilux acercándose desde 50 metros.' } },
  { id:'beer',      file:'3缶ビールを開けてグラスに注ぐ音.mp3',          mic:'P-86S', category:'field', recorder:'TASCAM DR-100mkIII',
    label:{ ja:'ビール 開缶→グラスへ', en:'Beer — Open & Pour', es:'Cerveza — Abrir y Servir' },
    desc:{ ja:'プルタブを開ける音、炭酸の音、グラスに注ぐ音。日常の音の豊かさ。', en:'Pull tab, fizz, pour — the richness of everyday sounds.', es:'Anilla, burbujas y vertido — riqueza cotidiana.' } },
  { id:'clock',     file:'明治時代の振り子時計の振り子の音.mp3',          mic:'P-86S', category:'field', recorder:'TASCAM DR-100mkIII',
    label:{ ja:'明治時代 振り子時計', en:'Meiji Era Pendulum Clock', es:'Reloj de Péndulo Meiji' },
    desc:{ ja:'明治時代の振り子時計。規則的なリズムと金属の響きを無指向性ペアで。', en:'Meiji era pendulum clock — regular rhythm and metallic resonance.', es:'Reloj de péndulo de la era Meiji.' } },
];


// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// Data – YouTube Field recording videos
// ─────────────────────────────────────────────
type YTVideo = {
  id:       string;
  location: T5;
  region:   T5;
  flag:     string;
  mic:      string;
  recorder: string;
};

const YT_VIDEOS: YTVideo[] = [
  // ── Japan × P-86S ────────────────────────────────────────────────
  { id:'90csx5Qt_Wg',
    location:{ ja:'帯広（雪）', en:'Obihiro — Snow', es:'Obihiro — Nieve' },
    region:  { ja:'北海道', en:'Hokkaido', es:'Hokkaido' },
    flag:'🇯🇵', mic:'P-86S', recorder:'TASCAM DR-05X Pro' },
  { id:'x_H_3L5Bj8w',
    location:{ ja:'広尾（えりも岬近く）', en:'Hiroo — near Cape Erimo', es:'Hiroo — cerca del Cabo Erimo' },
    region:  { ja:'北海道', en:'Hokkaido', es:'Hokkaido' },
    flag:'🇯🇵', mic:'P-86S', recorder:'TASCAM DR-05XP' },
  // ── Australia × X-86S ────────────────────────────────────────────
  { id:'7vsiNIOECHKqRY',
    location:{ ja:'キュランダ鉄道', en:'Kuranda Scenic Railway', es:'Tren Escénico Kuranda' },
    region:  { ja:'クイーンズランド', en:'Queensland', es:'Queensland' },
    flag:'🇦🇺', mic:'X-86S', recorder:'Zoom F3' },
  { id:'s8wO1fj2e8Q',
    location:{ ja:'トリニティービーチ', en:'Trinity Beach', es:'Trinity Beach' },
    region:  { ja:'ケアンズ', en:'Cairns', es:'Cairns' },
    flag:'🇦🇺', mic:'X-86S', recorder:'Zoom F3' },
];

// ─────────────────────────────────────────────
// URL helper
// ─────────────────────────────────────────────
// URL helper — encodes dots in name part to avoid Hono routing edge cases
const auUrl = (f:string) =>
  `${AUDIO_BASE}/${f.split('/').map(seg => {
    const lastDot = seg.lastIndexOf('.');
    if (lastDot <= 0) return encodeURIComponent(seg);
    const name = encodeURIComponent(seg.slice(0, lastDot)).replace(/\./g, '%2E');
    return name + seg.slice(lastDot); // preserve extension (.mp3)
  }).join('/')}`;

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function PlayBtn({ playing, onToggle, size=48, pulse=false }:{ playing:boolean; onToggle:()=>void; size?:number; pulse?:boolean }) {
  return (
    <button onClick={onToggle} aria-label={playing?'Pause':'Play'}
      className={pulse && !playing ? 'play-pulse' : ''}
      style={{ width:size, height:size, borderRadius:'50%', background:ACCENT, border:'none', cursor:'pointer',
        display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow:'0 4px 18px rgba(2,132,199,0.35)', flexShrink:0,
        transition:'transform 0.2s, box-shadow 0.2s' }}
      onMouseOver={e=>{e.currentTarget.style.transform='scale(1.1)';e.currentTarget.style.boxShadow='0 6px 24px rgba(2,132,199,0.5)';}}
      onMouseOut={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.boxShadow='0 4px 18px rgba(2,132,199,0.35)';}}
    >
      {playing
        ? <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
        : <svg width="13" height="13" viewBox="0 0 24 24" fill="white" style={{marginLeft:'2px'}}><polygon points="5,3 19,12 5,21"/></svg>
      }
    </button>
  );
}

function Waveform({ active }:{ active:boolean }) {
  if (!active) return <div style={{ width:'22px', height:'16px' }} />;
  return (
    <div style={{ display:'flex', gap:'2px', alignItems:'center', height:'16px' }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} className="waveform-bar" style={{ height:'14px', color:ACCENT }} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// BuyButton – calls Stripe Checkout API
// ─────────────────────────────────────────────
function BuyButton({ product, style, children }:{ product:'p-86s'|'x-86s'; style:CSSProperties; children:React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const handleClick = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/checkout', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ product }) });
      const d = await r.json() as { url?:string; error?:string };
      if (d.url) window.location.href = d.url;
      else { console.error('Checkout error:', d.error); setLoading(false); }
    } catch(e) { console.error(e); setLoading(false); }
  };
  return (
    <button onClick={handleClick} disabled={loading} className="btn-shimmer"
      style={{ ...style, opacity:loading?0.7:1, cursor:loading?'wait':'pointer' }}>
      {loading ? '…' : children}
    </button>
  );
}

// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// YouTube video card — cinematic poster style
// ─────────────────────────────────────────────
function YTVideoCard({ v, lang }:{ v:YTVideo; lang:Lang }) {
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);
  const thumb = `https://img.youtube.com/vi/${v.id}/maxresdefault.jpg`;
  const embed = `https://www.youtube.com/embed/${v.id}?autoplay=1&rel=0&modestbranding=1&color=white&iv_load_policy=3`;

  return (
    <div
      style={{
        position:'relative', width:'100%', aspectRatio:'16/9',
        borderRadius:'16px', overflow:'hidden',
        boxShadow: hovered
          ? '0 28px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(2,132,199,0.35)'
          : '0 14px 40px rgba(0,0,0,0.35)',
        transform: hovered ? 'translateY(-5px) scale(1.008)' : 'translateY(0) scale(1)',
        transition: 'transform 0.45s cubic-bezier(0.2,0.8,0.4,1), box-shadow 0.45s ease',
        cursor: playing ? 'default' : 'pointer',
      }}
      onMouseEnter={()=>setHovered(true)}
      onMouseLeave={()=>setHovered(false)}
    >
      {!playing ? (
        <div onClick={()=>setPlaying(true)} style={{ position:'absolute', inset:0 }}>
          {/* YouTube thumbnail */}
          <img
            src={thumb}
            alt={v.location[lang]}
            loading="lazy"
            onError={e=>{ (e.target as HTMLImageElement).src=`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`; }}
            style={{
              width:'100%', height:'100%', objectFit:'cover', display:'block',
              transform: hovered ? 'scale(1.07)' : 'scale(1)',
              transition: 'transform 0.65s cubic-bezier(0.2,0.8,0.4,1)',
            }}
          />

          {/* Cinematic gradient overlay */}
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.75) 100%)' }} />

          {/* Top: mic badge + recorder + flag */}
          <div style={{ position:'absolute', top:'0.9rem', left:'0.9rem', right:'0.9rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:'0.6rem', fontFamily:sans, letterSpacing:'0.14em', fontWeight:'700',
              background:'rgba(2,132,199,0.9)', backdropFilter:'blur(6px)',
              color:'#fff', padding:'0.22rem 0.65rem', borderRadius:'4px' }}>
              {v.mic}
            </span>
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <span style={{ fontSize:'0.6rem', color:'rgba(255,255,255,0.7)', fontFamily:sans, letterSpacing:'0.08em',
                background:'rgba(0,0,0,0.4)', backdropFilter:'blur(6px)',
                padding:'0.2rem 0.5rem', borderRadius:'3px' }}>
                {v.recorder}
              </span>
              <span style={{ fontSize:'1.05rem' }}>{v.flag}</span>
            </div>
          </div>

          {/* Center: glowing play button */}
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{
              width:'clamp(48px,6vw,64px)', height:'clamp(48px,6vw,64px)', borderRadius:'50%',
              background: hovered ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.82)',
              backdropFilter:'blur(12px)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow: hovered
                ? '0 0 40px rgba(255,255,255,0.5), 0 8px 32px rgba(0,0,0,0.5)'
                : '0 4px 20px rgba(0,0,0,0.4)',
              transform: hovered ? 'scale(1.12)' : 'scale(1)',
              transition: 'all 0.35s ease',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#0284c7" style={{marginLeft:'3px'}}>
                <polygon points="5,3 19,12 5,21"/>
              </svg>
            </div>
          </div>

          {/* Bottom: location info + accent line */}
          <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'1.25rem 1.1rem 1rem' }}>
            <p style={{
              fontSize:'clamp(1.1rem,2.2vw,1.6rem)', fontWeight:'200', color:'#fff',
              fontFamily:serif, letterSpacing:'0.07em', marginBottom:'0.2rem',
              transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
              transition: 'transform 0.4s ease',
              textShadow:'0 2px 10px rgba(0,0,0,0.6)',
            }}>
              {v.location[lang]}
            </p>
            <p style={{
              fontSize:'0.68rem', color:'rgba(255,255,255,0.6)', fontFamily:sans, letterSpacing:'0.1em',
              transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
              transition: 'transform 0.4s ease 0.04s',
            }}>
              {v.region[lang]}
            </p>
            <div style={{
              height:'2px', marginTop:'0.7rem', borderRadius:'1px',
              background:`linear-gradient(90deg, ${ACCENT} 0%, rgba(2,132,199,0.3) 60%, transparent 100%)`,
              width: hovered ? '65%' : '35%',
              transition:'width 0.5s cubic-bezier(0.2,0.8,0.4,1)',
            }} />
          </div>
        </div>
      ) : (
        <>
          <iframe
            src={embed}
            title={v.location[lang]}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position:'absolute', inset:0, width:'100%', height:'100%', border:'none' }}
          />
          <button onClick={()=>setPlaying(false)}
            style={{
              position:'absolute', top:'0.75rem', right:'0.75rem', zIndex:10,
              width:'30px', height:'30px', borderRadius:'50%',
              background:'rgba(0,0,0,0.65)', backdropFilter:'blur(8px)',
              border:'1px solid rgba(255,255,255,0.2)',
              color:'rgba(255,255,255,0.9)', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'0.75rem', transition:'background 0.2s',
            }}
            onMouseOver={e=>e.currentTarget.style.background='rgba(0,0,0,0.9)'}
            onMouseOut={e=>e.currentTarget.style.background='rgba(0,0,0,0.65)'}
          >✕</button>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Piano Blind Test – YouTube comparison
// ─────────────────────────────────────────────
function PianoCompare() {
  const { lang } = useLang();
  const [activeTab, setActiveTab] = useState<number|null>(null);
  const [revealed, setRevealed] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const t = (ja:string,en:string,es:string):string => ({ja,en,es} as Record<Lang,string>)[lang];

  const TABS = [
    { mic:'A', seconds:0,    ts:'0:00'  },
    { mic:'B', seconds:356,  ts:'5:56'  },
    { mic:'C', seconds:707,  ts:'11:47' },
    { mic:'D', seconds:1058, ts:'17:38' },
  ];

  const MICS = [
    { mic:'A', name:'DPA 4006',          price:'¥800,000+', ours:false },
    { mic:'B', name:'Sennheiser MKE-2',  price:'¥140,000',  ours:false },
    { mic:'C', name:'X-86S by 空音開発', price:'¥39,600',   ours:true  },
    { mic:'D', name:'Earthworks QTC30',  price:'¥280,000',  ours:false },
  ];

  const seekTo = (seconds:number, idx:number) => {
    setActiveTab(idx);
    const frame = iframeRef.current;
    if (!frame?.contentWindow) return;
    const send = (func:string, args:unknown[]) =>
      frame.contentWindow!.postMessage(JSON.stringify({ event:'command', func, args }), '*');
    send('seekTo',   [seconds, true]);
    send('playVideo', []);
  };

  return (
    <section style={{
      padding:'clamp(5rem,10vw,10rem) 5%',
      background:'linear-gradient(180deg, #050d1a 0%, #0a1428 60%, #06111e 100%)',
      borderTop:'1px solid rgba(2,132,199,0.12)',
      position:'relative', overflow:'hidden',
    }}>
      {/* Decorative orbs */}
      <div aria-hidden style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-10%', right:'-5%', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(2,132,199,0.07) 0%, transparent 70%)', animation:'orbDrift 18s ease-in-out infinite' }} />
        <div style={{ position:'absolute', bottom:'-5%', left:'-5%', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle, rgba(14,165,233,0.05) 0%, transparent 70%)', animation:'orbDriftReverse 22s ease-in-out infinite' }} />
      </div>

      <div style={{ maxWidth:'860px', margin:'0 auto', position:'relative', zIndex:1 }}>
        {/* Header */}
        <div className="reveal" style={{ textAlign:'center', marginBottom:'clamp(2.5rem,5vw,4rem)' }}>
          <p style={{ fontSize:'0.65rem', letterSpacing:'0.5em', textTransform:'uppercase', color:'rgba(2,132,199,0.8)', marginBottom:'1rem', fontFamily:'"Helvetica Neue",Arial,sans-serif', fontWeight:'300' }}>
            Piano Blind Test
          </p>
          <h3 style={{ fontSize:'clamp(1.4rem,3vw,2.4rem)', fontWeight:'200', letterSpacing:'0.07em', lineHeight:'1.6', color:'#fff', fontFamily:'"Hiragino Mincho ProN","Yu Mincho",serif', marginBottom:'1rem' }}>
            {t('フルコンサートグランドを、どう捉えるか。','How does it capture a concert grand piano?','¿Cómo capta un piano de cola de concierto?')}
          </h3>
          <p style={{ fontSize:'clamp(0.85rem,1.2vw,0.95rem)', color:'rgba(255,255,255,0.5)', lineHeight:'1.9', fontFamily:'"Hiragino Mincho ProN","Yu Mincho",serif', maxWidth:'580px', margin:'0 auto' }}>
            {t('ヤマハ CFX。4本のマイクを切り替えながら聴き比べてください。どれが空音開発のマイクか、わかりますか？','Yamaha CFX. Switch between four mics and listen. Can you tell which one is by Kuon R&D?','Yamaha CFX. Cambia entre cuatro micrófonos. ¿Puedes identificar el de Kuon R&D?')}
          </p>
        </div>

        {/* YouTube embed */}
        <div className="reveal" style={{
          position:'relative', paddingBottom:'56.25%', height:0, overflow:'hidden',
          borderRadius:'14px',
          boxShadow:'0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(2,132,199,0.2)',
          marginBottom:'clamp(1.5rem,3vw,2rem)',
        }}>
          <iframe
            ref={iframeRef}
            src="https://www.youtube.com/embed/thw74v4xBjs?enablejsapi=1&rel=0&modestbranding=1&color=white"
            title="Piano Blind Test"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', border:'none', borderRadius:'14px' }}
          />
        </div>

        {/* Mic selector: buttons + segment timeline */}
        <div className="reveal" style={{ marginBottom:'clamp(2rem,4vw,3.5rem)' }}>
          {/* 4 button tabs */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'clamp(0.5rem,1vw,0.75rem)', marginBottom:'1rem' }}>
            {TABS.map((tab, i) => (
              <button key={tab.mic} onClick={()=>seekTo(tab.seconds, i)}
                style={{
                  padding:'clamp(0.9rem,2vw,1.3rem) 0.5rem',
                  background: activeTab===i ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'rgba(255,255,255,0.04)',
                  border: activeTab===i ? '1px solid rgba(2,132,199,0.6)' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius:'10px', cursor:'pointer', textAlign:'center',
                  transition:'all 0.28s cubic-bezier(0.2,0.8,0.4,1)',
                  backdropFilter:'blur(12px)',
                  boxShadow: activeTab===i ? '0 8px 24px rgba(2,132,199,0.35)' : '0 2px 8px rgba(0,0,0,0.2)',
                  transform: activeTab===i ? 'translateY(-2px)' : 'translateY(0)',
                }}
                onMouseOver={e=>{ if(activeTab!==i) { (e.currentTarget as HTMLButtonElement).style.background='rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.borderColor='rgba(255,255,255,0.2)'; }}}
                onMouseOut={e=>{ if(activeTab!==i) { (e.currentTarget as HTMLButtonElement).style.background='rgba(255,255,255,0.04)'; (e.currentTarget as HTMLButtonElement).style.borderColor='rgba(255,255,255,0.1)'; }}}
              >
                <p style={{ fontSize:'clamp(1rem,2vw,1.5rem)', fontWeight:'200', color:activeTab===i?'#fff':'rgba(255,255,255,0.5)', fontFamily:'"Helvetica Neue",Arial,sans-serif', margin:'0 0 0.2rem 0', letterSpacing:'0.05em' }}>
                  Mic {tab.mic}
                </p>
                <p style={{ fontSize:'0.68rem', color:activeTab===i?'rgba(255,255,255,0.7)':'rgba(255,255,255,0.3)', fontFamily:'"Helvetica Neue",Arial,sans-serif', margin:0, letterSpacing:'0.08em' }}>
                  {tab.ts}
                </p>
              </button>
            ))}
          </div>

          {/* Segment timeline bar – click to seek */}
          <div style={{ position:'relative' }}>
            <div style={{ display:'flex', borderRadius:'8px', overflow:'hidden', height:'36px' }}>
              {TABS.map((tab, i) => {
                const segEnd = i < TABS.length-1 ? TABS[i+1].seconds : 1400;
                const segLen = segEnd - tab.seconds;
                const isActive = activeTab === i;
                return (
                  <div key={tab.mic} onClick={()=>seekTo(tab.seconds, i)}
                    style={{
                      flex: segLen, cursor:'pointer',
                      background: isActive
                        ? 'linear-gradient(90deg, #0284c7 0%, #0369a1 100%)'
                        : i%2===0 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                      borderRight: i<TABS.length-1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                      display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem',
                      transition:'background 0.25s',
                    }}
                    onMouseOver={e=>{ if(!isActive) (e.currentTarget as HTMLDivElement).style.background='rgba(255,255,255,0.1)'; }}
                    onMouseOut={e=>{ if(!isActive) (e.currentTarget as HTMLDivElement).style.background=i%2===0?'rgba(255,255,255,0.06)':'rgba(255,255,255,0.03)'; }}
                  >
                    <span style={{ fontSize:'0.62rem', color:isActive?'#fff':'rgba(255,255,255,0.4)', fontFamily:'"Helvetica Neue",Arial,sans-serif', fontWeight:isActive?'700':'400', letterSpacing:'0.08em' }}>
                      {tab.mic}
                    </span>
                    <span style={{ fontSize:'0.55rem', color:isActive?'rgba(255,255,255,0.7)':'rgba(255,255,255,0.25)', fontFamily:'"Helvetica Neue",Arial,sans-serif' }}>
                      {tab.ts}
                    </span>
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize:'0.6rem', color:'rgba(255,255,255,0.25)', fontFamily:'"Helvetica Neue",Arial,sans-serif', marginTop:'0.4rem', textAlign:'right' }}>
              {t('▲ クリックでシーク','▲ Click to seek','▲ Clic para buscar')}
            </p>
          </div>
        </div>

        {/* Reveal */}
        <div className="reveal" style={{ textAlign:'center' }}>
          {!revealed ? (
            <button onClick={()=>setRevealed(true)}
              style={{
                background:'none', cursor:'pointer',
                border:'1px solid rgba(255,255,255,0.2)',
                borderRadius:'50px', color:'rgba(255,255,255,0.6)',
                fontSize:'0.82rem', letterSpacing:'0.14em',
                fontFamily:'"Helvetica Neue",Arial,sans-serif',
                padding:'0.85rem 2.5rem', transition:'all 0.25s',
                backdropFilter:'blur(8px)',
              }}
              onMouseOver={e=>{ e.currentTarget.style.borderColor='rgba(2,132,199,0.6)'; e.currentTarget.style.color='#fff'; e.currentTarget.style.background='rgba(2,132,199,0.1)'; }}
              onMouseOut={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'; e.currentTarget.style.color='rgba(255,255,255,0.6)'; e.currentTarget.style.background='none'; }}
            >
              {t('答えを見る','Reveal Answer','Revelar Respuesta')}
            </button>
          ) : (
            <div style={{
              background:'rgba(255,255,255,0.03)', backdropFilter:'blur(16px)',
              border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px',
              padding:'clamp(1.5rem,3vw,2.5rem)',
            }}>
              <p style={{ fontSize:'0.72rem', letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', fontFamily:'"Helvetica Neue",Arial,sans-serif', marginBottom:'1.5rem' }}>
                {t('録音機材','Recording Equipment','Equipo de Grabación')}
              </p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'0.75rem', justifyContent:'center', marginBottom:'1.5rem' }}>
                {MICS.map(m => (
                  <div key={m.mic} style={{
                    padding:'0.75rem 1.25rem', borderRadius:'8px',
                    background: m.ours ? 'rgba(2,132,199,0.15)' : 'rgba(255,255,255,0.04)',
                    border: m.ours ? '1px solid rgba(2,132,199,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    textAlign:'left', minWidth:'160px',
                  }}>
                    <p style={{ fontSize:'0.65rem', color: m.ours ? 'rgba(2,132,199,0.9)' : 'rgba(255,255,255,0.35)', fontFamily:'"Helvetica Neue",Arial,sans-serif', letterSpacing:'0.12em', marginBottom:'0.35rem', fontWeight:'600' }}>Mic {m.mic}</p>
                    <p style={{ fontSize:'0.88rem', color: m.ours ? '#fff' : 'rgba(255,255,255,0.6)', fontFamily:'"Helvetica Neue",Arial,sans-serif', fontWeight: m.ours ? '600' : '400', marginBottom:'0.2rem' }}>{m.name}</p>
                    <p style={{ fontSize:'0.72rem', color: m.ours ? 'rgba(2,132,199,0.8)' : 'rgba(255,255,255,0.3)', fontFamily:'"Helvetica Neue",Arial,sans-serif' }}>{m.price}</p>
                  </div>
                ))}
              </div>
              <p style={{ fontSize:'clamp(0.82rem,1.2vw,0.92rem)', color:'rgba(255,255,255,0.45)', fontFamily:'"Hiragino Mincho ProN","Yu Mincho",serif', lineHeight:'1.8' }}>
                {t('Mic C（X-86S ¥39,600）が、数十万円のマイクに匹敵する音質を実現しています。','Mic C (X-86S ¥39,600) achieves sound quality on par with microphones costing hundreds of thousands of yen.','Mic C (X-86S ¥39,600) logra una calidad de sonido comparable a micrófonos de cientos de miles de yenes.')}
              </p>
              <button onClick={()=>setRevealed(false)} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.25)', cursor:'pointer', fontSize:'0.72rem', fontFamily:'"Helvetica Neue",Arial,sans-serif', marginTop:'1rem', textDecoration:'underline' }}>
                {t('隠す','Hide','Ocultar')}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Reusable audio player: seek + volume + mic badge
// ─────────────────────────────────────────────
function SamplePlayer({ src, label, desc, mic, recorder }:{
  src:string; label:string; desc:string; mic:'P-86S'|'X-86S'; recorder?:string;
}) {
  const { lang } = useLang();
  const micLabel = mic==='P-86S' ? 'P-86S プラグインパワー' : 'X-86S ミニXLR版';
  const [playing, setPlaying] = useState(false);
  const [time,    setTime]    = useState(0);
  const [dur,     setDur]     = useState(0);
  const [vol,     setVol]     = useState(0.85);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [isNarrow, setIsNarrow] = useState(false);
  const ref        = useRef<HTMLAudioElement>(null);
  const playingRef = useRef(false);
  const idRef      = useRef(`sp-${src}`);
  const cardRef    = useRef<HTMLDivElement>(null);

  const fmt = (s:number) => (!s||!isFinite(s)) ? '—:——' : `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
  const pct = dur>0 ? (time/dur)*100 : 0;

  // Stop this player when another starts
  useEffect(() => {
    const handler = (e: Event) => {
      const { id } = (e as CustomEvent<{id:string}>).detail;
      if (id !== idRef.current && playingRef.current) {
        ref.current?.pause();
        setPlaying(false);
        playingRef.current = false;
      }
    };
    window.addEventListener('kuon:play', handler);
    return () => window.removeEventListener('kuon:play', handler);
  }, []);

  useEffect(() => { playingRef.current = playing; }, [playing]);

  // Detect narrow viewport (mobile) for adaptive buy CTA placement
  useEffect(() => {
    const check = () => setIsNarrow(window.innerWidth < 720);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const toggle = async () => {
    if (!ref.current) return;
    if (playing) {
      ref.current.pause(); setPlaying(false);
    } else {
      window.dispatchEvent(new CustomEvent('kuon:play', { detail: { id: idRef.current } }));
      try { await ref.current.play(); setPlaying(true); }
      catch { setPlaying(false); }
    }
  };
  const seek = (v:number) => { if(ref.current) ref.current.currentTime=v; setTime(v); };
  const changeVol = (v:number) => { setVol(v); if(ref.current) ref.current.volume=v; };

  // Mouse-follow parallax for the floating buy CTA (only meaningful while playing)
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playing || isNarrow) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;  // -1..1
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;  // -1..1
    setParallax({ x: Math.max(-1, Math.min(1, nx)), y: Math.max(-1, Math.min(1, ny)) });
  };
  const handleCardMouseLeave = () => setParallax({ x: 0, y: 0 });

  // i18n text for the buy CTA
  const buyText: string = ({
    ja: '今すぐ購入',
    en: 'Buy Now',
    es: 'Comprar Ahora',
  } as Record<Lang,string>)[lang];

  const price   = mic === 'P-86S' ? '¥13,900' : '¥39,600';
  const product = mic === 'P-86S' ? 'p-86s' : 'x-86s';

  // Prominent, unmistakable "Buy" visual
  const floatingBuyStyle: CSSProperties = {
    display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'0.55rem',
    padding:'0.8rem 1.35rem', borderRadius:'999px',
    background:`linear-gradient(135deg, #0ea5e9 0%, ${ACCENT} 55%, #0369a1 100%)`,
    color:'#fff', border:'none', cursor:'pointer',
    fontFamily:sans, fontSize:'0.9rem', fontWeight:800, letterSpacing:'0.04em',
    boxShadow:'0 14px 32px rgba(2,132,199,0.45), 0 0 0 2px rgba(255,255,255,0.6), inset 0 1px 0 rgba(255,255,255,0.45)',
    whiteSpace:'nowrap', lineHeight:1,
  };

  const CartIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );

  return (
    <div
      ref={cardRef}
      style={{ ...glass, padding:'clamp(1.25rem,2.5vw,1.75rem)', position:'relative' }}
      onMouseMove={handleCardMouseMove}
      onMouseLeave={handleCardMouseLeave}
    >
      {/* Top row */}
      <div style={{ display:'flex', alignItems:'flex-start', gap:'0.9rem', marginBottom:'0.85rem' }}>
        {/* Mic badge — no recorder displayed */}
        <span style={{ fontSize:'0.58rem', fontFamily:sans, letterSpacing:'0.14em', fontWeight:'700',
          backgroundColor: mic==='X-86S' ? 'rgba(2,132,199,0.18)' : 'rgba(2,132,199,0.08)', color:ACCENT,
          padding:'0.22rem 0.6rem', borderRadius:'4px',
          border:`1px solid rgba(2,132,199,${mic==='X-86S'?'0.35':'0.22'})`,
          whiteSpace:'nowrap', flexShrink:0, marginTop:'0.1rem' }}>{micLabel}</span>

        {/* Track info */}
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:'0.9rem', fontWeight:'600', letterSpacing:'0.04em', fontFamily:sans, margin:'0 0 0.15rem 0', color:'var(--text-main)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{label}</p>
          <p style={{ fontSize:'0.72rem', color:'var(--text-muted)', margin:0, fontFamily:serif, lineHeight:'1.5' }}>{desc}</p>
        </div>

        {/* Right controls: waveform + play button. Buy CTA is floated to the RIGHT of the play button. */}
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexShrink:0, position:'relative' }}>
          <Waveform active={playing} />
          <PlayBtn playing={playing} onToggle={toggle} size={42} />

          {/* Floating buy CTA — desktop / wide viewports */}
          {playing && !isNarrow && (
            <div
              // Outer: positioning + parallax translate only.
              // Vertical centering is baked into the translate so no jump on animation end.
              style={{
                position:'absolute',
                top:'50%',
                left:'calc(100% + 0.9rem)',
                transform:`translate(${parallax.x * 10}px, calc(-50% + ${parallax.y * 6}px))`,
                transition:'transform 0.32s cubic-bezier(0.2,0.8,0.4,1)',
                zIndex:6, willChange:'transform',
              }}
            >
              {/* Inner: opacity + subtle scale for entrance — no translate, so it never fights the parallax */}
              <div style={{ animation:'buyCtaIn 0.42s cubic-bezier(0.2,0.8,0.4,1) both' }}>
                <BuyButton product={product} style={floatingBuyStyle}>
                  {CartIcon}
                  <span>{buyText}&nbsp;<strong style={{ fontWeight: 900, letterSpacing:'0.02em' }}>{price}</strong></span>
                </BuyButton>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating buy CTA — mobile / narrow viewports (inline, full-width, still clearly a buy button) */}
      {playing && isNarrow && (
        <div style={{ marginBottom:'0.85rem', animation:'buyCtaIn 0.42s cubic-bezier(0.2,0.8,0.4,1) both' }}>
          <BuyButton product={product} style={{ ...floatingBuyStyle, width:'100%' }}>
            {CartIcon}
            <span>{buyText}&nbsp;<strong style={{ fontWeight: 900, letterSpacing:'0.02em' }}>{price}</strong></span>
          </BuyButton>
        </div>
      )}

      {/* Progress bar */}
      <div style={{ position:'relative', height:'6px', borderRadius:'3px', background:'rgba(0,0,0,0.08)', marginBottom:'0.3rem', cursor:'pointer' }}>
        <div style={{ position:'absolute', left:0, top:0, height:'100%', borderRadius:'3px', background:`linear-gradient(90deg,${ACCENT},rgba(2,132,199,0.6))`, width:`${pct}%`, transition:'width 0.15s linear', pointerEvents:'none' }} />
        <input type="range" min="0" max={dur||1} step="0.1" value={time}
          onChange={e=>seek(+e.target.value)}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0, cursor:'pointer', margin:0 }} />
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.7rem' }}>
        <span style={{ fontSize:'0.65rem', color:'#bbb', fontFamily:sans }}>{fmt(time)}</span>
        <span style={{ fontSize:'0.65rem', color:'#bbb', fontFamily:sans }}>{fmt(dur)}</span>
      </div>

      {/* Volume */}
      <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
        <span style={{ fontSize:'0.8rem', flexShrink:0 }}>🔊</span>
        <div style={{ position:'relative', height:'4px', borderRadius:'2px', background:'rgba(0,0,0,0.08)', flex:'0 0 90px', cursor:'pointer' }}>
          <div style={{ position:'absolute', left:0, top:0, height:'100%', borderRadius:'2px', background:'rgba(2,132,199,0.4)', width:`${vol*100}%`, pointerEvents:'none' }} />
          <input type="range" min="0" max="1" step="0.01" value={vol}
            onChange={e=>changeVol(+e.target.value)}
            style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0, cursor:'pointer', margin:0 }} />
        </div>
        <span style={{ fontSize:'0.65rem', color:'#bbb', fontFamily:sans }}>{Math.round(vol*100)}%</span>
      </div>

      <audio ref={ref} src={src} preload="metadata"
        onTimeUpdate={e=>setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={e=>{ setDur(e.currentTarget.duration); if(ref.current) ref.current.volume=vol; }}
        onEnded={()=>{ setPlaying(false); setTime(0); }}
        onError={()=>setPlaying(false)}
      />
    </div>
  );
}

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
      }),
      { threshold: 0.08, rootMargin: '0px 0px -48px 0px' }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ─────────────────────────────────────────────
// Section decorator (large faded number)
// ─────────────────────────────────────────────
function SectionNum({ n }:{ n:string }) {
  return (
    <div aria-hidden style={{ position:'absolute', top:'-0.5rem', right:'4%',
      fontSize:'clamp(6rem,12vw,10rem)', fontWeight:'900',
      color:'rgba(2,132,199,0.04)', fontFamily:'"Helvetica Neue",sans-serif',
      lineHeight:1, userSelect:'none', pointerEvents:'none', letterSpacing:'-0.05em',
    }}>{n}</div>
  );
}

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────
export default function MicrophonePage() {
  const { lang } = useLang();
  const t = (ja:string,en:string,es:string):string => ({ja,en,es} as Record<Lang,string>)[lang];
  useScrollReveal();

  // Comparison state
  const [cPlaying, setCPlaying] = useState<string|null>(null);
  const cRA = useRef<HTMLAudioElement>(null);
  const cRB = useRef<HTMLAudioElement>(null);
  const cRC = useRef<HTMLAudioElement>(null);
  const cRefs: Record<string,React.RefObject<HTMLAudioElement|null>> = { A:cRA, B:cRB, C:cRC };
  const [revealed, setRevealed] = useState(false);

  const toggleC = useCallback((id:string) => {
    const ref = cRefs[id];
    if (!ref?.current) return;
    if (cPlaying === id) { ref.current.pause(); setCPlaying(null); }
    else {
      Object.entries(cRefs).forEach(([k,r])=>{ if(k!==id&&r.current) r.current.pause(); });
      ref.current.play().catch(()=>setCPlaying(null));
      setCPlaying(id);
    }
  }, [cPlaying, cRefs]);

  // Sample state
  const [sampleCat, setSampleCat] = useState<'music'|'field'|'podcast'>('music');
  const [activeSample, setActiveSample] = useState('piano');
  const [sPlaying, setSPlaying] = useState(false);
  const sRef = useRef<HTMLAudioElement>(null);
  const curSample = SAMPLES.find(s=>s.id===activeSample) ?? SAMPLES[0];

  const changeSample = (id:string)=>{ setActiveSample(id); setSPlaying(false); sRef.current?.pause(); sRef.current?.load?.(); };
  const toggleS = async ()=>{
    if (!sRef.current) return;
    if (sPlaying) { sRef.current.pause(); setSPlaying(false); }
    else { try { await sRef.current.play(); setSPlaying(true); } catch { setSPlaying(false); } }
  };


  // JSON-LD structured data for Google rich results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'P-86S ステレオマイクロフォン',
    description: '音大生だった朝比奈幸太郎が自分のために作ったハンドメイドステレオマイク。プラグインパワー対応、1本でABステレオ録音。アコースティック楽器専門。',
    image: 'https://kuon-rnd.com/mic01.jpeg',
    brand: { '@type': 'Brand', name: '空音開発 Kuon R&D' },
    manufacturer: { '@type': 'Organization', name: '空音開発 Kuon R&D', url: 'https://kuon-rnd.com' },
    offers: {
      '@type': 'Offer',
      url: 'https://kuon-rnd.com/microphone',
      priceCurrency: 'JPY',
      price: '13900',
      priceValidUntil: '2027-12-31',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: '空音開発 Kuon R&D' },
    },
    category: 'マイクロフォン',
    keywords: 'ステレオマイク, ハンドメイドマイク, アコースティック録音, プラグインパワー, AB録音',
  };

  return (
    <div style={{ backgroundColor:'#fafafa', minHeight:'100vh', color:'var(--text-main)', overflowX:'hidden' }}>

      {/* JSON-LD for Google rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ══════════════════════════════════════════
          ① HERO
      ══════════════════════════════════════════ */}
      <section style={{ minHeight:'100vh', position:'relative', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'clamp(6rem,12vw,14rem) 5% clamp(5rem,8vw,10rem)', textAlign:'center', overflow:'hidden' }}>

        {/* Animated background orbs */}
        <div aria-hidden style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:0 }}>
          <div style={{ position:'absolute', top:'-5%', left:'-10%', width:'clamp(300px,50vw,600px)', height:'clamp(300px,50vw,600px)', borderRadius:'50%', background:'radial-gradient(circle, rgba(2,132,199,0.1) 0%, transparent 70%)', animation:'orbDrift 14s ease-in-out infinite' }} />
          <div style={{ position:'absolute', bottom:'-8%', right:'-8%', width:'clamp(250px,45vw,550px)', height:'clamp(250px,45vw,550px)', borderRadius:'50%', background:'radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)', animation:'orbDriftReverse 18s ease-in-out infinite' }} />
          <div style={{ position:'absolute', top:'50%', left:'60%', width:'clamp(150px,25vw,300px)', height:'clamp(150px,25vw,300px)', borderRadius:'50%', background:'radial-gradient(circle, rgba(2,132,199,0.05) 0%, transparent 70%)', animation:'orbDrift 22s ease-in-out infinite reverse' }} />
        </div>

        <div style={{ position:'relative', zIndex:1 }}>
          {/* Anchor nav */}
          <nav className="hero-enter-1" style={{ display:'flex', gap:'clamp(1rem,3vw,2.5rem)', flexWrap:'wrap', justifyContent:'center', marginBottom:'clamp(2rem,4vw,3.5rem)' }}>
            {[
              { href:'#compare', ja:'比較試聴', en:'Compare', es:'Comparar' },
              { href:'#listen',  ja:'音楽サンプル', en:'Music', es:'Música' },
              { href:'#spec',    ja:'スペック・購入', en:'Specs & Buy', es:'Specs & Comprar' },
            ].map(l=>(
              <a key={l.href} href={l.href} style={{ textDecoration:'none', fontSize:'0.76rem', letterSpacing:'0.14em', fontFamily:sans, color:'var(--text-muted)', paddingBottom:'0.15rem', borderBottom:'1px solid rgba(0,0,0,0.12)', transition:'color 0.2s, border-color 0.2s' }}
                onMouseOver={e=>{e.currentTarget.style.color=ACCENT;e.currentTarget.style.borderColor=ACCENT;}}
                onMouseOut={e=>{e.currentTarget.style.color='var(--text-muted)';e.currentTarget.style.borderColor='rgba(0,0,0,0.12)';}}
              >{t(l.ja,l.en,l.es)}</a>
            ))}
          </nav>

          <p className="hero-enter-2" style={{ fontSize:'0.68rem', letterSpacing:'0.5em', textTransform:'uppercase', color:ACCENT, marginBottom:'1.5rem', fontFamily:sans, fontWeight:'300' }}>
            P-86S Stereo Microphone · Kuon R&amp;D
          </p>

          <h2 className="hero-enter-2" style={{ fontSize:'clamp(1.55rem,3.2vw,2.6rem)', fontWeight:'200', letterSpacing:'0.06em', lineHeight:'1.75', margin:'0 0 clamp(1.5rem,3vw,2.5rem) 0', maxWidth:'660px', fontFamily:serif, whiteSpace:'pre-line', wordBreak:'keep-all', overflowWrap:'break-word' }}>
            {t('音大生だった私が、\n自分のために作ったマイク。','A microphone I built\nfor myself, as a music student.','Un micrófono que construí\npara mí, como estudiante de música.')}
          </h2>

          <p className="hero-enter-3" style={{ fontSize:'clamp(0.9rem,1.4vw,1.05rem)', color:'var(--text-muted)', lineHeight:'2', maxWidth:'560px', marginBottom:'clamp(3rem,5vw,4.5rem)', fontFamily:serif }}>
            {t('市販の高級マイク（数十万円）と同等以上の録音クオリティを、\n学生でも手が届く価格で。','Recording quality equal to or better than commercial high-end microphones — at a price accessible to students.','Calidad de grabación igual o superior a micrófonos de alta gama, a un precio accesible.')}
          </p>

          <div className="hero-enter-4" style={{ display:'flex', gap:'1rem', flexWrap:'wrap', justifyContent:'center' }}>
            <a href="#compare" style={ctaOutline()}>
              {t('100万円の機材はどれ？↓','Which is the $10K mic? ↓','¿Cuál es el de $10K? ↓')}
            </a>
            <BuyButton product="p-86s" style={ctaPrimary()}>
              {t('購入する — ¥13,900','Buy Now — ¥13,900','Comprar — ¥13,900')}
            </BuyButton>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ② STORY
      ══════════════════════════════════════════ */}
      <section style={{ padding:'clamp(5rem,10vw,10rem) 5%', background:'rgba(255,255,255,0.55)', borderTop:'1px solid rgba(0,0,0,0.04)', position:'relative', overflow:'hidden' }}>
        <SectionNum n="01" />
        <div style={{ maxWidth:'980px', margin:'0 auto', display:'flex', gap:'clamp(2.5rem,5vw,5rem)', alignItems:'center', flexWrap:'wrap' }}>
          <div className="reveal" style={{ flex:'1 1 300px' }}>
            <p style={{ fontSize:'0.68rem', letterSpacing:'0.45em', textTransform:'uppercase', color:ACCENT, marginBottom:'1.5rem', fontFamily:sans }}>Origin Story</p>
            <h3 style={{ fontSize:'clamp(1.4rem,3vw,2.3rem)', fontWeight:'200', letterSpacing:'0.07em', lineHeight:'1.7', marginBottom:'clamp(1.5rem,3vw,2.5rem)', fontFamily:serif, whiteSpace:'pre-line' }}>
              {t("手が届かないなら、\n自分で作ればいい。","If I can't afford it,\nI'll build it myself.","Si no puedo pagarlo,\nlo construiré yo mismo.")}
            </h3>
            <div style={{ color:'var(--text-muted)', fontSize:'clamp(0.88rem,1.3vw,0.98rem)', lineHeight:'2.5', fontFamily:serif }}>
              <p style={{ marginBottom:'1.5em' }}>{t('音楽大学在学中、自分の演奏を本当の意味で録音したいと思っていました。市販の高品位マイクは数十万円——学生には手が届かない価格です。',"During my years at music university, I wanted to truly record my own playing. Commercial high-quality microphones cost hundreds of thousands of yen — out of reach for a student.",'Durante mis años en la universidad de música, quería grabar mis interpretaciones de verdad. Los micrófonos de alta calidad cuestan cientos de miles de yenes — fuera del alcance de un estudiante.')}</p>
              <p style={{ marginBottom:'1.5em' }}>{t('それならば、自分で設計・製作してしまおう。そうして生まれたのが P-86S です。',"So I decided to design and build one myself. That's how the P-86S was born.",'Entonces decidí diseñar y construir uno yo mismo. Así nació el P-86S.')}</p>
              <p>{t('無指向性カプセルを採用した AB 方式ステレオ。楽器の音と空間を丸ごと包み込む録音スタイルは、音大時代の私が理想として描いていた「生音に最も近い録音」を実現しています。',"Omnidirectional capsules in AB stereo — wrapping the instrument and the room together. The 'closest to live' recording I envisioned as a student.",'Cápsulas omnidireccionales en estéreo AB: la grabación "más cercana al directo" que imaginaba como estudiante.')}</p>
            </div>
          </div>
          <div className="reveal reveal-delay-2"
            style={{ ...imgWrap, flex:'1 1 280px' }}
            onMouseOver={e=>{(e.currentTarget as HTMLDivElement).style.transform='translateY(-8px) scale(1.02)';(e.currentTarget as HTMLDivElement).style.boxShadow='0 24px 48px rgba(0,0,0,0.1)';}}
            onMouseOut={e=>{(e.currentTarget as HTMLDivElement).style.transform='translateY(0) scale(1)';(e.currentTarget as HTMLDivElement).style.boxShadow='0 12px 32px rgba(0,0,0,0.07)';}}
          >
            <Image src="/mic01.jpeg" alt="P-86S" width={1200} height={800} unoptimized priority style={{ width:'100%', height:'auto', display:'block', filter:'contrast(0.95) brightness(1.02)' }} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ③ BLIND COMPARISON  #compare
      ══════════════════════════════════════════ */}
      <section id="compare" style={{ padding:'clamp(5rem,10vw,10rem) 5%', borderTop:'1px solid rgba(0,0,0,0.04)', position:'relative', overflow:'hidden' }}>
        <SectionNum n="02" />
        <div style={{ maxWidth:'920px', margin:'0 auto', textAlign:'center' }}>

          <div className="reveal">
            <p style={{ fontSize:'0.68rem', letterSpacing:'0.45em', textTransform:'uppercase', color:ACCENT, marginBottom:'1.5rem', fontFamily:sans }}>Blind Comparison</p>
            <h3 style={{ fontSize:'clamp(1.5rem,3.5vw,2.6rem)', fontWeight:'200', letterSpacing:'0.07em', lineHeight:'1.65', marginBottom:'1rem', fontFamily:serif, whiteSpace:'pre-line' }}>
              {t('3本のマイクを聴き比べてください。\nどれが総額100万円超の機材でしょう？','Listen to all three mics.\nCan you tell which uses $10,000+ in equipment?','Escucha los tres micrófonos.\n¿Puedes distinguir cuál usa equipos de $10,000+?')}
            </h3>
            <p style={{ fontSize:'clamp(0.85rem,1.2vw,0.95rem)', color:'var(--text-muted)', lineHeight:'1.9', marginBottom:'clamp(2.5rem,5vw,4rem)', fontFamily:serif }}>
              {t('同じ楽曲・同じ演奏空間で録音した3本の比較です。試聴後に答えをリビールできます。','Three microphones recorded in the same space. Reveal the answer after listening.','Tres micrófonos en el mismo espacio. Revela la respuesta después de escuchar.')}
            </p>
          </div>

          {/* 3 players */}
          <div style={{ display:'flex', gap:'clamp(0.75rem,2vw,1.25rem)', justifyContent:'center', flexWrap:'wrap', marginBottom:'clamp(2rem,4vw,3rem)' }}>
            {COMPARE.map(tr => {
              const playing = cPlaying === tr.id;
              return (
                <div key={tr.id} className="reveal"
                  style={{ ...glass, flex:'1 1 210px', maxWidth:'250px', padding:'clamp(1.5rem,3vw,2rem)',
                    border: revealed && tr.isHero ? `2px solid ${ACCENT}` : '1px solid rgba(255,255,255,1)',
                    position:'relative', transition:'all 0.4s ease',
                    transform: revealed && tr.isHero ? 'translateY(-4px)' : 'none',
                  }}>
                  {revealed && tr.isHero && (
                    <div style={{ position:'absolute', top:'-13px', left:'50%', transform:'translateX(-50%)', backgroundColor:ACCENT, color:'#fff', fontSize:'0.62rem', letterSpacing:'0.14em', fontFamily:sans, fontWeight:'700', padding:'0.25rem 0.9rem', borderRadius:'20px', whiteSpace:'nowrap', boxShadow:'0 4px 12px rgba(2,132,199,0.4)' }}>
                      {t('これが ¥13,900','This is ¥13,900','Este es ¥13,900')}
                    </div>
                  )}
                  <p style={{ fontSize:'0.68rem', letterSpacing:'0.35em', textTransform:'uppercase', color:ACCENT, marginBottom:'1.25rem', fontFamily:sans }}>Mic {tr.id}</p>
                  <div style={{ display:'flex', justifyContent:'center', marginBottom:'1.25rem' }}>
                    <PlayBtn playing={playing} onToggle={()=>toggleC(tr.id)} size={50} pulse={!playing} />
                  </div>
                  {playing && (
                    <div style={{ display:'flex', justifyContent:'center', marginBottom:'0.75rem' }}><Waveform active /></div>
                  )}
                  {!revealed && (
                    <p style={{ fontSize:'0.78rem', color:'#c0c8d0', fontFamily:sans, letterSpacing:'0.08em' }}>
                      {t('— 試聴してください —','— Listen first —','— Escucha primero —')}
                    </p>
                  )}
                  {revealed && (
                    <>
                      <p style={{ fontSize:'0.86rem', fontWeight:'600', color:'var(--text-main)', marginBottom:'0.35rem', fontFamily:sans, lineHeight:'1.3' }}>{tr.revealName[lang]}</p>
                      <p style={{ fontSize:'0.8rem', color: tr.isHero ? ACCENT : '#888', fontFamily:sans, letterSpacing:'0.04em', marginBottom:'0.3rem' }}>{tr.revealPrice[lang]}</p>
                      <p style={{ fontSize:'0.7rem', color:'#bbb', fontFamily:sans }}>+ {tr.recorder}</p>
                    </>
                  )}
                  <audio ref={cRefs[tr.id] as React.RefObject<HTMLAudioElement>} src={auUrl(tr.file)} onEnded={()=>setCPlaying(null)} onError={()=>setCPlaying(null)} style={{ display:'none' }} />
                </div>
              );
            })}
          </div>

          {/* Reveal / reset */}
          <div className="reveal">
            {!revealed ? (
              <button onClick={()=>setRevealed(true)} className="btn-shimmer"
                style={{ background:'none', border:`1.5px solid ${ACCENT}`, borderRadius:'50px', color:ACCENT, fontSize:'0.85rem', letterSpacing:'0.14em', fontFamily:sans, padding:'0.9rem 2.8rem', cursor:'pointer', transition:'all 0.25s', backgroundColor:'transparent' }}
                onMouseOver={e=>e.currentTarget.style.backgroundColor='rgba(2,132,199,0.07)'}
                onMouseOut={e=>e.currentTarget.style.backgroundColor='transparent'}
              >{t('答えを見る','Reveal Answer','Revelar Respuesta')}</button>
            ) : (
              <div>
                <div style={{ ...glass, padding:'clamp(1.5rem,3vw,2.5rem)', margin:'0 auto clamp(1.5rem,3vw,2rem) auto', maxWidth:'580px', border:`1px solid rgba(2,132,199,0.25)`, textAlign:'left' }}>
                  <p style={{ fontSize:'clamp(1rem,1.8vw,1.2rem)', fontWeight:'200', letterSpacing:'0.06em', lineHeight:'1.85', fontFamily:serif, color:'var(--text-main)', marginBottom:'0.75rem' }}>
                    {t('Mic A が DPA 4006（総額 ¥700,000 超）です。','Mic A is the DPA 4006 (total setup $7,000+).','Mic A es el DPA 4006 (total $7,000+).')}
                  </p>
                  <p style={{ fontSize:'clamp(0.9rem,1.4vw,1.1rem)', color:ACCENT, fontFamily:serif, lineHeight:'1.85', fontWeight:'300' }}>
                    {t('Mic B（P-86S ¥13,900）は、その音質に匹敵します。','Mic B (P-86S ¥13,900) matches that sound quality.','Mic B (P-86S ¥13,900) iguala esa calidad de sonido.')}
                  </p>
                </div>
                <button onClick={()=>setRevealed(false)} style={{ background:'none', border:'none', color:'#bbb', fontSize:'0.76rem', letterSpacing:'0.1em', fontFamily:sans, cursor:'pointer', textDecoration:'underline' }}>
                  {t('もう一度','Try again','Otra vez')}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Piano Blind Test injected */}
      <PianoCompare />

      {/* ══════════════════════════════════════════
          ④ MUSIC SAMPLES  #listen
      ══════════════════════════════════════════ */}
      <section id="listen" style={{ padding:'clamp(5rem,10vw,10rem) 5%', background:'rgba(255,255,255,0.35)', borderTop:'1px solid rgba(0,0,0,0.04)', position:'relative', overflow:'hidden' }}>
        <SectionNum n="03" />
        <div style={{ maxWidth:'800px', margin:'0 auto', textAlign:'center' }}>
          {/* Header + Category selector */}
          <div className="reveal" style={{ textAlign:'center', marginBottom:'clamp(1.5rem,3vw,2.5rem)' }}>
            <p style={{ fontSize:'0.68rem', letterSpacing:'0.45em', textTransform:'uppercase', color:ACCENT, marginBottom:'1.5rem', fontFamily:sans }}>Sound Samples</p>
            <h3 style={{ fontSize:'clamp(1.4rem,3vw,2.3rem)', fontWeight:'200', letterSpacing:'0.07em', marginBottom:'1rem', fontFamily:serif }}>
              {t('P-86S で録音した、本物の音。','Real sound, recorded with the P-86S.','Sonido real, grabado con el P-86S.')}
            </h3>
            <p style={{ fontSize:'0.82rem', color:'var(--text-muted)', fontFamily:serif, marginBottom:'clamp(1.5rem,3vw,2.5rem)' }}>
              {t('カテゴリーを選んで試聴してください。','Select a category to listen.','Seleccione una categoría para escuchar.')}
            </p>
            {/* Category tabs */}
            <div style={{ display:'inline-flex', gap:'0', background:'rgba(0,0,0,0.05)', borderRadius:'12px', padding:'4px' }}>
              {([
                ['music',   t('🎼 音楽収録','🎼 Music','🎼 Música')],
                ['field',   t('🌿 フィールド','🌿 Field','🌿 Campo')],
                ['podcast', t('🎙 Podcast','🎙 Podcast','🎙 Podcast')],
              ] as [typeof sampleCat, string][]).map(([cat,label])=>(
                <button key={cat} onClick={()=>setSampleCat(cat)}
                  style={{
                    background:sampleCat===cat?'#fff':'transparent',
                    color:sampleCat===cat?ACCENT:'var(--text-muted)',
                    border:'none', borderRadius:'9px',
                    padding:'0.55rem 1.1rem', fontSize:'0.82rem', fontFamily:sans,
                    cursor:'pointer', transition:'all 0.22s',
                    boxShadow:sampleCat===cat?'0 2px 8px rgba(0,0,0,0.1)':'none',
                    fontWeight:sampleCat===cat?'600':'400',
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Music ── */}
          {sampleCat === 'music' && (
            <div key="music" style={{ animation:'fadeInUp 0.35s ease' }}>

              {/* P-86S section */}
              <div style={{ marginBottom:'2.5rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.25rem' }}>
                  <div style={{ height:'1px', flex:1, background:'rgba(0,0,0,0.07)' }} />
                  <span style={{ fontSize:'0.65rem', fontFamily:sans, letterSpacing:'0.18em', color:ACCENT, whiteSpace:'nowrap', fontWeight:'600' }}>
                    P-86S プラグインパワー
                  </span>
                  <div style={{ height:'1px', flex:1, background:'rgba(0,0,0,0.07)' }} />
                </div>
                {(() => {
                  const p86music = SAMPLES.filter(s=>s.category==='music' && s.mic==='P-86S');
                  return p86music.map((s,idx) => {
                    const prev = idx > 0 ? p86music[idx-1] : null;
                    const showGroup = s.group && (!prev || prev.group !== s.group);
                    return (
                      <React.Fragment key={s.id}>
                        {showGroup && (
                          <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', margin:'1.25rem 0 0.75rem' }}>
                            <div style={{ height:'1px', flex:'0 0 20px', background:'rgba(0,0,0,0.08)' }} />
                            <span style={{ fontSize:'0.62rem', fontFamily:sans, letterSpacing:'0.12em', color:'var(--text-muted)', whiteSpace:'nowrap', fontStyle:'italic' }}>
                              {s.group}
                            </span>
                            <div style={{ height:'1px', flex:1, background:'rgba(0,0,0,0.06)' }} />
                          </div>
                        )}
                        <SamplePlayer src={auUrl(`p-86s/${s.file}`)} label={s.label[lang]} desc={s.desc[lang]} mic={s.mic} recorder={s.recorder} />
                        {idx < p86music.length-1 && <div style={{ height:'0.75rem' }} />}
                      </React.Fragment>
                    );
                  });
                })()}
              </div>

              {/* X-86S section */}
              <div style={{ marginBottom:'2rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.25rem' }}>
                  <div style={{ height:'1px', flex:1, background:'rgba(2,132,199,0.15)' }} />
                  <span style={{ fontSize:'0.65rem', fontFamily:sans, letterSpacing:'0.18em', color:ACCENT, whiteSpace:'nowrap', fontWeight:'600' }}>
                    X-86S ミニXLR版
                  </span>
                  <div style={{ height:'1px', flex:1, background:'rgba(2,132,199,0.15)' }} />
                </div>
                {SAMPLES.filter(s=>s.category==='music' && s.mic==='X-86S').map((s,idx,arr)=>(
                  <React.Fragment key={s.id}>
                    <SamplePlayer src={auUrl(`x-86s/${s.file}`)} label={s.label[lang]} desc={s.desc[lang]} mic={s.mic} recorder={s.recorder} />
                    {idx < arr.length-1 && <div style={{ height:'0.75rem' }} />}
                  </React.Fragment>
                ))}
              </div>

              {/* Mini CTAs */}
              <div style={{ display:'flex', gap:'0.75rem', justifyContent:'center', flexWrap:'wrap', marginTop:'1.5rem' }}>
                <BuyButton product="p-86s" style={{ ...ctaPrimary('sm'), fontSize:'0.8rem' }}>
                  {t('P-86S を購入する — ¥13,900','Buy P-86S — ¥13,900','Comprar P-86S — ¥13,900')}
                </BuyButton>
                <BuyButton product="x-86s" style={{ ...ctaOutline('sm'), fontSize:'0.8rem' }}>
                  {t('X-86S を購入する — ¥39,600','Buy X-86S — ¥39,600','Comprar X-86S — ¥39,600')}
                </BuyButton>
              </div>
            </div>
          )}

          {/* ── Field ── */}
          {sampleCat === 'field' && (
            <div key="field" style={{ animation:'fadeInUp 0.35s ease' }}>

              {/* X-86S first */}
              <div style={{ marginBottom:'2.5rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.25rem' }}>
                  <div style={{ height:'1px', flex:1, background:'rgba(2,132,199,0.15)' }} />
                  <span style={{ fontSize:'0.65rem', fontFamily:sans, letterSpacing:'0.18em', color:ACCENT, whiteSpace:'nowrap', fontWeight:'600' }}>
                    🇦🇺 X-86S ミニXLR版 × AUSTRALIA
                  </span>
                  <div style={{ height:'1px', flex:1, background:'rgba(2,132,199,0.15)' }} />
                </div>
                {SAMPLES.filter(s=>s.category==='field' && s.mic==='X-86S').map((s,idx,arr)=>(
                  <React.Fragment key={s.id}>
                    <SamplePlayer src={auUrl(`x-86s/${s.file}`)} label={s.label[lang]} desc={s.desc[lang]} mic={s.mic} recorder={s.recorder} />
                    {idx < arr.length-1 && <div style={{ height:'0.75rem' }} />}
                  </React.Fragment>
                ))}
              </div>

              {/* P-86S second */}
              <div style={{ marginBottom:'2rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.25rem' }}>
                  <div style={{ height:'1px', flex:1, background:'rgba(0,0,0,0.07)' }} />
                  <span style={{ fontSize:'0.65rem', fontFamily:sans, letterSpacing:'0.18em', color:ACCENT, whiteSpace:'nowrap', fontWeight:'600' }}>
                    🇯🇵 P-86S プラグインパワー × JAPAN
                  </span>
                  <div style={{ height:'1px', flex:1, background:'rgba(0,0,0,0.07)' }} />
                </div>
                {SAMPLES.filter(s=>s.category==='field' && s.mic==='P-86S').map((s,idx,arr)=>(
                  <React.Fragment key={s.id}>
                    <SamplePlayer src={auUrl(`p-86s/${s.file}`)} label={s.label[lang]} desc={s.desc[lang]} mic={s.mic} recorder={s.recorder} />
                    {idx < arr.length-1 && <div style={{ height:'0.75rem' }} />}
                  </React.Fragment>
                ))}
              </div>

              {/* Mini CTAs */}
              <div style={{ display:'flex', gap:'0.75rem', justifyContent:'center', flexWrap:'wrap', marginTop:'1.5rem' }}>
                <BuyButton product="p-86s" style={{ ...ctaPrimary('sm'), fontSize:'0.8rem' }}>
                  {t('P-86S を購入する — ¥13,900','Buy P-86S — ¥13,900','Comprar P-86S — ¥13,900')}
                </BuyButton>
                <BuyButton product="x-86s" style={{ ...ctaOutline('sm'), fontSize:'0.8rem' }}>
                  {t('X-86S を購入する — ¥39,600','Buy X-86S — ¥39,600','Comprar X-86S — ¥39,600')}
                </BuyButton>
              </div>
            </div>
          )}

          {/* ── Podcast ── */}
          {sampleCat === 'podcast' && (
            <div key="podcast" style={{ animation:'fadeInUp 0.35s ease', ...glass, padding:'clamp(3rem,6vw,5rem)', textAlign:'center' }}>
              <p style={{ fontSize:'2rem', marginBottom:'1rem' }}>🎙</p>
              <p style={{ fontSize:'clamp(1rem,1.8vw,1.1rem)', fontWeight:'200', letterSpacing:'0.1em', color:'var(--text-muted)', fontFamily:serif }}>
                {t('準備中です','Coming soon','Próximamente')}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ⑤ SOLDERING + QUOTE
      ══════════════════════════════════════════ */}
      <section style={{ padding:'clamp(5rem,10vw,10rem) 5%', background:'rgba(255,255,255,0.55)', borderTop:'1px solid rgba(0,0,0,0.04)', position:'relative', overflow:'hidden' }}>
        <SectionNum n="04" />
        <div style={{ maxWidth:'980px', margin:'0 auto' }}>
          <div className="reveal" style={{ textAlign:'center', marginBottom:'clamp(3rem,6vw,6rem)' }}>
            <p style={{ fontSize:'0.68rem', letterSpacing:'0.45em', textTransform:'uppercase', color:ACCENT, marginBottom:'1rem', fontFamily:sans }}>Aesthetical Soldering</p>
            <h3 style={{ fontSize:'clamp(1.4rem,3vw,2.3rem)', fontWeight:'200', letterSpacing:'0.07em', fontFamily:serif }}>
              {t('はんだが、音を決める。','Solder defines the sound.','La soldadura define el sonido.')}
            </h3>
          </div>
          <div style={{ display:'flex', gap:'clamp(2.5rem,5vw,5rem)', alignItems:'center', marginBottom:'clamp(3rem,6vw,5rem)', flexWrap:'wrap' }}>
            <div className="reveal reveal-delay-1"
              style={{ ...imgWrap, flex:'1 1 280px' }}
              onMouseOver={e=>{(e.currentTarget as HTMLDivElement).style.transform='translateY(-8px) scale(1.02)';(e.currentTarget as HTMLDivElement).style.boxShadow='0 24px 48px rgba(0,0,0,0.1)';}}
              onMouseOut={e=>{(e.currentTarget as HTMLDivElement).style.transform='translateY(0) scale(1)';(e.currentTarget as HTMLDivElement).style.boxShadow='0 12px 32px rgba(0,0,0,0.07)';}}
            >
              <Image src="/mic02.jpeg" alt="Hand-soldering" width={1200} height={900} unoptimized style={{ width:'100%', height:'auto', display:'block' }} />
            </div>
            <div className="reveal" style={{ flex:'1 1 300px', color:'var(--text-muted)', fontSize:'clamp(0.88rem,1.3vw,0.98rem)', lineHeight:'2.5', fontFamily:serif }}>
              <p style={{ marginBottom:'1.5em' }}>{t('素材の選定はオーディオの神様と呼ばれる金田明彦氏推奨のものを採用。朝比奈幸太郎が一本一本、丁寧に手はんだで製作しています。','Materials are selected following the recommendations of Akihiko Kaneda, revered as a god of audio engineering. Each unit is hand-soldered, one by one, by Kotaro Asahina.','Materiales según las recomendaciones de Akihiko Kaneda. Cada unidad soldada a mano por Kotaro Asahina.')}</p>
              <p>{t('はんだ付けは単なる接続作業ではありません。はんだの質が、そのまま音の個性となる——これが空音開発の製作哲学です。','Soldering is not mere assembly. The quality of the solder becomes the character of the sound itself.','Soldar no es mero ensamblaje. La calidad de la soldadura se convierte en el carácter del sonido.')}</p>
            </div>
          </div>
          {/* Quote */}
          <div className="reveal" style={{ position:'relative', overflow:'hidden', padding:'clamp(3rem,5vw,5rem) clamp(2rem,5vw,5rem)', ...glass, textAlign:'center' }}>
            <div aria-hidden style={{ position:'absolute', top:'-30px', left:'50%', transform:'translateX(-50%)', fontSize:'12rem', color:ACCENT, opacity:0.04, fontFamily:'"Times New Roman",serif', lineHeight:1, userSelect:'none', pointerEvents:'none' }}>&ldquo;</div>
            <div style={{ position:'relative', zIndex:1 }}>
              <p style={{ fontSize:'clamp(0.88rem,1.4vw,1.12rem)', fontWeight:'300', letterSpacing:'0.1em', lineHeight:'2.5', color:'var(--text-main)', margin:'0 0 2.5rem 0', fontFamily:serif, whiteSpace:'pre-line' }}>
                {t('たかがハンダ付けと安易に考えてはならない。\nハンダ付け1箇所で音が変わる。\n恐ろしいことにハンダ付けをした人間の性格が現れるのだ。\n几帳面な人では几帳面な音。大らかな性格な人では大らかな音。\n適当な性格な人では適当な音になる。\n不思議な事に几帳面過ぎても音は良くない。\n程よく几帳面で、程よく適当な人が音楽的に良い音を出す。','Never think of soldering as trivial.\nA single solder joint changes the sound.\nAstonishingly, the character of the person who soldered appears in the sound.\nA meticulous person, a meticulous sound; a generous person, a generous sound.\nA careless person, a careless sound.\nCuriously, even being too meticulous yields poor sound.\nThe one who is moderately meticulous and relaxed produces musically good sound.','Nunca pienses que soldar es trivial.\nUna sola junta de soldadura cambia el sonido.\nEl carácter de quien soldó aparece en el sonido.\nUna persona meticulosa produce sonido meticuloso; una generosa, sonido generoso.\nUna descuidada produce sonido descuidado.\nCuriosamente, ser demasiado meticuloso da mal resultado.\nQuien es moderadamente meticuloso y relajado produce buen sonido.')}
              </p>
              <div style={{ display:'inline-block', borderTop:'1px solid rgba(0,0,0,0.1)', paddingTop:'1rem' }}>
                <p style={{ fontSize:'0.76rem', color:'#999', letterSpacing:'0.08em', fontFamily:sans, margin:0 }}>
                  {t('引用：金田明彦著『オーディオDCアンプ制作のすべて上巻』（2003年3月7日）','Quoted from: Akihiko Kaneda, "All About Audio DC Amplifier Construction, Vol. 1" (March 7, 2003)','Citado de: Akihiko Kaneda, "Todo sobre amplificadores DC de audio, Vol. 1" (2003)')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ⑦ VIBRATION
      ══════════════════════════════════════════ */}
      <section style={{ padding:'clamp(5rem,10vw,10rem) 5%', borderTop:'1px solid rgba(0,0,0,0.04)', position:'relative', overflow:'hidden' }}>
        <div style={{ maxWidth:'980px', margin:'0 auto', display:'flex', gap:'clamp(2.5rem,5vw,5rem)', alignItems:'center', flexWrap:'wrap' }}>
          <div className="reveal" style={{ ...imgWrap, flex:'1 1 280px' }}
            onMouseOver={e=>{(e.currentTarget as HTMLDivElement).style.transform='translateY(-8px) scale(1.02)';(e.currentTarget as HTMLDivElement).style.boxShadow='0 24px 48px rgba(0,0,0,0.1)';}}
            onMouseOut={e=>{(e.currentTarget as HTMLDivElement).style.transform='translateY(0) scale(1)';(e.currentTarget as HTMLDivElement).style.boxShadow='0 12px 32px rgba(0,0,0,0.07)';}}
          >
            <Image src="/mic03.jpeg" alt="Recording Artist" width={1200} height={1000} unoptimized style={{ width:'100%', height:'auto', display:'block' }} />
          </div>
          <div className="reveal reveal-delay-2" style={{ flex:'1 1 300px' }}>
            <p style={{ fontSize:'0.68rem', letterSpacing:'0.45em', textTransform:'uppercase', color:ACCENT, marginBottom:'1.5rem', fontFamily:sans }}>Recording Artist&apos;s Vibration</p>
            <h3 style={{ fontSize:'clamp(1.3rem,2.5vw,2rem)', fontWeight:'200', letterSpacing:'0.07em', lineHeight:'1.8', marginBottom:'2rem', fontFamily:serif, whiteSpace:'pre-line' }}>
              {t("録音する人の魂が、\n音に宿る。","The soul of the recordist\nlives in the sound.","El alma del grabador\nvive en el sonido.")}
            </h3>
            <div style={{ color:'var(--text-muted)', fontSize:'clamp(0.88rem,1.3vw,0.98rem)', lineHeight:'2.5', fontFamily:serif }}>
              <p style={{ marginBottom:'1.5em' }}>{t('無指向性マイクのもう一つの特徴が、録音する人のバイブレーションが音に反映されること。録音対象に本当に感動していれば、本当に感動的な音で録音される。',"Another hallmark of omnidirectional microphones: the vibration of the recordist is reflected in the sound.",'Otra característica: la vibración del grabador se refleja en el sonido.')}</p>
              <p>{t('金田明彦氏が録音エンジニアのことを「録音アーティスト」と呼ぶ所以です。','This is why Akihiko Kaneda calls recording engineers "recording artists."','Por eso Akihiko Kaneda llama a los ingenieros de grabación "artistas de grabación."')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ⑧ SPEC & PRICE  #spec
      ══════════════════════════════════════════ */}
      <section id="spec" style={{ padding:'clamp(5rem,10vw,10rem) 5%', background:'rgba(255,255,255,0.55)', borderTop:'1px solid rgba(0,0,0,0.04)', position:'relative', overflow:'hidden' }}>
        <SectionNum n="05" />
        <div style={{ maxWidth:'860px', margin:'0 auto' }}>
          <div className="reveal" style={{ textAlign:'center', marginBottom:'clamp(3rem,5vw,5rem)' }}>
            <p style={{ fontSize:'0.68rem', letterSpacing:'0.45em', textTransform:'uppercase', color:ACCENT, marginBottom:'1.5rem', fontFamily:sans }}>Specifications</p>
            <h3 style={{ fontSize:'clamp(1.4rem,3vw,2.3rem)', fontWeight:'200', letterSpacing:'0.07em', fontFamily:sans }}>
              {t('モデル選択', 'Choose Your Model', 'Elige tu modelo')}
            </h3>
          </div>

          {/* Side-by-side model cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'clamp(1rem,2vw,1.5rem)', marginBottom:'clamp(3rem,5vw,4rem)' }}>
            {/* P-86S */}
            <div className="reveal" style={{ ...glass, padding:'clamp(2rem,4vw,3rem)', border:`2px solid ${ACCENT}`, position:'relative' }}>
              <div style={{ position:'absolute', top:'-13px', left:'50%', transform:'translateX(-50%)', backgroundColor:ACCENT, color:'#fff', fontSize:'0.65rem', letterSpacing:'0.14em', fontFamily:sans, fontWeight:'700', padding:'0.25rem 1rem', borderRadius:'20px', whiteSpace:'nowrap' }}>
                BESTSELLER
              </div>
              <h4 style={{ fontSize:'1.4rem', fontWeight:'300', letterSpacing:'0.1em', fontFamily:sans, marginBottom:'0.35rem' }}>P-86S</h4>
              <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', fontFamily:sans, marginBottom:'1.5rem' }}>Stereo Microphone</p>
              <div style={{ fontSize:'clamp(2.2rem,4vw,3rem)', fontWeight:'100', fontFamily:sans, marginBottom:'0.4rem' }}>¥13,900</div>
              <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', fontFamily:sans, marginBottom:'2rem' }}>{t('税込','tax incl.','IVA incl.')}</div>
              {[
                t('プラグインパワー対応（スマホ直結可）','Plug-in Power (direct to smartphone)','Alimentación por enchufe (directo al móvil)'),
                t('1本でABステレオ録音','Single unit AB stereo recording','Grabación estéreo AB con una unidad'),
                t('3.5mmステレオミニジャック','3.5mm stereo mini jack','Mini jack estéreo 3.5mm'),
                t('アコースティック楽器専用','For acoustic instruments','Para instrumentos acústicos'),
              ].map((f,i)=>(
                <div key={i} style={{ display:'flex', gap:'0.75rem', alignItems:'flex-start', marginBottom:'0.75rem' }}>
                  <span style={{ color:ACCENT, fontWeight:'700', flexShrink:0, marginTop:'0.05rem' }}>✓</span>
                  <span style={{ fontSize:'0.84rem', color:'var(--text-muted)', fontFamily:serif, lineHeight:'1.6' }}>{f}</span>
                </div>
              ))}
              <BuyButton product="p-86s" style={{ ...ctaPrimary(), width:'100%', marginTop:'1.5rem', justifyContent:'center', textAlign:'center' }}>
                {t('P-86S を購入する','Buy P-86S','Comprar P-86S')}
              </BuyButton>
            </div>

            {/* X-86S */}
            <div className="reveal reveal-delay-2" style={{ ...glass, padding:'clamp(2rem,4vw,3rem)' }}>
              <h4 style={{ fontSize:'1.4rem', fontWeight:'300', letterSpacing:'0.1em', fontFamily:sans, marginBottom:'0.35rem' }}>X-86S</h4>
              <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', fontFamily:sans, marginBottom:'1.5rem' }}>Professional Stereo Microphone</p>
              <div style={{ fontSize:'clamp(2.2rem,4vw,3rem)', fontWeight:'100', fontFamily:sans, marginBottom:'0.4rem' }}>¥39,600</div>
              <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', fontFamily:sans, marginBottom:'2rem' }}>{t('税込','tax incl.','IVA incl.')}</div>
              {[
                t('ミニXLR端子（バランス出力）','Mini XLR (balanced output)','Mini XLR (salida balanceada)'),
                t('48Vファンタム電源対応','48V phantom power','Alimentación phantom 48V'),
                t('スタジオ品質のABステレオ','Studio-grade AB stereo','Estéreo AB de calidad estudio'),
                t('アコースティック楽器専用','For acoustic instruments','Para instrumentos acústicos'),
              ].map((f,i)=>(
                <div key={i} style={{ display:'flex', gap:'0.75rem', alignItems:'flex-start', marginBottom:'0.75rem' }}>
                  <span style={{ color:ACCENT, fontWeight:'700', flexShrink:0, marginTop:'0.05rem' }}>✓</span>
                  <span style={{ fontSize:'0.84rem', color:'var(--text-muted)', fontFamily:serif, lineHeight:'1.6' }}>{f}</span>
                </div>
              ))}
              <BuyButton product="x-86s" style={{ ...ctaOutline(), width:'100%', marginTop:'1.5rem', justifyContent:'center', textAlign:'center', display:'inline-flex' }}>
                {t('X-86S を購入する','Buy X-86S','Comprar X-86S')}
              </BuyButton>
            </div>
          </div>

          {/* Common spec table */}
          <div className="reveal" style={{ ...glass, padding:'clamp(1.5rem,3vw,2.5rem)' }}>
            <p style={{ fontSize:'0.72rem', letterSpacing:'0.3em', textTransform:'uppercase', color:ACCENT, marginBottom:'1.25rem', fontFamily:sans }}>
              {t('共通仕様','Common Specifications','Especificaciones comunes')}
            </p>
            {([
              [t('指向性','Polar Pattern','Patrón'), t('無指向性（オムニ）','Omnidirectional','Omnidireccional')],
              [t('製作','Crafted By','Fabricado Por'), t('朝比奈幸太郎 — 完全ハンドメイド・一本一本手はんだ','Kotaro Asahina — fully handmade, hand-soldered','Kotaro Asahina — artesanal, soldado a mano')],
              [t('対象楽器','Instruments','Instrumentos'), t('アコースティック楽器全般（エレキ・ロック系は対象外）','All acoustic instruments (not for electric/rock)','Todos los instrumentos acústicos (no eléctricos/rock)')],
              [t('購入制限','Limit','Límite'), t('お一人様 3 点まで（受注生産品）','Max 3 per customer (made-to-order)','Máx. 3 por cliente')],
            ] as [string,string][]).map(([l,v],i,a)=>(
              <div key={i} style={{ display:'flex', gap:'1rem', padding:'0.9rem 0', borderBottom:i<a.length-1?'1px solid rgba(0,0,0,0.04)':'none', flexWrap:'wrap' }}>
                <span style={{ flex:'0 0 clamp(80px,18%,120px)', fontSize:'0.72rem', color:'#bbb', fontFamily:sans }}>{l}</span>
                <span style={{ flex:1, fontSize:'0.9rem', color:'var(--text-main)', lineHeight:'1.7', fontFamily:serif }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ⑨ PROFILE
      ══════════════════════════════════════════ */}
      <section style={{ padding:'clamp(5rem,10vw,10rem) 5%', borderTop:'1px solid rgba(0,0,0,0.04)' }}>
        <div className="reveal" style={{ maxWidth:'680px', margin:'0 auto', textAlign:'center' }}>
          <p style={{ fontSize:'0.68rem', letterSpacing:'0.45em', textTransform:'uppercase', color:ACCENT, marginBottom:'1.5rem', fontFamily:sans }}>Craftsperson</p>
          <Link href="/profile"
            aria-label={t('プロフィールを見る','View profile','Ver perfil')}
            style={{ display:'inline-block', textDecoration:'none', color:'inherit', transition:'opacity 0.25s ease, transform 0.25s ease' }}
            onMouseOver={e=>{ (e.currentTarget as HTMLElement).style.opacity='0.72'; (e.currentTarget as HTMLElement).style.transform='translateY(-2px)'; }}
            onMouseOut={e=>{ (e.currentTarget as HTMLElement).style.opacity='1'; (e.currentTarget as HTMLElement).style.transform='translateY(0)'; }}
          >
            <h3 style={{ fontSize:'clamp(1.2rem,2.5vw,1.8rem)', fontWeight:'200', letterSpacing:'0.1em', marginBottom:'0.5rem', fontFamily:serif, borderBottom:'1px solid rgba(2,132,199,0.25)', paddingBottom:'0.3rem', display:'inline-block' }}>朝比奈 幸太郎</h3>
            <p style={{ fontSize:'0.8rem', color:ACCENT, fontFamily:sans, letterSpacing:'0.1em', marginBottom:'clamp(1.5rem,3vw,2.5rem)', marginTop:'0.35rem' }}>Kotaro Asahina · 空音開発 Kuon R&amp;D&nbsp;<span aria-hidden="true">→</span></p>
          </Link>
          <div style={{ color:'var(--text-muted)', fontSize:'clamp(0.88rem,1.3vw,0.98rem)', lineHeight:'2.5', fontFamily:serif }}>
            <p style={{ marginBottom:'1.5em' }}>{t('音楽大学を卒業後、音響エンジニア・マイク設計者・音楽家として活動。GPS/RTK研究、Webエンジニアリングも手がける「空と音」の研究開発者。','After graduating from music university, Kotaro Asahina works as an acoustic engineer, microphone designer, and musician — a researcher at the intersection of sky and sound.','Tras graduarse de la universidad de música, trabaja como ingeniero acústico, diseñador de micrófonos y músico.')}</p>
            <p>{t('P-86S は自らの演奏体験から生まれたマイクです。一本一本、心を込めて製作しています。','The P-86S was born from his own performance experience. Each unit is crafted with care and soul.','El P-86S nació de su propia experiencia. Cada unidad con cuidado y alma.')}</p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ⑩ FINAL CTA
      ══════════════════════════════════════════ */}
      <section style={{ padding:'clamp(7rem,14vw,14rem) 5%', textAlign:'center', borderTop:'1px solid rgba(0,0,0,0.04)', background:'linear-gradient(180deg, transparent 0%, rgba(2,132,199,0.04) 100%)', position:'relative', overflow:'hidden' }}>
        <div aria-hidden style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
          <div style={{ position:'absolute', top:'20%', left:'-5%', width:'clamp(200px,30vw,400px)', height:'clamp(200px,30vw,400px)', borderRadius:'50%', background:'radial-gradient(circle, rgba(2,132,199,0.07) 0%, transparent 70%)', animation:'orbDrift 16s ease-in-out infinite' }} />
          <div style={{ position:'absolute', bottom:'15%', right:'-5%', width:'clamp(180px,28vw,380px)', height:'clamp(180px,28vw,380px)', borderRadius:'50%', background:'radial-gradient(circle, rgba(14,165,233,0.05) 0%, transparent 70%)', animation:'orbDriftReverse 20s ease-in-out infinite' }} />
        </div>
        <div className="reveal" style={{ position:'relative', zIndex:1 }}>
          <p style={{ fontSize:'0.68rem', letterSpacing:'0.5em', textTransform:'uppercase', color:ACCENT, marginBottom:'1.5rem', fontFamily:sans }}>
            {t('今すぐ手に入れる','Get Yours Today','Consíguelo Hoy')}
          </p>
          <h2 style={{ fontSize:'clamp(1.5rem,3.5vw,2.8rem)', fontWeight:'200', letterSpacing:'0.07em', lineHeight:'1.75', marginBottom:'clamp(2rem,4vw,3rem)', fontFamily:serif, whiteSpace:'pre-line', wordBreak:'keep-all', maxWidth:'640px', margin:'0 auto clamp(2rem,4vw,3rem) auto' }}>
            {t("音楽家のために、\n音楽家が作ったマイク。","A microphone made\nby a musician, for musicians.","Un micrófono hecho\npor un músico, para músicos.")}
          </h2>
          <div style={{ display:'flex', alignItems:'baseline', justifyContent:'center', gap:'0.5rem', marginBottom:'clamp(2.5rem,5vw,4rem)' }}>
            <span style={{ fontSize:'clamp(2.5rem,6vw,5rem)', fontWeight:'100', fontFamily:sans }}>¥13,900</span>
            <span style={{ fontSize:'0.9rem', color:'var(--text-muted)', fontFamily:sans }}>{t('税込','incl. tax','IVA')}</span>
          </div>
          <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap', justifyContent:'center' }}>
            <BuyButton product="p-86s" style={ctaPrimary('lg')}>
              {t('P-86S を購入する','Buy the P-86S','Comprar el P-86S')}
            </BuyButton>
            <BuyButton product="x-86s" style={{ ...ctaOutline(), ...ctaOutline('md'), padding:'clamp(1.2rem,2.5vw,1.6rem) clamp(2rem,4vw,4rem)' }}>
              {t('X-86S (¥39,600) →','X-86S (¥39,600) →','X-86S (¥39,600) →')}
            </BuyButton>
          </div>
          <p style={{ fontSize:'0.72rem', color:'#ccc', marginTop:'1.5rem', fontFamily:sans }}>
            {t('決済確認後 1〜3 営業日以内に発送 · 初期不良は3日以内にご連絡ください','Ships within 1–3 business days · Contact within 3 days for any defects','Envío en 1-3 días · Contacte en 3 días por defectos')}
          </p>
        </div>
      </section>

    </div>
  );
}
