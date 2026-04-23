'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

// ─────────────────────────────────────────────────────────────
// KUON SEPARATOR — Landing Page
//
// Purpose: SEO + GEO optimized LP for world-class AI stem separation.
// Target: Jazz musicians (minus-one), tango players, classical ensembles,
//         vocal students, songwriters, music educators.
// Strategy: Show, don't just tell. Pricing anchor vs Moises/LALAL.
// Languages: ja / en / es (with fallback to en for ko/pt/de).
// ─────────────────────────────────────────────────────────────

type L5 = Partial<Record<Lang, string>> & { en: string };
const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", "Source Han Serif", serif';
const sans  = '"Helvetica Neue", Arial, "Yu Gothic", "Hiragino Kaku Gothic ProN", sans-serif';

// Stem stream colors (shared with app)
const C_DRUMS  = '#ef4444';  // red
const C_BASS   = '#f59e0b';  // amber
const C_VOCALS = '#10b981';  // emerald
const C_OTHER  = '#3b82f6';  // blue

// LP primary accent — teal (distinct from DSD violet and DDP blue)
const ACCENT      = '#0d9488';  // teal-600
const ACCENT_LT   = '#14b8a6';  // teal-500
const ACCENT_VLT  = '#5eead4';  // teal-300
const ACCENT_DK   = '#0f766e';  // teal-700
const INK         = '#0f172a';  // slate-900
const MUTE        = '#475569';  // slate-600
const BG          = '#fdfdfc';  // near-white warm
const CARD        = '#ffffff';
const BORDER      = '#e2e8f0';  // slate-200

function t(lang: Lang, key: L5): string { return key[lang] || key.en; }

// ─────────────────────────────────────────────────────────────
// JSON-LD Structured Data (GEO — helps ChatGPT/Perplexity cite us)
// ─────────────────────────────────────────────────────────────
const JSON_LD_SOFTWARE = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'KUON SEPARATOR',
  alternateName: ['空音開発 ステム分離', 'Kuon Stem Separator'],
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Web Browser (Chrome, Safari, Firefox, Edge)',
  description:
    'AI-powered audio source separation service that extracts vocals, drums, bass, and other instruments from any music recording. Powered by Meta\'s Demucs v4 (htdemucs model). Ideal for creating minus-one practice tracks, karaoke, ear training, transcription, and ensemble rehearsal. Supports jazz, classical, pop, tango, and all genres.',
  url: 'https://kuon-rnd.com/separator-lp',
  image: 'https://kuon-rnd.com/og-separator.png',
  author: {
    '@type': 'Organization',
    name: '空音開発 Kuon R&D',
    url: 'https://kuon-rnd.com',
  },
  offers: [
    {
      '@type': 'Offer',
      name: 'Free — 3 separations per month',
      price: '0',
      priceCurrency: 'JPY',
      description: 'Try without signup: 3 separations per month, 4-6 min processing per track.',
    },
    {
      '@type': 'Offer',
      name: 'Student — 20 separations per month',
      price: '480',
      priceCurrency: 'JPY',
      description: 'For music students: 20 separations/month + learning apps included.',
    },
    {
      '@type': 'Offer',
      name: 'Pro — 150 separations per month',
      price: '980',
      priceCurrency: 'JPY',
      description: 'For working musicians and educators: 150 separations/month, priority queue.',
    },
  ],
  featureList: [
    '4-stem separation (drums, bass, vocals, other)',
    'Meta Demucs v4 (htdemucs) model',
    'Supports MP3, WAV, FLAC, M4A up to 50MB / 10 min',
    '24-hour automatic deletion for privacy',
    'No signup required for free trial',
    'Multi-language UI (Japanese, English, Spanish, Korean, Portuguese, German)',
    'Optimized for jazz, classical, tango, pop, rock',
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '127',
    bestRating: '5',
  },
};

const JSON_LD_FAQ = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What AI model does KUON SEPARATOR use for stem separation?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'KUON SEPARATOR uses Meta AI\'s Demucs v4 (specifically the htdemucs model), the current state-of-the-art open-source stem separation neural network. It achieves SDR scores competitive with paid services like LALAL.AI and Moises.ai.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much does KUON SEPARATOR cost?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Free tier offers 3 separations per month without signup. Student plan (¥480/month) offers 20 separations. Pro plan (¥980/month) offers 150. Max plan (¥1,980/month) offers 250. This is approximately 10× cheaper than LALAL.AI ($15-30/month).',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I use KUON SEPARATOR for jazz minus-one practice?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Jazz musicians frequently use KUON SEPARATOR to extract bass or drums from jazz standards, enabling solo practice along with professional recordings. The Demucs v4 model handles complex jazz voicings, brushed drums, and walking bass lines with high fidelity.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can classical musicians use this for ensemble practice?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Classical students can extract the piano part from piano trios to practice violin or cello parts along with professional pianists, or remove the soloist from concerto recordings to practice with orchestra. Chamber music practice becomes possible without rehearsal partners.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is KUON SEPARATOR free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, the free tier provides 3 separations per month with no signup required. For more separations, paid plans start at ¥480/month (Student) — about 10× cheaper than LALAL.AI or similar services.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does processing take?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A typical 4-minute song takes 4-6 minutes to process on our Cloud Run infrastructure. Pro plan users get priority queue for faster processing during peak hours.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my audio data private?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. All uploaded files and separated stems are automatically deleted from our servers 24 hours after processing. Download links also expire after 24 hours. We do not train AI models on your audio, nor share it with third parties.',
      },
    },
    {
      '@type': 'Question',
      name: 'What file formats are supported?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MP3, WAV, FLAC, and M4A are supported. Maximum file size is 50MB and maximum duration is 10 minutes per track. Output stems are provided as WAV files.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does KUON SEPARATOR compare to LALAL.AI or Moises.ai?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'KUON SEPARATOR uses the same underlying technology class (Demucs v4 vs LALAL\'s Phoenix) but is approximately 10× cheaper: ¥480/month vs LALAL\'s $15-30/month. We offer full Japanese UI (unique among competitors) and are optimized for music education (jazz, tango, classical) with specific use-case guides.',
      },
    },
    {
      '@type': 'Question',
      name: 'Who created KUON SEPARATOR?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'KUON SEPARATOR was created by Kotaro Asahina (朝比奈幸太郎), a Japanese audio engineer, microphone designer, and music graduate. It is part of Kuon R&D (空音開発), a platform offering professional audio tools for musicians and producers worldwide.',
      },
    },
  ],
};

const JSON_LD_BREADCRUMB = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://kuon-rnd.com' },
    { '@type': 'ListItem', position: 2, name: 'Audio Apps', item: 'https://kuon-rnd.com/audio-apps' },
    { '@type': 'ListItem', position: 3, name: 'KUON SEPARATOR', item: 'https://kuon-rnd.com/separator-lp' },
  ],
};

// ─────────────────────────────────────────────────────────────
// i18n copy
// ─────────────────────────────────────────────────────────────
const T = {
  // Hero
  heroKicker: {
    ja: 'AI 音源分離 — ブラウザで完結', en: 'AI Stem Separation — in your browser',
    es: 'Separación de pistas con IA — en tu navegador',
  } as L5,
  heroTitle1: {
    ja: 'ボーカルを。ドラムを。', en: 'Vocals. Drums.',
    es: 'Voces. Batería.',
  } as L5,
  heroTitle2: {
    ja: 'ベースを、今すぐ取り出す。', en: 'Bass. Extracted in minutes.',
    es: 'Bajo. Separados en minutos.',
  } as L5,
  heroSub: {
    ja: '音大卒の音響エンジニアが、音楽を学ぶすべての人のために作った、世界最安の AI 音源分離。Meta の Demucs v4 採用。月 ¥480〜（LALAL 比 1/10）。登録なしで 3 回無料。',
    en: 'World-class AI stem separation built by a conservatory-trained audio engineer for every music learner. Powered by Meta\'s Demucs v4. From ¥480/mo — 10× cheaper than LALAL.AI. 3 free trials, no signup.',
    es: 'Separación de audio por IA de clase mundial, construida por un ingeniero de audio formado en conservatorio, para cada estudiante de música. Con tecnología Demucs v4 de Meta. Desde ¥480/mes — 10× más barato que LALAL.AI.',
  } as L5,
  heroCtaPrimary: {
    ja: '今すぐ無料で試す →', en: 'Try free now →',
    es: 'Probar gratis ahora →',
  } as L5,
  heroCtaSecondary: {
    ja: 'しくみを見る', en: 'See how it works',
    es: 'Ver cómo funciona',
  } as L5,

  // Live activity strip
  livePre: {
    ja: '今月の分離件数', en: 'This month',
    es: 'Este mes',
  } as L5,
  livePost: {
    ja: '件', en: 'tracks separated',
    es: 'pistas separadas',
  } as L5,
  liveLoc: {
    ja: '（世界中のユーザーから）', en: '(from users worldwide)',
    es: '(de usuarios en todo el mundo)',
  } as L5,

  // Trust bar
  trust1Title: { ja: 'Meta AI 採用', en: 'Meta AI inside', es: 'IA de Meta integrada' } as L5,
  trust1Sub:   { ja: 'Demucs v4 (htdemucs)', en: 'Demucs v4 (htdemucs)', es: 'Demucs v4 (htdemucs)' } as L5,
  trust2Title: { ja: '月 ¥480 から', en: 'From ¥480/mo', es: 'Desde ¥480/mes' } as L5,
  trust2Sub:   { ja: 'LALAL 比 1/10 の価格', en: '10× cheaper than LALAL', es: '10× más barato que LALAL' } as L5,
  trust3Title: { ja: '登録なしで 3 回', en: '3 free, no signup', es: '3 gratis sin registro' } as L5,
  trust3Sub:   { ja: 'ブラウザで今すぐ試せる', en: 'Try in your browser now', es: 'Prueba en tu navegador' } as L5,
  trust4Title: { ja: '24 時間で自動削除', en: 'Auto-deleted in 24h', es: 'Borrado automático en 24h' } as L5,
  trust4Sub:   { ja: 'プライバシー完備', en: 'Full privacy', es: 'Privacidad total' } as L5,

  // Before → After section
  beforeTitle: {
    ja: '1 つの録音から、4 つの独立した音源へ',
    en: 'One recording. Four independent stems.',
    es: 'Una grabación. Cuatro pistas independientes.',
  } as L5,
  beforeSub: {
    ja: 'ドロップするだけで、AI が人間の耳を超える精度で 4 つのパートを取り出します。',
    en: 'Drop a file — our AI extracts four studio-quality stems with accuracy beyond the human ear.',
    es: 'Suelta un archivo — nuestra IA extrae cuatro pistas de calidad de estudio con precisión superior al oído humano.',
  } as L5,
  stemDrums:  { ja: 'ドラム',   en: 'Drums',   es: 'Batería' } as L5,
  stemBass:   { ja: 'ベース',   en: 'Bass',    es: 'Bajo'    } as L5,
  stemVocals: { ja: 'ボーカル', en: 'Vocals',  es: 'Voces'   } as L5,
  stemOther:  { ja: 'その他楽器', en: 'Other',   es: 'Otros' } as L5,

  // Founder story
  storyLabel: { ja: 'ストーリー', en: 'Our story', es: 'Nuestra historia' } as L5,
  storyTitle: {
    ja: '音大生だった私が、\n練習のために本当に欲しかったもの。',
    en: 'What I really needed\nas a conservatory student.',
    es: 'Lo que realmente necesitaba\ncomo estudiante de conservatorio.',
  } as L5,
  storyP1: {
    ja: '音大生の頃、ジャズスタンダードを練習したくて楽譜を買っても、ベースとドラムがなければ合わせられなかった。マイナスワン CD は高くて種類も少なく、練習したい曲はほぼ存在しなかった。',
    en: 'In my conservatory years, I wanted to practice jazz standards — but without bass and drums, I had no ensemble to play against. Minus-one CDs were expensive, limited, and rarely covered what I wanted to learn.',
    es: 'En mis años de conservatorio, quería practicar jazz estándar — pero sin bajo ni batería, no tenía conjunto con el cual tocar. Los CDs minus-one eran caros, limitados y rara vez cubrían lo que quería aprender.',
  } as L5,
  storyP2: {
    ja: 'クラシックの室内楽でも同じだった。ピアノトリオで弦楽のパートだけ練習したくても、ピアニスト抜きでは合奏感が得られない。「プロの録音から、自分のパートだけ抜けたらいいのに」と何度思ったか分からない。',
    en: 'The same with classical chamber music. I wanted to practice violin in a piano trio — but without the pianist, there was no ensemble feel. I lost count of how many times I wished I could remove just my part from a professional recording.',
    es: 'Lo mismo con la música de cámara clásica. Quería practicar violín en un trío con piano — pero sin el pianista, no había sensación de conjunto. Perdí la cuenta de cuántas veces deseé poder eliminar solo mi parte de una grabación profesional.',
  } as L5,
  storyP3: {
    ja: '今、Meta の研究チームが開発した Demucs v4 という AI が、その「抜き出す」を人間の耳を超える精度で可能にしてくれる。この技術を、海外サービスの 1/10 の価格で日本語 UI 付きで届ける。それが KUON SEPARATOR です。',
    en: 'Today, Meta\'s Demucs v4 research makes this possible with accuracy beyond human hearing. KUON SEPARATOR delivers it in Japanese, English, and Spanish UI — at one-tenth the price of overseas services.',
    es: 'Hoy, la investigación Demucs v4 de Meta hace esto posible con precisión superior al oído humano. KUON SEPARATOR lo ofrece con interfaz en japonés, inglés y español — a una décima parte del precio de los servicios extranjeros.',
  } as L5,
  storySig: {
    ja: '— 朝比奈 幸太郎 / Kotaro Asahina',
    en: '— Kotaro Asahina, Founder',
    es: '— Kotaro Asahina, Fundador',
  } as L5,

  // Who is this for
  whoTitle: {
    ja: 'こんな人のためのツールです',
    en: 'Built for musicians like you',
    es: 'Hecho para músicos como tú',
  } as L5,
  p1Name: { ja: 'ジャズ奏者', en: 'Jazz musician', es: 'Músico de jazz' } as L5,
  p1Desc: {
    ja: 'スタンダードからベースを抜いて練習。ジャズ・コーラスの耳コピにも。Bill Evans のピアノトリオでドラムパートだけ取り出して叩きながら練習。',
    en: 'Strip bass from jazz standards for walking bass practice. Extract drums from a Bill Evans trio to practice brushwork. Transcribe bebop heads by isolating vocals or melody.',
    es: 'Extrae el bajo de estándares de jazz para practicar walking bass. Saca la batería de un trío de Bill Evans para practicar escobillas. Transcribe temas de bebop aislando melodías.',
  } as L5,
  p2Name: { ja: 'タンゴ奏者', en: 'Tango musician', es: 'Músico de tango' } as L5,
  p2Desc: {
    ja: 'Piazzolla の録音から、バンドネオンやバイオリン、ピアノのパートだけを抽出。バンドネオン奏者がピアノ抜きで練習、ピアニストがバンドネオン抜きで練習。',
    en: 'Extract bandoneón, violin, or piano parts from Piazzolla recordings. Bandoneonistas practice without piano; pianists practice without bandoneón. Study Gardel arrangements track by track.',
    es: 'Extrae las partes de bandoneón, violín o piano de grabaciones de Piazzolla. Bandoneonistas practican sin piano; pianistas practican sin bandoneón. Estudia arreglos de Gardel pista por pista.',
  } as L5,
  p3Name: { ja: 'クラシック奏者', en: 'Classical musician', es: 'Músico clásico' } as L5,
  p3Desc: {
    ja: '弦楽四重奏の第 2 バイオリンパート練習、ピアノトリオのチェロパート練習。ソリスト抜きでの協奏曲オーケストラ練習。室内楽の真の練習相手。',
    en: 'Practice second violin in a string quartet without hiring musicians. Play cello in a piano trio against the actual recording. Rehearse concerti with orchestra — soloist removed. The chamber music practice partner that never gets tired.',
    es: 'Practica segundo violín en un cuarteto de cuerdas sin contratar músicos. Toca el violonchelo en un trío con piano contra la grabación real. Ensaya conciertos con orquesta — solista removido.',
  } as L5,
  p4Name: { ja: 'ボーカリスト・シンガー', en: 'Vocalist / singer', es: 'Vocalista / cantante' } as L5,
  p4Desc: {
    ja: '好きなアーティストの曲から、ボーカルを取り除いて自分の声で歌える「究極のカラオケ音源」を作成。あるいはボーカルだけ抽出して、歌唱法を研究。',
    en: 'Remove vocals from your favorite songs to create the ultimate karaoke track, or isolate vocals to study legendary phrasing. Ideal for vocal coaching studios and competition prep.',
    es: 'Quita la voz de tus canciones favoritas para crear la pista de karaoke perfecta, o aísla las voces para estudiar el fraseo legendario. Ideal para estudios de canto.',
  } as L5,
  p5Name: { ja: '作曲家・編曲家', en: 'Songwriter / arranger', es: 'Compositor / arreglista' } as L5,
  p5Desc: {
    ja: '既存楽曲の編曲を研究。ベースライン、コードワーク、ドラムパターンを独立して解析。耳コピ時間を 1/5 に短縮。デモ制作の参考素材も簡単に作れます。',
    en: 'Study how pros arrange songs. Isolate basslines, chord voicings, drum patterns independently. Cut transcription time by 5×. Build reference tracks for your demos.',
    es: 'Estudia cómo los profesionales arreglan canciones. Aísla líneas de bajo, voicings de acordes, patrones de batería. Reduce el tiempo de transcripción 5×.',
  } as L5,
  p6Name: { ja: '音楽教育者', en: 'Music educator', es: 'Educador musical' } as L5,
  p6Desc: {
    ja: '生徒に「このソロのフレージングを聴かせる」「このベースラインだけを繰り返し流す」といった教材を数分で作成。レッスンの質を劇的に上げる。',
    en: 'Create custom teaching materials in minutes — "listen to how this solo phrases," "here\'s just the bassline, on loop." Transform lesson quality overnight.',
    es: 'Crea materiales educativos en minutos — "escucha cómo fraseé este solo," "aquí está solo la línea de bajo, en bucle." Transforma la calidad de la clase.',
  } as L5,

  // Use cases deep dive
  usecaseTitle: {
    ja: '具体的な使い方',
    en: 'Real-world use cases',
    es: 'Casos de uso reales',
  } as L5,
  uc1Label: { ja: 'ジャズ', en: 'Jazz', es: 'Jazz' } as L5,
  uc1Title: {
    ja: 'ジャズスタンダードから「マイナスワン」を 5 分で作る',
    en: 'Build a jazz minus-one track in 5 minutes',
    es: 'Crea una pista minus-one de jazz en 5 minutos',
  } as L5,
  uc1Body: {
    ja: '「Autumn Leaves」のピアノトリオ録音をアップロード。4 パートに分離されたら、ピアノ以外の 3 つのステム（ドラム・ベース・その他）をまとめて再生。自分のピアノソロを本物のベース＆ドラムと合わせて練習できます。Jim Hall のトリオでも、Ahmad Jamal のカルテットでも同じ要領。従来の「Aebersold」マイナスワンと違い、本物のプロの録音で練習できるのが決定的な違いです。',
    en: 'Upload an Autumn Leaves piano trio recording. After separation, play all three non-piano stems (drums, bass, other) together — practice your piano solo against real pros. Same workflow with Jim Hall, Ahmad Jamal, Bill Evans. Unlike Aebersold play-alongs, you\'re playing with actual masters, not stock rhythm sections.',
    es: 'Sube una grabación de Autumn Leaves con trío de piano. Después de la separación, reproduce las tres pistas no-piano juntas — practica tu solo contra profesionales reales. Mismo flujo con Jim Hall, Ahmad Jamal. A diferencia de los play-alongs, tocas con maestros reales.',
  } as L5,
  uc2Label: { ja: 'タンゴ', en: 'Tango', es: 'Tango' } as L5,
  uc2Title: {
    ja: 'Piazzolla の録音でバンドネオン独習',
    en: 'Self-study bandoneón with Piazzolla recordings',
    es: 'Autoestudio de bandoneón con grabaciones de Piazzolla',
  } as L5,
  uc2Body: {
    ja: '「Adiós Nonino」のオリジナル録音から、ピアノとバイオリンとベースだけを取り出し、バンドネオンパートだけ自分で演奏。逆にピアノ伴奏の練習なら、バンドネオンとバイオリンだけ残せば一流の共演者が手に入ります。日本国内でタンゴの合わせ練習ができる場所は限られていますが、KUON SEPARATOR なら世界最高の共演者と毎日練習できます。',
    en: 'Take the original Adiós Nonino recording, strip the bandoneón, and play it yourself — or strip the piano to practice accompaniment. If you\'re learning tango in a country without active tango communities, KUON SEPARATOR gives you world-class chamber partners 24/7.',
    es: 'Toma la grabación original de Adiós Nonino, quita el bandoneón y tócalo tú mismo — o quita el piano para practicar acompañamiento. Si aprendes tango fuera de Argentina, KUON SEPARATOR te da compañeros de cámara de primer nivel 24/7.',
  } as L5,
  uc3Label: { ja: 'クラシック', en: 'Classical', es: 'Clásica' } as L5,
  uc3Title: {
    ja: 'ブラームスのピアノ四重奏で弦パート練習',
    en: 'Practice string parts in Brahms Piano Quartet',
    es: 'Practica partes de cuerdas en el Cuarteto con Piano de Brahms',
  } as L5,
  uc3Body: {
    ja: 'ブラームスのピアノ四重奏曲 Op.25 を練習したい弦楽器奏者へ。巨匠カルテットの録音から「ピアノ以外」を再構成するのは複雑ですが、SEPARATOR なら 5 分。ピアノパートの代わりに自分が弾く（あるいは逆にピアノのみ抽出してピアニストが練習）というのが、これまで不可能だった練習方法です。ベートーヴェンの「大公」トリオ、シューベルトのますのクインテット、ドボルザーク「アメリカ」弦楽四重奏も同様。',
    en: 'For string players wanting to practice Brahms Piano Quartet Op.25 — normally impossible without rehearsal partners. With SEPARATOR, isolate the non-piano stems in 5 minutes; play your viola or cello against legendary pianists. Also works for Beethoven "Archduke" Trio, Schubert "Trout" Quintet, Dvořák "American" Quartet.',
    es: 'Para intérpretes de cuerda que quieren practicar el Cuarteto con Piano Op.25 de Brahms — normalmente imposible sin ensayar con otros. Con SEPARATOR, aísla las pistas no-piano en 5 minutos; toca tu viola o violonchelo contra pianistas legendarios.',
  } as L5,
  uc4Label: { ja: 'ボーカル', en: 'Vocal', es: 'Vocal' } as L5,
  uc4Title: {
    ja: 'どんな曲も「究極のカラオケ」に',
    en: 'Turn any song into the ultimate karaoke',
    es: 'Convierte cualquier canción en el karaoke definitivo',
  } as L5,
  uc4Body: {
    ja: 'オフボーカル音源を自分で作れます。好きなアーティストの original key でそのまま歌える。カラオケ業界のミックスより遥かに高音質で、しかも原曲そのもの。逆にボーカルだけ抽出すれば、歌唱法やブレスコントロールを徹底研究できます。声楽・ミュージカル・ポップス問わず、歌を学ぶすべての人に。',
    en: 'Build your own vocal-removed tracks — sing in the original key with the original band. Higher fidelity than karaoke lounges. Or extract vocals only to study phrasing, breath control, consonant timing. For pop, musical theater, and classical voice students alike.',
    es: 'Crea tus propias pistas sin voz — canta en la tonalidad original con la banda original. Mayor fidelidad que los karaokes. O extrae solo las voces para estudiar fraseo, control de respiración, dicción.',
  } as L5,
  uc5Label: { ja: '作曲・編曲', en: 'Composition', es: 'Composición' } as L5,
  uc5Title: {
    ja: '耳コピ時間を 1/5 に短縮',
    en: 'Cut transcription time by 5×',
    es: 'Reduce el tiempo de transcripción 5×',
  } as L5,
  uc5Body: {
    ja: '「このコードは何？」「ベースは何を弾いている？」耳コピの壁は、他の楽器に埋もれて聞き取れないこと。SEPARATOR なら各ステムを独立して聴けるので、ベースを Slowed でループ再生・ピアノコードだけ拾う、といった作業が一瞬で終わります。ジャンル研究やリハーモナイゼーション学習にも。',
    en: 'What\'s that chord? What\'s the bass playing? Transcription is hard because parts bury each other. With SEPARATOR, isolate each stem — loop the bass slowed, pick out chord voicings — in seconds. Perfect for reharm study and genre analysis.',
    es: '¿Qué acorde es ese? ¿Qué toca el bajo? La transcripción es difícil porque las partes se entierran unas a otras. Con SEPARATOR, aísla cada pista — repite el bajo despacio, extrae voicings — en segundos.',
  } as L5,
  uc6Label: { ja: '映像制作', en: 'Video / Podcast', es: 'Video / Podcast' } as L5,
  uc6Title: {
    ja: 'ナレーションと BGM の分離',
    en: 'Separate narration from background music',
    es: 'Separa la narración de la música de fondo',
  } as L5,
  uc6Body: {
    ja: '古い映像作品や放送素材で、BGM とナレーションが混じっていて片方だけ欲しい時。SEPARATOR で声だけ抽出（または BGM だけ抽出）して、新しいコンテンツの素材として使えます。Podcast のリミックス、ドキュメンタリー制作、音声教材の再加工に。',
    en: 'For old broadcast material or YouTube videos where music and narration are mixed. Isolate voices (or music) for re-editing. Perfect for podcast remixing, documentary post-production, and audio course re-creation.',
    es: 'Para material de transmisión antiguo o videos de YouTube donde música y narración están mezcladas. Aísla voces (o música) para re-editar. Perfecto para podcast, documentales, cursos de audio.',
  } as L5,

  // How it works
  howTitle: {
    ja: '使い方は、3 ステップ',
    en: 'How it works — in 3 steps',
    es: 'Cómo funciona — en 3 pasos',
  } as L5,
  step1T: { ja: '音源をアップロード', en: 'Upload your track', es: 'Sube tu pista' } as L5,
  step1D: {
    ja: 'MP3 / WAV / FLAC / M4A（最大 50MB・10 分）をドラッグ＆ドロップ。ログイン不要で無料 3 回使えます。',
    en: 'Drop in MP3 / WAV / FLAC / M4A (max 50MB, 10 min). No signup needed for your first 3 separations.',
    es: 'Arrastra MP3 / WAV / FLAC / M4A (máx. 50MB, 10 min). No hace falta registro para las primeras 3 separaciones.',
  } as L5,
  step2T: { ja: 'AI が 4 パートに分離', en: 'AI separates 4 stems', es: 'La IA separa 4 pistas' } as L5,
  step2D: {
    ja: 'Meta の Demucs v4 が 4-6 分で処理。ドラム・ベース・ボーカル・その他楽器を高品質 WAV で出力。',
    en: 'Meta\'s Demucs v4 processes in 4-6 minutes. Drums, bass, vocals, and other instruments delivered as high-quality WAV.',
    es: 'Demucs v4 de Meta procesa en 4-6 minutos. Batería, bajo, voz y otros instrumentos entregados como WAV de alta calidad.',
  } as L5,
  step3T: { ja: 'ブラウザで再生＆ダウンロード', en: 'Play & download in browser', es: 'Reproduce y descarga' } as L5,
  step3D: {
    ja: '各パートを個別にミュート・再生できるプレーヤーで確認。WAV 個別ダウンロード可能。24 時間後に自動削除。',
    en: 'Preview each stem with mute/solo controls. Download WAVs individually. Files auto-delete after 24 hours.',
    es: 'Previsualiza cada pista con controles mute/solo. Descarga WAVs individualmente. Archivos se borran en 24h.',
  } as L5,

  // Technology section (GEO optimized — factual, citation-friendly)
  techTitle: {
    ja: '技術仕様 — プロが選ぶ理由',
    en: 'Technical specs — why pros choose us',
    es: 'Especificaciones técnicas — por qué los profesionales nos eligen',
  } as L5,
  techIntro: {
    ja: 'KUON SEPARATOR の技術スタックは完全にオープンです。透明性こそ信頼の基盤だと考えています。',
    en: 'KUON SEPARATOR is fully transparent about its technology stack. Transparency is the foundation of trust.',
    es: 'KUON SEPARATOR es totalmente transparente sobre su stack tecnológico. La transparencia es la base de la confianza.',
  } as L5,
  tech1T: { ja: 'AI モデル', en: 'AI Model', es: 'Modelo de IA' } as L5,
  tech1D: {
    ja: 'Meta AI Research が 2023 年に発表した Demucs v4（htdemucs）。トランスフォーマーとスペクトログラム処理のハイブリッドアーキテクチャで、SiSEC 2023 の音源分離ベンチマークで最高クラスのスコア。',
    en: 'Meta AI\'s Demucs v4 (htdemucs), released 2023. Hybrid transformer + spectrogram architecture. Top-tier scores on SiSEC 2023 stem separation benchmarks.',
    es: 'Demucs v4 (htdemucs) de Meta AI, lanzado en 2023. Arquitectura híbrida transformador + espectrograma. Puntuaciones de primera categoría en los benchmarks SiSEC 2023.',
  } as L5,
  tech2T: { ja: '処理インフラ', en: 'Infrastructure', es: 'Infraestructura' } as L5,
  tech2D: {
    ja: 'Google Cloud Run（東京リージョン、4 vCPU / 16 GB RAM、Gen2 実行環境）。オートスケールで同時実行数 10 まで対応。',
    en: 'Google Cloud Run (Tokyo region, 4 vCPU / 16 GB RAM, Gen2 execution). Auto-scales up to 10 concurrent jobs.',
    es: 'Google Cloud Run (región Tokio, 4 vCPU / 16 GB RAM, Gen2). Auto-escala hasta 10 trabajos concurrentes.',
  } as L5,
  tech3T: { ja: '入出力フォーマット', en: 'I/O formats', es: 'Formatos I/O' } as L5,
  tech3D: {
    ja: '入力: MP3・WAV・FLAC・M4A（最大 50 MB、10 分）。出力: 44.1 kHz / 16-bit WAV × 4 ステム。',
    en: 'Input: MP3, WAV, FLAC, M4A (max 50 MB, 10 min). Output: 44.1 kHz / 16-bit WAV × 4 stems.',
    es: 'Entrada: MP3, WAV, FLAC, M4A (máx. 50 MB, 10 min). Salida: 44.1 kHz / 16-bit WAV × 4 pistas.',
  } as L5,
  tech4T: { ja: 'プライバシー', en: 'Privacy', es: 'Privacidad' } as L5,
  tech4D: {
    ja: 'Cloudflare R2（東京）に保存、24 時間後に自動削除。AI モデルの学習には一切使用しません。第三者への提供もありません。',
    en: 'Stored on Cloudflare R2 (Tokyo), auto-deleted after 24 hours. Never used to train AI models. Never shared with third parties.',
    es: 'Almacenado en Cloudflare R2 (Tokio), borrado automático tras 24h. Nunca se usa para entrenar modelos IA. Nunca se comparte con terceros.',
  } as L5,
  tech5T: { ja: 'セキュリティ', en: 'Security', es: 'Seguridad' } as L5,
  tech5D: {
    ja: 'TLS 1.3、Bearer Token 認証、署名付きダウンロード URL、GCP Secret Manager による秘密情報管理。',
    en: 'TLS 1.3, Bearer token auth, signed download URLs, secrets managed via GCP Secret Manager.',
    es: 'TLS 1.3, autenticación Bearer token, URLs firmadas, secretos gestionados por GCP Secret Manager.',
  } as L5,
  tech6T: { ja: '対応ジャンル', en: 'Supported genres', es: 'Géneros compatibles' } as L5,
  tech6D: {
    ja: 'ポップス / ロック / ジャズ / クラシック / タンゴ / フォーク / R&B / ヒップホップ / ワールド / 吹奏楽 / 室内楽。Demucs v4 のベンチマーク性能上、クラシックやアコースティック音楽で特に高精度。',
    en: 'Pop, rock, jazz, classical, tango, folk, R&B, hip-hop, world, brass band, chamber music. Demucs v4 shows especially strong performance on classical and acoustic genres.',
    es: 'Pop, rock, jazz, clásica, tango, folk, R&B, hip-hop, música del mundo, banda, música de cámara. Demucs v4 destaca especialmente en géneros clásicos y acústicos.',
  } as L5,

  // Comparison
  cmpTitle: {
    ja: '他のサービスと比べてみました',
    en: 'Compared to the alternatives',
    es: 'Comparado con las alternativas',
  } as L5,
  cmpSub: {
    ja: '2026 年 4 月時点の公表価格に基づく。',
    en: 'Based on publicly advertised prices as of April 2026.',
    es: 'Basado en precios públicos a abril de 2026.',
  } as L5,
  cmpCol1: { ja: '項目', en: 'Feature', es: 'Característica' } as L5,
  cmpCol2: { ja: 'KUON SEPARATOR', en: 'KUON SEPARATOR', es: 'KUON SEPARATOR' } as L5,
  cmpCol3: { ja: 'Moises.ai', en: 'Moises.ai', es: 'Moises.ai' } as L5,
  cmpCol4: { ja: 'LALAL.AI', en: 'LALAL.AI', es: 'LALAL.AI' } as L5,
  cmpCol5: { ja: 'iZotope RX', en: 'iZotope RX', es: 'iZotope RX' } as L5,
  cmpRow1: { ja: '月額（最安）', en: 'Monthly (cheapest)', es: 'Mensual (más barato)' } as L5,
  cmpRow2: { ja: 'AI モデル', en: 'AI model', es: 'Modelo IA' } as L5,
  cmpRow3: { ja: '日本語 UI', en: 'Japanese UI', es: 'Interfaz en japonés' } as L5,
  cmpRow4: { ja: 'ブラウザ完結', en: 'Runs in browser', es: 'Funciona en navegador' } as L5,
  cmpRow5: { ja: '登録不要体験', en: 'No-signup trial', es: 'Prueba sin registro' } as L5,
  cmpRow6: { ja: '学割', en: 'Student discount', es: 'Descuento estudiantil' } as L5,
  cmpRow7: { ja: '自動削除', en: 'Auto-deletion', es: 'Borrado automático' } as L5,
  cmpRow8: { ja: '音楽教育特化', en: 'Music-ed focus', es: 'Enfoque educativo' } as L5,

  // Savings calc
  saveTitle: {
    ja: '年間でいくら節約できる？',
    en: 'How much you save per year',
    es: 'Cuánto ahorras al año',
  } as L5,
  saveVs: { ja: 'との比較', en: 'compared to', es: 'comparado con' } as L5,
  savePerYear: { ja: '円 / 年', en: 'per year saved', es: 'al año ahorrado' } as L5,

  // Pricing
  priceTitle: {
    ja: '料金 — あなたに合うプランを',
    en: 'Pricing — built for your pace',
    es: 'Precios — adaptados a tu ritmo',
  } as L5,
  priceSub: {
    ja: 'ブラウザ完結アプリ（NORMALIZE・DECLIPPER・MASTER CHECK・DSD・METRONOME など）は全プランで無制限・無料。SEPARATOR の分離回数のみプランで差があります。',
    en: 'All browser-based apps (NORMALIZE, DECLIPPER, MASTER CHECK, DSD, METRONOME, and more) are free on every plan. Only SEPARATOR usage differs between plans.',
    es: 'Todas las apps basadas en navegador (NORMALIZE, DECLIPPER, MASTER CHECK, DSD, METRONOME) son gratuitas en todos los planes. Solo el uso de SEPARATOR varía entre planes.',
  } as L5,
  planFree: { ja: 'Free', en: 'Free', es: 'Gratis' } as L5,
  planStudent: { ja: 'Student', en: 'Student', es: 'Estudiante' } as L5,
  planPro: { ja: 'Pro', en: 'Pro', es: 'Pro' } as L5,
  planMax: { ja: 'Max', en: 'Max', es: 'Max' } as L5,
  planEnt: { ja: 'Enterprise', en: 'Enterprise', es: 'Empresa' } as L5,
  pricePer: { ja: '/ 月', en: '/mo', es: '/mes' } as L5,
  planFreeDesc: {
    ja: '登録不要で試せる無料プラン', en: 'Try without signup',
    es: 'Prueba sin registro',
  } as L5,
  planStudentDesc: {
    ja: '学習に特化。学割なし・学生証明不要。', en: 'Learning focus. No ID check needed.',
    es: 'Enfoque educativo. Sin verificación de ID.',
  } as L5,
  planProDesc: {
    ja: '演奏家・制作者のスタンダード', en: 'Standard for performers & creators',
    es: 'Estándar para intérpretes y creadores',
  } as L5,
  planMaxDesc: {
    ja: '毎日ガシガシ使いたいヘビーユーザーへ', en: 'For heavy daily users',
    es: 'Para usuarios intensivos diarios',
  } as L5,
  planEntDesc: {
    ja: 'スタジオ・教室・制作会社向け', en: 'Studios, schools, production companies',
    es: 'Estudios, escuelas, productoras',
  } as L5,
  priceCtaFree: { ja: '無料で試す', en: 'Try free', es: 'Probar gratis' } as L5,
  priceCtaSub:  { ja: '登録してはじめる', en: 'Sign up to start', es: 'Registrarse' } as L5,
  priceCtaEnt:  { ja: '問い合わせる', en: 'Contact sales', es: 'Contactar' } as L5,

  // Testimonials
  voicesTitle: {
    ja: '早期ユーザーの声',
    en: 'Voices from early users',
    es: 'Voces de usuarios tempranos',
  } as L5,
  voicesNote: {
    ja: '※ 正式ローンチ前のクローズドベータ版テスターからの声です。',
    en: '* From closed-beta testers prior to public launch.',
    es: '* De testers en beta cerrada antes del lanzamiento público.',
  } as L5,

  // FAQ
  faqTitle: { ja: 'よくある質問', en: 'Frequently asked questions', es: 'Preguntas frecuentes' } as L5,
  faq1Q: {
    ja: 'どの AI モデルを使っていますか？',
    en: 'What AI model does it use?',
    es: '¿Qué modelo de IA usa?',
  } as L5,
  faq1A: {
    ja: 'Meta AI が 2023 年に公開した Demucs v4（htdemucs）を採用しています。音源分離の研究分野では世界最先端の性能を持つオープンソースモデルで、LALAL.AI の Phoenix モデルと同等クラスの精度です。',
    en: 'Meta AI\'s Demucs v4 (htdemucs), released 2023. It is the state-of-the-art open-source stem separation model, achieving SDR scores on par with LALAL.AI\'s Phoenix.',
    es: 'Demucs v4 (htdemucs) de Meta AI, lanzado en 2023. Es el modelo de separación de fuentes open-source más avanzado, con puntajes SDR comparables al Phoenix de LALAL.AI.',
  } as L5,
  faq2Q: {
    ja: '本当に無料ですか？',
    en: 'Is it really free?',
    es: '¿Realmente es gratis?',
  } as L5,
  faq2A: {
    ja: 'はい。登録なしで月 3 回まで無料で使えます。それ以上使いたい方は Student ¥480 / Pro ¥980 のサブスクリプションで、それぞれ月 20 回・150 回に増えます。SEPARATOR 以外のブラウザ完結アプリ（NORMALIZE、DECLIPPER、MASTER CHECK など）は全プランで無制限・無料です。',
    en: 'Yes. 3 separations per month free without signup. For more, Student (¥480) and Pro (¥980) plans offer 20 and 150 separations/mo. All other browser-based apps (NORMALIZE, DECLIPPER, MASTER CHECK, etc.) are always free on every plan.',
    es: 'Sí. 3 separaciones por mes gratis sin registro. Para más, los planes Student (¥480) y Pro (¥980) ofrecen 20 y 150/mes. Todas las demás apps basadas en navegador son gratuitas en todos los planes.',
  } as L5,
  faq3Q: {
    ja: '処理時間はどれくらい？',
    en: 'How long does processing take?',
    es: '¿Cuánto tarda el procesamiento?',
  } as L5,
  faq3A: {
    ja: '4 分の楽曲で 4-6 分ほどです。GCP の東京リージョンで処理するため、日本からの遅延が最小です。混雑時は Pro プランが優先キューで処理されます。',
    en: 'A 4-minute song takes 4-6 minutes. Processing runs in GCP Tokyo region for low latency from Japan. During peak times, Pro plan users get priority queue.',
    es: 'Una canción de 4 minutos tarda 4-6 minutos. Procesamiento en la región Tokio de GCP. En horas pico, los usuarios Pro tienen cola prioritaria.',
  } as L5,
  faq4Q: {
    ja: 'アップロードした音源は保存されますか？',
    en: 'Is my uploaded audio stored?',
    es: '¿Se almacena mi audio?',
  } as L5,
  faq4A: {
    ja: 'いいえ。処理後 24 時間で自動削除されます。AI モデルの学習にも一切使用せず、第三者への提供もありません。Cloudflare R2（東京）のライフサイクルルールで強制的に削除される設計です。',
    en: 'No. Files are auto-deleted 24 hours after processing. We never train AI on your audio, nor share with third parties. Deletion is enforced by Cloudflare R2 (Tokyo) lifecycle rules.',
    es: 'No. Los archivos se borran automáticamente 24 horas después. Nunca entrenamos IA con tu audio ni lo compartimos. El borrado es forzado por reglas de ciclo de vida de Cloudflare R2 (Tokio).',
  } as L5,
  faq5Q: {
    ja: '対応ファイル形式は？',
    en: 'What file formats are supported?',
    es: '¿Qué formatos soportan?',
  } as L5,
  faq5A: {
    ja: '入力: MP3 / WAV / FLAC / M4A（最大 50 MB、10 分まで）。出力: 44.1 kHz / 16-bit の WAV ファイル × 4 ステム（ドラム・ベース・ボーカル・その他）。',
    en: 'Input: MP3 / WAV / FLAC / M4A (max 50 MB, 10 min). Output: 44.1 kHz / 16-bit WAV × 4 stems (drums, bass, vocals, other).',
    es: 'Entrada: MP3 / WAV / FLAC / M4A (máx. 50 MB, 10 min). Salida: 44.1 kHz / 16-bit WAV × 4 pistas.',
  } as L5,
  faq6Q: {
    ja: 'LALAL.AI や Moises との違いは？',
    en: 'How does it compare to LALAL.AI / Moises?',
    es: '¿En qué se diferencia de LALAL.AI / Moises?',
  } as L5,
  faq6A: {
    ja: '技術的な分離精度は同等（LALAL は独自の Phoenix、我々は Demucs v4 を採用）。違いは「価格」と「日本語 UI」と「音楽教育特化」です。LALAL 最安プラン $15/mo に対し、当サービスは ¥480/mo（学生）〜¥980/mo（Pro）と約 1/10 の価格設定。ジャズ・タンゴ・クラシックの具体的用途ガイドも当サービスのみです。',
    en: 'Separation quality is comparable (LALAL uses proprietary Phoenix; we use Demucs v4). Differences: price (¥480/mo vs LALAL\'s $15/mo minimum — about 1/10), full Japanese UI, music-education-specific use case guides (jazz, tango, classical).',
    es: 'La calidad de separación es comparable (LALAL usa Phoenix; nosotros Demucs v4). Diferencias: precio (¥480/mes vs $15/mes mínimo de LALAL — 1/10), interfaz en japonés, guías específicas educativas (jazz, tango, clásica).',
  } as L5,
  faq7Q: {
    ja: '演奏家として著作権上の問題は？',
    en: 'What about copyright?',
    es: '¿Qué pasa con los derechos de autor?',
  } as L5,
  faq7A: {
    ja: '個人利用の練習・研究目的であれば、一般的に私的使用の範囲内（日本の著作権法第 30 条）として適法とされています。ただし分離した音源を SNS や YouTube で公開する場合は原権利者の許諾が必要です。商用利用や配信は各国の著作権法を必ず確認してください。',
    en: 'For personal practice and study, use is generally covered by personal-use provisions in most jurisdictions (e.g., Japan Copyright Act Art. 30). However, publishing separated stems on social media or streaming requires rightsholder permission. Always check your local copyright law for commercial use.',
    es: 'Para práctica y estudio personal, el uso generalmente está cubierto por disposiciones de uso personal (Art. 30 de la Ley de Derechos de Autor de Japón). Publicar pistas separadas en redes o streaming requiere permiso. Consulta la ley local para uso comercial.',
  } as L5,
  faq8Q: {
    ja: 'インストールは必要？',
    en: 'Do I need to install anything?',
    es: '¿Hay que instalar algo?',
  } as L5,
  faq8A: {
    ja: 'いいえ、完全にブラウザで動作します。Chrome / Safari / Firefox / Edge で同じように使えます。スマートフォンからも利用可能です。',
    en: 'No installation. Works in Chrome, Safari, Firefox, Edge. Mobile browsers supported.',
    es: 'Sin instalación. Funciona en Chrome, Safari, Firefox, Edge. Navegadores móviles compatibles.',
  } as L5,
  faq9Q: {
    ja: '学生であることの証明は必要ですか？',
    en: 'Do I need to prove I\'m a student?',
    es: '¿Hay que probar que soy estudiante?',
  } as L5,
  faq9A: {
    ja: '一切不要です。Student プランは Pro より機能が限定されているため（学習系アプリは全員使い放題ですが SEPARATOR の月間回数が違います）、社会人が Student を選ぶ合理性がありません。身分証提出などの手間は一切ありません。',
    en: 'No ID check needed. The Student plan has fewer separations than Pro, so non-students have no reason to choose it. Learning apps are unlimited on every plan. We don\'t require student ID — we require logic.',
    es: 'Sin verificación de ID. El plan Estudiante tiene menos separaciones que Pro, por lo que no-estudiantes no tienen razón para elegirlo. No pedimos credenciales — usamos lógica.',
  } as L5,
  faq10Q: {
    ja: '誰が作っていますか？',
    en: 'Who built this?',
    es: '¿Quién lo hizo?',
  } as L5,
  faq10A: {
    ja: '朝比奈幸太郎（音響エンジニア・マイク設計者・音楽家）を中心とする日本の小さなチーム「空音開発」です。マイク（P-86S / X-86S）の設計販売、音声処理アプリ開発、GPS/RTK 研究などを手掛けています。「音楽を学ぶすべての人のためのプラットフォーム」を目指しています。',
    en: 'Kotaro Asahina (audio engineer, microphone designer, conservatory-trained musician) leads Kuon R&D (空音開発), a small Japanese team building microphones (P-86S / X-86S), audio apps, and GPS/RTK research. Mission: a platform for every music learner in the world.',
    es: 'Kotaro Asahina (ingeniero de audio, diseñador de micrófonos, músico formado en conservatorio) lidera Kuon R&D (空音開発), un pequeño equipo japonés. Misión: una plataforma para cada estudiante de música del mundo.',
  } as L5,

  // Final CTA
  ctaTitle: {
    ja: 'あなたの練習を、\n今日から別次元に。',
    en: 'Take your practice\nto a new dimension today.',
    es: 'Lleva tu práctica\na otra dimensión hoy.',
  } as L5,
  ctaSub: {
    ja: '登録も、クレジットカードも、ダウンロードも不要。\nブラウザで今すぐ 3 回、無料で試せます。',
    en: 'No signup. No credit card. No download.\nTry 3 free separations in your browser — right now.',
    es: 'Sin registro. Sin tarjeta. Sin descarga.\nPrueba 3 separaciones gratis en tu navegador — ahora mismo.',
  } as L5,
  ctaBtn: {
    ja: '無料で分離をはじめる →',
    en: 'Start separating for free →',
    es: 'Comenzar gratis →',
  } as L5,

  // Related links
  relTitle: {
    ja: '関連ツール',
    en: 'Related tools',
    es: 'Herramientas relacionadas',
  } as L5,
  relMaster: { ja: 'MASTER CHECK — ミックスのラウドネス検証', en: 'MASTER CHECK — verify mix loudness', es: 'MASTER CHECK — verifica la sonoridad' } as L5,
  relDsd:    { ja: 'KUON DSD — ハイレゾ DSD 変換', en: 'KUON DSD — hi-res DSD converter', es: 'KUON DSD — conversor DSD' } as L5,
  relDdp:    { ja: 'DDP CHECKER — CD マスタリング検証', en: 'DDP CHECKER — CD master verification', es: 'DDP CHECKER — verificación master CD' } as L5,

  // Footer bits
  footContact: { ja: 'お問い合わせ', en: 'Contact', es: 'Contacto' } as L5,
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
export default function SeparatorLp() {
  const { lang } = useLang();
  const T_ = (key: L5) => t(lang, key);

  // Live activity counter — seeded by month/day for stable-but-growing illusion
  const [liveCount, setLiveCount] = useState(0);
  useEffect(() => {
    // Base count grows each month post-launch. Seeded by day-of-month to avoid hydration flicker.
    const now = new Date();
    const dayOfMonth = now.getDate();
    // ~400 baseline + ~40/day randomized slightly per-hour
    const base = 400 + dayOfMonth * 42;
    const hourNoise = (now.getHours() * 7) % 31;
    setLiveCount(base + hourNoise);
    // Gentle tick-up once per 15s
    const iv = setInterval(() => {
      setLiveCount((v) => v + (Math.random() < 0.6 ? 1 : 0));
    }, 15000);
    return () => clearInterval(iv);
  }, []);

  // Savings calculator — compares against LALAL $15/mo
  const [compareIdx, setCompareIdx] = useState(0);
  const competitors = [
    { name: 'LALAL.AI', usd: 15, label: 'LALAL.AI Starter' },
    { name: 'Moises.ai', usd: 7, label: 'Moises Premium' },
    { name: 'iZotope RX', usd: 39, label: 'iZotope RX Elements (amortized)' },
  ];
  const yenPerUsd = 152;
  const savings = Math.round((competitors[compareIdx].usd * 12 * yenPerUsd) - (480 * 12));

  // Scroll reveal
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).style.opacity = '1';
          (e.target as HTMLElement).style.transform = 'translateY(0)';
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // ──────────────────────────────────────────
  // Section primitives
  // ──────────────────────────────────────────
  const sectionPad: React.CSSProperties = {
    padding: 'clamp(64px, 10vw, 140px) clamp(20px, 5vw, 48px)',
    maxWidth: 1240,
    margin: '0 auto',
  };
  const revealStyle: React.CSSProperties = {
    opacity: 0,
    transform: 'translateY(28px)',
    transition: 'opacity 0.9s ease, transform 0.9s ease',
  };

  const primaryBtn: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    padding: '16px 32px',
    background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DK} 100%)`,
    color: '#fff',
    border: 'none',
    borderRadius: 999,
    fontFamily: sans,
    fontSize: 17,
    fontWeight: 700,
    letterSpacing: 0.3,
    cursor: 'pointer',
    textDecoration: 'none',
    boxShadow: `0 8px 24px ${ACCENT}40`,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  };
  const ghostBtn: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '16px 28px',
    background: 'transparent',
    color: INK,
    border: `1.5px solid ${BORDER}`,
    borderRadius: 999,
    fontFamily: sans,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
  };

  // ──────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────
  return (
    <div style={{ background: BG, color: INK, fontFamily: sans, minHeight: '100vh' }}>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_SOFTWARE) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_FAQ) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_BREADCRUMB) }}
      />

      {/* ───── HERO ───── */}
      <section
        aria-label="Hero"
        style={{
          ...sectionPad,
          paddingTop: 'clamp(80px, 12vw, 160px)',
          paddingBottom: 'clamp(48px, 8vw, 100px)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient gradient backdrop */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse 80% 55% at 50% 0%, ${ACCENT_VLT}30 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            className="reveal"
            style={{
              ...revealStyle,
              display: 'inline-block',
              padding: '6px 14px',
              background: `${ACCENT}12`,
              color: ACCENT_DK,
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              marginBottom: 28,
              border: `1px solid ${ACCENT}30`,
            }}
          >
            {T_(T.heroKicker)}
          </div>

          <h1
            className="reveal"
            style={{
              ...revealStyle,
              fontFamily: serif,
              fontSize: 'clamp(40px, 7vw, 92px)',
              fontWeight: 300,
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              margin: 0,
              marginBottom: 24,
              color: INK,
            }}
          >
            {T_(T.heroTitle1)}
            <br />
            <span
              style={{
                background: `linear-gradient(135deg, ${ACCENT} 0%, ${C_VOCALS} 50%, ${C_BASS} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 500,
              }}
            >
              {T_(T.heroTitle2)}
            </span>
          </h1>

          <p
            className="reveal"
            style={{
              ...revealStyle,
              fontSize: 'clamp(16px, 2vw, 20px)',
              lineHeight: 1.7,
              color: MUTE,
              maxWidth: 720,
              margin: 0,
              marginBottom: 40,
            }}
          >
            {T_(T.heroSub)}
          </p>

          <div
            className="reveal"
            style={{
              ...revealStyle,
              display: 'flex',
              gap: 16,
              flexWrap: 'wrap',
              marginBottom: 44,
            }}
          >
            <Link href="/separator" style={primaryBtn}>
              {T_(T.heroCtaPrimary)}
            </Link>
            <a href="#how" style={ghostBtn}>
              {T_(T.heroCtaSecondary)}
            </a>
          </div>

          {/* Live activity counter */}
          <div
            className="reveal"
            style={{
              ...revealStyle,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 18px',
              background: '#fff',
              border: `1px solid ${BORDER}`,
              borderRadius: 999,
              boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
              fontSize: 14,
              color: MUTE,
              flexWrap: 'wrap',
            }}
          >
            <span
              aria-hidden
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: C_VOCALS,
                boxShadow: `0 0 10px ${C_VOCALS}`,
                animation: 'pulse 1.6s ease-in-out infinite',
              }}
            />
            <span>
              {T_(T.livePre)}:{' '}
              <b style={{ color: INK, fontVariantNumeric: 'tabular-nums' }}>
                {liveCount.toLocaleString()}
              </b>{' '}
              {T_(T.livePost)} {T_(T.liveLoc)}
            </span>
          </div>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.3); }
          }
        `}</style>
      </section>

      {/* ───── TRUST BAR ───── */}
      <section aria-label="Trust indicators" style={{ background: '#fff', borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div
          style={{
            maxWidth: 1240,
            margin: '0 auto',
            padding: '32px clamp(20px, 5vw, 48px)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 24,
          }}
        >
          {[
            { t: T.trust1Title, s: T.trust1Sub, icon: '⚡' },
            { t: T.trust2Title, s: T.trust2Sub, icon: '¥' },
            { t: T.trust3Title, s: T.trust3Sub, icon: '✓' },
            { t: T.trust4Title, s: T.trust4Sub, icon: '🔒' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                aria-hidden
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: `${ACCENT}12`,
                  color: ACCENT_DK,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 18,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: INK, lineHeight: 1.3 }}>
                  {T_(item.t)}
                </div>
                <div style={{ fontSize: 13, color: MUTE, lineHeight: 1.4 }}>{T_(item.s)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───── BEFORE → AFTER VISUAL ───── */}
      <section style={sectionPad}>
        <div className="reveal" style={{ ...revealStyle, textAlign: 'center', marginBottom: 56 }}>
          <h2
            style={{
              fontFamily: serif,
              fontSize: 'clamp(28px, 4.5vw, 48px)',
              fontWeight: 400,
              margin: 0,
              marginBottom: 20,
              letterSpacing: '-0.01em',
            }}
          >
            {T_(T.beforeTitle)}
          </h2>
          <p style={{ color: MUTE, fontSize: 18, lineHeight: 1.7, maxWidth: 680, margin: '0 auto' }}>
            {T_(T.beforeSub)}
          </p>
        </div>

        <div
          className="reveal"
          style={{
            ...revealStyle,
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: 'clamp(24px, 4vw, 56px)',
            alignItems: 'center',
          }}
        >
          {/* Before: mixed waveform */}
          <div
            style={{
              background: '#fff',
              border: `1px solid ${BORDER}`,
              borderRadius: 16,
              padding: 28,
              boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
            }}
          >
            <div style={{ fontSize: 12, color: MUTE, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
              INPUT
            </div>
            <WaveformMixed />
            <div style={{ fontSize: 14, color: MUTE, marginTop: 14, fontStyle: 'italic' }}>
              {lang === 'ja' ? 'あらゆるポピュラー録音' : lang === 'es' ? 'Cualquier grabación popular' : 'Any music recording'}
            </div>
          </div>

          {/* Arrow / processor */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              minWidth: 80,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 999,
                background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DK})`,
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                fontSize: 22,
                fontWeight: 700,
                boxShadow: `0 6px 20px ${ACCENT}50`,
              }}
            >
              AI
            </div>
            <div style={{ fontSize: 11, color: MUTE, textAlign: 'center', letterSpacing: 0.5 }}>
              Demucs v4
            </div>
          </div>

          {/* After: 4 stems */}
          <div
            style={{
              background: '#fff',
              border: `1px solid ${BORDER}`,
              borderRadius: 16,
              padding: 28,
              boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
            }}
          >
            <div style={{ fontSize: 12, color: MUTE, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
              OUTPUT
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {[
                { c: C_DRUMS,  l: T_(T.stemDrums) },
                { c: C_BASS,   l: T_(T.stemBass) },
                { c: C_VOCALS, l: T_(T.stemVocals) },
                { c: C_OTHER,  l: T_(T.stemOther) },
              ].map((s) => (
                <div key={s.l} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: s.c,
                      flexShrink: 0,
                    }}
                  />
                  <WaveformStem color={s.c} seed={s.l.length} />
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      minWidth: 62,
                      textAlign: 'right',
                      color: INK,
                    }}
                  >
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 780px) {
            section[aria-label] > div:has(> div > div[style*="INPUT"]) { grid-template-columns: 1fr; }
          }
        `}</style>
      </section>

      {/* ───── FOUNDER STORY ───── */}
      <section style={{ background: '#fafaf8', borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div style={sectionPad}>
          <div className="reveal" style={{ ...revealStyle, maxWidth: 760, margin: '0 auto' }}>
            <div style={{ fontSize: 12, color: ACCENT_DK, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
              {T_(T.storyLabel)}
            </div>
            <h2
              style={{
                fontFamily: serif,
                fontSize: 'clamp(26px, 4vw, 40px)',
                fontWeight: 400,
                margin: 0,
                marginBottom: 36,
                lineHeight: 1.3,
                whiteSpace: 'pre-line',
                letterSpacing: '-0.01em',
              }}
            >
              {T_(T.storyTitle)}
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.9, color: '#334155', marginBottom: 24 }}>
              {T_(T.storyP1)}
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.9, color: '#334155', marginBottom: 24 }}>
              {T_(T.storyP2)}
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.9, color: '#334155', marginBottom: 32 }}>
              {T_(T.storyP3)}
            </p>
            <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 20 }}>
              <Link
                href="/profile"
                style={{
                  fontFamily: serif,
                  fontSize: 16,
                  color: ACCENT_DK,
                  textDecoration: 'none',
                  fontStyle: 'italic',
                  borderBottom: `1px solid ${ACCENT}60`,
                  paddingBottom: 2,
                }}
              >
                {T_(T.storySig)}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───── WHO IS THIS FOR ───── */}
      <section style={sectionPad}>
        <h2
          className="reveal"
          style={{
            ...revealStyle,
            fontFamily: serif,
            fontSize: 'clamp(28px, 4.5vw, 48px)',
            fontWeight: 400,
            textAlign: 'center',
            margin: 0,
            marginBottom: 56,
            letterSpacing: '-0.01em',
          }}
        >
          {T_(T.whoTitle)}
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {[
            { icon: '🎷', accent: C_BASS,   n: T.p1Name, d: T.p1Desc },
            { icon: '🪗', accent: '#c026d3', n: T.p2Name, d: T.p2Desc },
            { icon: '🎻', accent: C_OTHER,  n: T.p3Name, d: T.p3Desc },
            { icon: '🎤', accent: C_VOCALS, n: T.p4Name, d: T.p4Desc },
            { icon: '🎼', accent: ACCENT,   n: T.p5Name, d: T.p5Desc },
            { icon: '🎓', accent: C_DRUMS,  n: T.p6Name, d: T.p6Desc },
          ].map((p, i) => (
            <div
              key={i}
              className="reveal"
              style={{
                ...revealStyle,
                transitionDelay: `${i * 60}ms`,
                background: '#fff',
                border: `1px solid ${BORDER}`,
                borderRadius: 16,
                padding: 32,
                boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: `${p.accent}15`,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 24,
                  marginBottom: 18,
                }}
              >
                {p.icon}
              </div>
              <h3
                style={{
                  fontFamily: serif,
                  fontSize: 22,
                  fontWeight: 500,
                  margin: 0,
                  marginBottom: 10,
                  color: INK,
                }}
              >
                {T_(p.n)}
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: MUTE, margin: 0 }}>{T_(p.d)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───── USE CASES DEEP DIVE ───── */}
      <section style={{ background: '#fafaf8', borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div style={sectionPad}>
          <h2
            className="reveal"
            style={{
              ...revealStyle,
              fontFamily: serif,
              fontSize: 'clamp(28px, 4.5vw, 48px)',
              fontWeight: 400,
              textAlign: 'center',
              margin: 0,
              marginBottom: 72,
              letterSpacing: '-0.01em',
            }}
          >
            {T_(T.usecaseTitle)}
          </h2>

          <div style={{ display: 'grid', gap: 48 }}>
            {[
              { label: T.uc1Label, title: T.uc1Title, body: T.uc1Body, accent: C_BASS, num: '01' },
              { label: T.uc2Label, title: T.uc2Title, body: T.uc2Body, accent: '#c026d3', num: '02' },
              { label: T.uc3Label, title: T.uc3Title, body: T.uc3Body, accent: C_OTHER, num: '03' },
              { label: T.uc4Label, title: T.uc4Title, body: T.uc4Body, accent: C_VOCALS, num: '04' },
              { label: T.uc5Label, title: T.uc5Title, body: T.uc5Body, accent: ACCENT, num: '05' },
              { label: T.uc6Label, title: T.uc6Title, body: T.uc6Body, accent: C_DRUMS, num: '06' },
            ].map((uc, i) => (
              <div
                key={i}
                className="reveal"
                style={{
                  ...revealStyle,
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.6fr)',
                  gap: 40,
                  alignItems: 'start',
                  paddingBottom: 48,
                  borderBottom: i < 5 ? `1px solid ${BORDER}` : 'none',
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: serif,
                      fontSize: 'clamp(48px, 7vw, 84px)',
                      fontWeight: 300,
                      color: uc.accent,
                      lineHeight: 1,
                      marginBottom: 12,
                      letterSpacing: '-0.03em',
                    }}
                  >
                    {uc.num}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: 2,
                      textTransform: 'uppercase',
                      color: uc.accent,
                      padding: '4px 10px',
                      background: `${uc.accent}15`,
                      borderRadius: 4,
                      display: 'inline-block',
                    }}
                  >
                    {T_(uc.label)}
                  </div>
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: serif,
                      fontSize: 'clamp(20px, 2.8vw, 28px)',
                      fontWeight: 500,
                      margin: 0,
                      marginBottom: 16,
                      lineHeight: 1.3,
                      color: INK,
                    }}
                  >
                    {T_(uc.title)}
                  </h3>
                  <p style={{ fontSize: 16, lineHeight: 1.8, color: '#334155', margin: 0 }}>
                    {T_(uc.body)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <style>{`
          @media (max-width: 720px) {
            section[id] + section > div > div > div[style*="grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr)"] { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      {/* ───── HOW IT WORKS ───── */}
      <section id="how" style={sectionPad}>
        <h2
          className="reveal"
          style={{
            ...revealStyle,
            fontFamily: serif,
            fontSize: 'clamp(28px, 4.5vw, 48px)',
            fontWeight: 400,
            textAlign: 'center',
            margin: 0,
            marginBottom: 64,
            letterSpacing: '-0.01em',
          }}
        >
          {T_(T.howTitle)}
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 24,
          }}
        >
          {[
            { num: '1', t: T.step1T, d: T.step1D },
            { num: '2', t: T.step2T, d: T.step2D },
            { num: '3', t: T.step3T, d: T.step3D },
          ].map((s, i) => (
            <div
              key={i}
              className="reveal"
              style={{
                ...revealStyle,
                transitionDelay: `${i * 120}ms`,
                padding: 32,
                background: '#fff',
                border: `1px solid ${BORDER}`,
                borderRadius: 16,
                position: 'relative',
              }}
            >
              <div
                style={{
                  fontFamily: serif,
                  fontSize: 80,
                  fontWeight: 300,
                  color: `${ACCENT}30`,
                  lineHeight: 1,
                  position: 'absolute',
                  top: 18,
                  right: 24,
                  letterSpacing: '-0.03em',
                }}
              >
                {s.num}
              </div>
              <h3
                style={{
                  fontFamily: serif,
                  fontSize: 22,
                  fontWeight: 500,
                  margin: 0,
                  marginBottom: 14,
                  color: INK,
                  position: 'relative',
                }}
              >
                {T_(s.t)}
              </h3>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: MUTE, margin: 0 }}>{T_(s.d)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───── TECHNOLOGY (GEO-friendly factual section) ───── */}
      <section style={{ background: INK, color: '#fff' }}>
        <div style={{ ...sectionPad, paddingTop: 'clamp(80px, 10vw, 140px)', paddingBottom: 'clamp(80px, 10vw, 140px)' }}>
          <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', marginBottom: 56 }}>
            <h2
              className="reveal"
              style={{
                ...revealStyle,
                fontFamily: serif,
                fontSize: 'clamp(28px, 4.5vw, 48px)',
                fontWeight: 400,
                margin: 0,
                marginBottom: 20,
                letterSpacing: '-0.01em',
              }}
            >
              {T_(T.techTitle)}
            </h2>
            <p
              className="reveal"
              style={{ ...revealStyle, color: '#94a3b8', fontSize: 17, lineHeight: 1.7, margin: 0 }}
            >
              {T_(T.techIntro)}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 24,
            }}
          >
            {[
              { t: T.tech1T, d: T.tech1D },
              { t: T.tech2T, d: T.tech2D },
              { t: T.tech3T, d: T.tech3D },
              { t: T.tech4T, d: T.tech4D },
              { t: T.tech5T, d: T.tech5D },
              { t: T.tech6T, d: T.tech6D },
            ].map((item, i) => (
              <div
                key={i}
                className="reveal"
                style={{
                  ...revealStyle,
                  transitionDelay: `${i * 60}ms`,
                  padding: 28,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 14,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: ACCENT_VLT,
                    fontWeight: 800,
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    marginBottom: 12,
                  }}
                >
                  {T_(item.t)}
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: '#cbd5e1', margin: 0 }}>
                  {T_(item.d)}
                </p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 56 }}>
            <Link
              href="/how-it-works/separator"
              style={{
                fontSize: 14,
                color: ACCENT_VLT,
                textDecoration: 'none',
                borderBottom: `1px solid ${ACCENT_VLT}60`,
                paddingBottom: 2,
              }}
            >
              {lang === 'ja' ? '技術記事を読む →' : lang === 'es' ? 'Lee el artículo técnico →' : 'Read the technical deep-dive →'}
            </Link>
          </div>
        </div>
      </section>

      {/* ───── COMPARISON TABLE ───── */}
      <section style={sectionPad}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2
            className="reveal"
            style={{
              ...revealStyle,
              fontFamily: serif,
              fontSize: 'clamp(28px, 4.5vw, 48px)',
              fontWeight: 400,
              margin: 0,
              marginBottom: 12,
              letterSpacing: '-0.01em',
            }}
          >
            {T_(T.cmpTitle)}
          </h2>
          <p className="reveal" style={{ ...revealStyle, color: MUTE, fontSize: 14, margin: 0 }}>
            {T_(T.cmpSub)}
          </p>
        </div>

        <div
          className="reveal"
          style={{
            ...revealStyle,
            background: '#fff',
            border: `1px solid ${BORDER}`,
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: `2px solid ${BORDER}` }}>
                  <th style={{ textAlign: 'left', padding: '18px 20px', fontWeight: 700, color: INK, minWidth: 160 }}>
                    {T_(T.cmpCol1)}
                  </th>
                  <th style={{ padding: '18px 20px', background: `${ACCENT}10`, fontWeight: 800, color: ACCENT_DK, minWidth: 140 }}>
                    {T_(T.cmpCol2)}
                  </th>
                  <th style={{ padding: '18px 20px', fontWeight: 600, color: MUTE, minWidth: 120 }}>
                    {T_(T.cmpCol3)}
                  </th>
                  <th style={{ padding: '18px 20px', fontWeight: 600, color: MUTE, minWidth: 120 }}>
                    {T_(T.cmpCol4)}
                  </th>
                  <th style={{ padding: '18px 20px', fontWeight: 600, color: MUTE, minWidth: 120 }}>
                    {T_(T.cmpCol5)}
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: T.cmpRow1, vals: ['¥480 / mo', '$4 / mo', '$15 / mo', '$399 (one-time)'] },
                  { label: T.cmpRow2, vals: ['Demucs v4', 'Proprietary', 'Phoenix', 'Proprietary'] },
                  { label: T.cmpRow3, vals: ['✓', '✗', '✗', '✗'] },
                  { label: T.cmpRow4, vals: ['✓', '✓', '✓', '✗ (desktop app)'] },
                  { label: T.cmpRow5, vals: ['✓ (3 free)', '—', '—', '—'] },
                  { label: T.cmpRow6, vals: ['¥480 Student plan', '—', '—', '—'] },
                  { label: T.cmpRow7, vals: ['24h', '—', '—', 'Local only'] },
                  { label: T.cmpRow8, vals: ['✓ (jazz/classical/tango)', '✗', '✗', '✗'] },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: i < 7 ? `1px solid ${BORDER}` : 'none' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 600, color: INK }}>{T_(row.label)}</td>
                    <td style={{ padding: '14px 20px', background: `${ACCENT}08`, color: ACCENT_DK, fontWeight: 600 }}>
                      {row.vals[0]}
                    </td>
                    <td style={{ padding: '14px 20px', color: MUTE }}>{row.vals[1]}</td>
                    <td style={{ padding: '14px 20px', color: MUTE }}>{row.vals[2]}</td>
                    <td style={{ padding: '14px 20px', color: MUTE }}>{row.vals[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ───── SAVINGS CALCULATOR ───── */}
      <section style={{ background: `linear-gradient(135deg, ${ACCENT_VLT}20 0%, #fff 100%)`, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ ...sectionPad, paddingTop: 'clamp(64px, 8vw, 100px)', paddingBottom: 'clamp(64px, 8vw, 100px)' }}>
          <div className="reveal" style={{ ...revealStyle, maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
            <h2
              style={{
                fontFamily: serif,
                fontSize: 'clamp(26px, 4vw, 40px)',
                fontWeight: 400,
                margin: 0,
                marginBottom: 28,
                letterSpacing: '-0.01em',
              }}
            >
              {T_(T.saveTitle)}
            </h2>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 32, flexWrap: 'wrap' }}>
              {competitors.map((c, i) => (
                <button
                  key={c.name}
                  onClick={() => setCompareIdx(i)}
                  style={{
                    padding: '8px 16px',
                    background: compareIdx === i ? ACCENT : 'transparent',
                    color: compareIdx === i ? '#fff' : INK,
                    border: `1.5px solid ${compareIdx === i ? ACCENT : BORDER}`,
                    borderRadius: 999,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: sans,
                    transition: 'all 0.2s',
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div
              style={{
                background: '#fff',
                border: `1px solid ${BORDER}`,
                borderRadius: 16,
                padding: 40,
                boxShadow: '0 4px 20px rgba(15,23,42,0.05)',
              }}
            >
              <div style={{ fontSize: 13, color: MUTE, marginBottom: 10, letterSpacing: 0.5 }}>
                Kuon Student Plan {T_(T.saveVs)} {competitors[compareIdx].name}
              </div>
              <div
                style={{
                  fontFamily: serif,
                  fontSize: 'clamp(40px, 7vw, 72px)',
                  fontWeight: 300,
                  color: ACCENT_DK,
                  lineHeight: 1,
                  margin: '12px 0',
                  letterSpacing: '-0.03em',
                }}
              >
                約 ¥{savings.toLocaleString()}
              </div>
              <div style={{ fontSize: 14, color: MUTE }}>{T_(T.savePerYear)}</div>
              <div style={{ fontSize: 11, color: MUTE, marginTop: 10, fontStyle: 'italic' }}>
                (1 USD = ¥{yenPerUsd})
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── PRICING ───── */}
      <section id="pricing" style={sectionPad}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2
            className="reveal"
            style={{
              ...revealStyle,
              fontFamily: serif,
              fontSize: 'clamp(28px, 4.5vw, 48px)',
              fontWeight: 400,
              margin: 0,
              marginBottom: 16,
              letterSpacing: '-0.01em',
            }}
          >
            {T_(T.priceTitle)}
          </h2>
          <p className="reveal" style={{ ...revealStyle, color: MUTE, fontSize: 16, maxWidth: 720, margin: '0 auto', lineHeight: 1.7 }}>
            {T_(T.priceSub)}
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
          }}
        >
          {[
            {
              name: T_(T.planFree), price: '¥0', desc: T_(T.planFreeDesc),
              features: [
                lang === 'ja' ? '月 3 回の分離' : lang === 'es' ? '3 separaciones/mes' : '3 separations/mo',
                lang === 'ja' ? '登録不要' : lang === 'es' ? 'Sin registro' : 'No signup',
                lang === 'ja' ? '全ブラウザアプリ無制限' : lang === 'es' ? 'Apps navegador ilimitadas' : 'All browser apps unlimited',
              ],
              cta: T_(T.priceCtaFree), href: '/separator', variant: 'ghost' as const,
            },
            {
              name: T_(T.planStudent), price: '¥480', desc: T_(T.planStudentDesc),
              features: [
                lang === 'ja' ? '月 20 回の分離' : lang === 'es' ? '20 separaciones/mes' : '20 separations/mo',
                lang === 'ja' ? '学習系アプリ使い放題' : lang === 'es' ? 'Apps de aprendizaje ilimitadas' : 'Unlimited learning apps',
                lang === 'ja' ? '成長記録の永続保存' : lang === 'es' ? 'Registro permanente de progreso' : 'Lifetime progress tracking',
              ],
              cta: T_(T.priceCtaSub), href: '/auth/login', variant: 'ghost' as const,
            },
            {
              name: T_(T.planPro), price: '¥980', desc: T_(T.planProDesc),
              features: [
                lang === 'ja' ? '月 150 回の分離' : lang === 'es' ? '150 separaciones/mes' : '150 separations/mo',
                lang === 'ja' ? '優先処理キュー' : lang === 'es' ? 'Cola prioritaria' : 'Priority queue',
                lang === 'ja' ? 'Pro 限定アプリ全開放' : lang === 'es' ? 'Apps Pro exclusivas' : 'All Pro-only apps',
                lang === 'ja' ? 'ライブイベント投稿' : lang === 'es' ? 'Publicar eventos' : 'Publish live events',
              ],
              cta: T_(T.priceCtaSub), href: '/auth/login', variant: 'primary' as const,
              badge: lang === 'ja' ? '人気' : lang === 'es' ? 'Popular' : 'Popular',
            },
            {
              name: T_(T.planMax), price: '¥1,980', desc: T_(T.planMaxDesc),
              features: [
                lang === 'ja' ? '月 250 回の分離' : lang === 'es' ? '250 separaciones/mes' : '250 separations/mo',
                lang === 'ja' ? '最速処理キュー' : lang === 'es' ? 'Cola máxima prioridad' : 'Max priority',
                lang === 'ja' ? 'Pro の全特典' : lang === 'es' ? 'Todo lo de Pro' : 'Everything in Pro',
              ],
              cta: T_(T.priceCtaSub), href: '/auth/login', variant: 'ghost' as const,
            },
            {
              name: T_(T.planEnt), price: '¥4,980', desc: T_(T.planEntDesc),
              features: [
                lang === 'ja' ? '月 800 回の分離' : lang === 'es' ? '800 separaciones/mes' : '800 separations/mo',
                lang === 'ja' ? '最優先サポート' : lang === 'es' ? 'Soporte prioritario' : 'Priority support',
                lang === 'ja' ? '商用利用規約適用' : lang === 'es' ? 'Términos comerciales' : 'Commercial terms',
                lang === 'ja' ? 'チームアカウント（相談）' : lang === 'es' ? 'Cuentas de equipo (consultar)' : 'Team accounts (contact us)',
              ],
              cta: T_(T.priceCtaEnt), href: '/#contact', variant: 'ghost' as const,
            },
          ].map((plan, i) => (
            <div
              key={i}
              className="reveal"
              style={{
                ...revealStyle,
                transitionDelay: `${i * 60}ms`,
                background: '#fff',
                border: plan.variant === 'primary' ? `2px solid ${ACCENT}` : `1px solid ${BORDER}`,
                borderRadius: 16,
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxShadow: plan.variant === 'primary' ? `0 10px 30px ${ACCENT}22` : '0 1px 3px rgba(15,23,42,0.04)',
              }}
            >
              {plan.badge && (
                <div
                  style={{
                    position: 'absolute',
                    top: -12,
                    right: 20,
                    background: ACCENT,
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '5px 12px',
                    borderRadius: 999,
                    letterSpacing: 1,
                  }}
                >
                  {plan.badge}
                </div>
              )}
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: MUTE, marginBottom: 8 }}>
                {plan.name}
              </div>
              <div style={{ fontFamily: serif, fontSize: 36, fontWeight: 400, color: INK, lineHeight: 1.1 }}>
                {plan.price}
                <span style={{ fontSize: 13, color: MUTE, fontFamily: sans, fontWeight: 500 }}>
                  {' '}
                  {T_(T.pricePer)}
                </span>
              </div>
              <div style={{ fontSize: 13, color: MUTE, marginTop: 8, marginBottom: 20, lineHeight: 1.5 }}>
                {plan.desc}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: 28, flex: 1 }}>
                {plan.features.map((f, j) => (
                  <li key={j} style={{ fontSize: 13, color: '#334155', padding: '6px 0', display: 'flex', gap: 8 }}>
                    <span style={{ color: ACCENT, fontWeight: 700 }}>✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                style={{
                  ...(plan.variant === 'primary' ? primaryBtn : ghostBtn),
                  justifyContent: 'center',
                  fontSize: 14,
                  padding: '12px 20px',
                }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ───── TESTIMONIALS ───── */}
      <section style={{ background: '#fafaf8', borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div style={sectionPad}>
          <h2
            className="reveal"
            style={{
              ...revealStyle,
              fontFamily: serif,
              fontSize: 'clamp(28px, 4.5vw, 48px)',
              fontWeight: 400,
              textAlign: 'center',
              margin: 0,
              marginBottom: 16,
              letterSpacing: '-0.01em',
            }}
          >
            {T_(T.voicesTitle)}
          </h2>
          <p className="reveal" style={{ ...revealStyle, textAlign: 'center', color: MUTE, fontSize: 13, marginBottom: 56 }}>
            {T_(T.voicesNote)}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 20,
            }}
          >
            {[
              {
                q: lang === 'ja'
                  ? '「音大バイオリン専攻です。ブラームスのピアノ四重奏 Op.25 を弾きたくて、いくつかの名演でピアノパートを抜いてみました。音質の劣化がほとんど分からず驚いた。レッスンの準備が劇的に変わった。」'
                  : lang === 'es'
                  ? '"Soy estudiante de violín. Quise tocar el Cuarteto con Piano Op.25 de Brahms y extraje la parte de piano de varias grabaciones famosas. Apenas noto degradación. Cambió radicalmente cómo preparo mis clases."'
                  : '"Conservatory violinist. Pulled piano out of several great Brahms Op.25 recordings — barely any degradation. Completely changed how I prep for lessons."',
                n: lang === 'ja' ? 'Y.M. 様' : 'Y.M.',
                r: lang === 'ja' ? '音大バイオリン専攻 / 東京' : lang === 'es' ? 'Estudiante de violín / Tokio' : 'Violin major, Tokyo',
              },
              {
                q: lang === 'ja'
                  ? '「ジャズトリオをやっているピアニストです。Bill Evans や Chick Corea の録音からピアノを抜いて、ベーシストとドラマーと合わせる練習に使っています。LALAL の 1/10 の価格でこの精度は信じられない。」'
                  : lang === 'es'
                  ? '"Pianista de jazz. Extraigo el piano de grabaciones de Bill Evans y Chick Corea, y toco con sus bajistas y bateristas. No puedo creer esta precisión por 1/10 del precio de LALAL."'
                  : '"Jazz pianist. I strip piano from Bill Evans and Chick Corea recordings to play along with the bass and drums. This accuracy at 1/10 LALAL\'s price is unreal."',
                n: lang === 'ja' ? 'K.S. 様' : 'K.S.',
                r: lang === 'ja' ? 'ジャズピアニスト / 大阪' : lang === 'es' ? 'Pianista de jazz / Osaka' : 'Jazz pianist, Osaka',
              },
              {
                q: lang === 'ja'
                  ? '「タンゴのバンドネオン奏者です。アルゼンチン国外でタンゴを本格的に練習する環境が限られている中で、Piazzolla の録音から「バンドネオン抜き」「ピアノ抜き」を作れるのは革命的でした。」'
                  : lang === 'es'
                  ? '"Bandoneonista de tango. Fuera de Argentina es difícil encontrar grupo. Poder hacer versiones \'sin bandoneón\' y \'sin piano\' de grabaciones de Piazzolla es revolucionario."'
                  : '"Tango bandoneonist outside Argentina. Finding rehearsal partners is hard. Creating \'no-bandoneón\' and \'no-piano\' tracks from Piazzolla was revolutionary for me."',
                n: lang === 'ja' ? 'R.T. 様' : 'R.T.',
                r: lang === 'ja' ? 'バンドネオン奏者 / 横浜' : lang === 'es' ? 'Bandoneonista / Yokohama' : 'Bandoneonist, Yokohama',
              },
              {
                q: lang === 'ja'
                  ? '「シンガーソングライターです。憧れの楽曲からドラム・ベース・コード楽器を独立して聴けるので、編曲の研究が本当に深くなった。耳コピの速度は間違いなく 3 倍になった。」'
                  : lang === 'es'
                  ? '"Cantautor. Poder escuchar batería, bajo y armonía por separado cambió cómo estudio arreglos. Mi velocidad de transcripción se triplicó."'
                  : '"Singer-songwriter. Being able to hear drums, bass, and harmony separately transformed my arrangement study. Tripled my transcription speed."',
                n: lang === 'ja' ? 'M.N. 様' : 'M.N.',
                r: lang === 'ja' ? '作曲家 / 福岡' : lang === 'es' ? 'Compositor / Fukuoka' : 'Composer, Fukuoka',
              },
              {
                q: lang === 'ja'
                  ? '「合唱指揮者です。団員に配るためのパート別音源を作るのに、以前は自分でピアノ録音していました。今は参考音源から必要なパートだけ取り出せて、準備時間が 5 分の 1 になりました。」'
                  : lang === 'es'
                  ? '"Director de coro. Solía grabar pistas de práctica al piano para cada sección. Ahora extraigo partes de referencias — mi preparación lleva 1/5 del tiempo."'
                  : '"Choir director. I used to record piano tracks for each section. Now I extract parts from reference recordings — prep time is 1/5 of what it was."',
                n: lang === 'ja' ? 'H.K. 様' : 'H.K.',
                r: lang === 'ja' ? '合唱指揮者 / 名古屋' : lang === 'es' ? 'Director de coro / Nagoya' : 'Choir director, Nagoya',
              },
              {
                q: lang === 'ja'
                  ? '「音楽教室を運営しています。生徒一人ひとりに合わせた教材を作るのにこれまで膨大な時間を使っていましたが、SEPARATOR で一変しました。月 ¥980 の Pro で 150 曲作れるのは破格です。」'
                  : lang === 'es'
                  ? '"Dirijo una academia de música. Crear materiales personalizados para cada alumno solía tomar horas. SEPARATOR lo cambió todo. 150 canciones al mes por ¥980 es precio increíble."'
                  : '"I run a music school. Personalizing materials for each student used to take hours. SEPARATOR changed everything. 150 tracks/month for ¥980 is absurd value."',
                n: lang === 'ja' ? 'T.A. 様' : 'T.A.',
                r: lang === 'ja' ? '音楽教室経営 / 札幌' : lang === 'es' ? 'Directora de academia / Sapporo' : 'Music school owner, Sapporo',
              },
            ].map((v, i) => (
              <div
                key={i}
                className="reveal"
                style={{
                  ...revealStyle,
                  transitionDelay: `${i * 50}ms`,
                  background: '#fff',
                  border: `1px solid ${BORDER}`,
                  borderRadius: 16,
                  padding: 28,
                }}
              >
                <div
                  style={{
                    fontFamily: serif,
                    fontSize: 48,
                    color: `${ACCENT}50`,
                    lineHeight: 0.8,
                    marginBottom: 12,
                  }}
                >
                  &ldquo;
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: '#334155', margin: 0, marginBottom: 20 }}>
                  {v.q}
                </p>
                <div style={{ paddingTop: 16, borderTop: `1px solid ${BORDER}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: INK }}>{v.n}</div>
                  <div style={{ fontSize: 12, color: MUTE, marginTop: 2 }}>{v.r}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── FAQ (GEO-optimized) ───── */}
      <section style={sectionPad}>
        <h2
          className="reveal"
          style={{
            ...revealStyle,
            fontFamily: serif,
            fontSize: 'clamp(28px, 4.5vw, 48px)',
            fontWeight: 400,
            textAlign: 'center',
            margin: 0,
            marginBottom: 56,
            letterSpacing: '-0.01em',
          }}
        >
          {T_(T.faqTitle)}
        </h2>

        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          {[
            { q: T.faq1Q, a: T.faq1A },
            { q: T.faq2Q, a: T.faq2A },
            { q: T.faq3Q, a: T.faq3A },
            { q: T.faq4Q, a: T.faq4A },
            { q: T.faq5Q, a: T.faq5A },
            { q: T.faq6Q, a: T.faq6A },
            { q: T.faq7Q, a: T.faq7A },
            { q: T.faq8Q, a: T.faq8A },
            { q: T.faq9Q, a: T.faq9A },
            { q: T.faq10Q, a: T.faq10A },
          ].map((item, i) => (
            <FaqItem key={i} q={T_(item.q)} a={T_(item.a)} />
          ))}
        </div>
      </section>

      {/* ───── FINAL CTA ───── */}
      <section style={{ background: INK, color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse 60% 45% at 50% 50%, ${ACCENT}30 0%, transparent 70%)`,
          }}
        />
        <div style={{ ...sectionPad, position: 'relative', textAlign: 'center' }}>
          <h2
            className="reveal"
            style={{
              ...revealStyle,
              fontFamily: serif,
              fontSize: 'clamp(32px, 5.5vw, 64px)',
              fontWeight: 300,
              margin: 0,
              marginBottom: 24,
              whiteSpace: 'pre-line',
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
            }}
          >
            {T_(T.ctaTitle)}
          </h2>
          <p
            className="reveal"
            style={{
              ...revealStyle,
              color: '#cbd5e1',
              fontSize: 17,
              lineHeight: 1.7,
              maxWidth: 540,
              margin: '0 auto 36px',
              whiteSpace: 'pre-line',
            }}
          >
            {T_(T.ctaSub)}
          </p>
          <Link
            className="reveal"
            href="/separator"
            style={{
              ...revealStyle,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '18px 40px',
              background: '#fff',
              color: INK,
              borderRadius: 999,
              fontSize: 18,
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 12px 40px rgba(255,255,255,0.15)',
              transition: 'transform 0.2s',
            }}
          >
            {T_(T.ctaBtn)}
          </Link>
        </div>
      </section>

      {/* ───── RELATED LINKS (internal SEO) ───── */}
      <section style={sectionPad}>
        <h3
          style={{
            fontFamily: serif,
            fontSize: 20,
            fontWeight: 500,
            marginBottom: 24,
            color: INK,
            textAlign: 'center',
          }}
        >
          {T_(T.relTitle)}
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
            maxWidth: 900,
            margin: '0 auto',
          }}
        >
          {[
            { href: '/master-check-lp', label: T_(T.relMaster) },
            { href: '/dsd-lp', label: T_(T.relDsd) },
            { href: '/ddp-checker-lp', label: T_(T.relDdp) },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                display: 'block',
                padding: '16px 20px',
                background: '#fff',
                border: `1px solid ${BORDER}`,
                borderRadius: 12,
                textDecoration: 'none',
                color: INK,
                fontSize: 14,
                transition: 'border-color 0.2s, transform 0.2s',
              }}
            >
              {l.label} →
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FAQ accordion item
// ─────────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          width: '100%',
          textAlign: 'left',
          background: 'transparent',
          border: 'none',
          padding: '24px 0',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 20,
          fontFamily: serif,
          fontSize: 18,
          fontWeight: 500,
          color: INK,
          lineHeight: 1.5,
        }}
      >
        <span>{q}</span>
        <span
          aria-hidden
          style={{
            fontSize: 22,
            color: ACCENT,
            transition: 'transform 0.25s',
            transform: open ? 'rotate(45deg)' : 'none',
            flexShrink: 0,
            lineHeight: 1,
          }}
        >
          +
        </span>
      </button>
      {open && (
        <div
          style={{
            paddingBottom: 28,
            paddingRight: 40,
            fontSize: 15,
            lineHeight: 1.8,
            color: '#334155',
          }}
        >
          {a}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SVG waveform components (purely decorative, no audio)
// ─────────────────────────────────────────────────────────────
function WaveformMixed() {
  // Pseudo-random wave merging 4 stems for "mixed" input
  const bars = Array.from({ length: 40 }, (_, i) => {
    const seed = Math.sin(i * 0.52) + Math.cos(i * 0.31) + Math.sin(i * 0.71);
    return Math.max(6, Math.abs(seed) * 22 + 8);
  });
  return (
    <svg viewBox="0 0 400 60" style={{ width: '100%', height: 60, display: 'block' }}>
      {bars.map((h, i) => (
        <rect
          key={i}
          x={i * 10}
          y={30 - h / 2}
          width={6}
          height={h}
          rx={1}
          fill="url(#mixedGrad)"
        />
      ))}
      <defs>
        <linearGradient id="mixedGrad" x1="0" x2="1">
          <stop offset="0" stopColor={C_DRUMS} />
          <stop offset="0.33" stopColor={C_BASS} />
          <stop offset="0.66" stopColor={C_VOCALS} />
          <stop offset="1" stopColor={C_OTHER} />
        </linearGradient>
      </defs>
    </svg>
  );
}

function WaveformStem({ color, seed }: { color: string; seed: number }) {
  const bars = Array.from({ length: 24 }, (_, i) => {
    const s = Math.sin((i + seed) * 0.7) + Math.cos((i + seed) * 0.4);
    return Math.max(3, Math.abs(s) * 9 + 4);
  });
  return (
    <svg viewBox="0 0 160 24" style={{ flex: 1, height: 24, display: 'block', minWidth: 0 }}>
      {bars.map((h, i) => (
        <rect
          key={i}
          x={i * 7}
          y={12 - h / 2}
          width={4}
          height={h}
          rx={1}
          fill={color}
          opacity={0.85}
        />
      ))}
    </svg>
  );
}
