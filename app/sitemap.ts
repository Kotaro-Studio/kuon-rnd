import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://kuon-rnd.com';
  const now = new Date().toISOString();

  // ── High-priority: landing pages & main apps ──
  const highPriority: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/audio-apps`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    // 2026-04-26 削除: /microphone (国際公平性のため・JP 国内限定販売・Kotaro Studio 外部リンクのみで流入)
    { url: `${base}/profile`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/gallery`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    // /certification 削除 (2026-04-25: 認定制度を採用しない決定 / CLAUDE.md §37.5)
    // 2026-04-29 削除: /for-schools — 機能していないため廃止 (リダイレクト)
  ];

  // ── Apps (tool pages) — high SEO value ──
  const apps = [
    'transposer', 'harmony', 'counterpoint', 'master-check', 'analyzer',
    'normalize', 'resampler', 'converter', 'dsd', 'ddp-checker',
    'noise-reduction', 'dual-mono', 'tuner', 'ear-training', 'chord-quiz',
    'interval-speed', 'metronome', 'sight-reading', 'slowdown',
    // 🧘 メンタル・本番準備 (2026-04-26 追加)
    'breath', 'checklist', 'frequency',
    // 🎚 制作・スタジオ (2026-04-26 追加)
    'comping', 'daw',
    // 🎼 作曲・分析 (2026-04-28 追加)
    'classical', // KUON CLASSICAL ANALYSIS - Roman numeral analysis with built-in library
    'classical/lab', // KUON CLASSICAL LAB - Pyodide + music21 in browser (world's first)
    // 🤖 AI 処理系 (2026-04-30 追加) — Workers AI 完結アプリ群
    'lesson-recorder', // KUON LESSON RECORDER - Whisper + Llama 3.3 + M2M100 で完結
    'theory-tutor',    // KUON THEORY TUTOR - RAG (OMT v2 + Theory Suite) + Llama 3.3 70B
    'sheet',           // KUON SHEET - リードシートエディタ + 画像スキャン (エディタ Free / スキャン Concerto+)
    // 2026-04-30 開発保留: 'libretto' (URL は残存・サイトマップには非掲載・価値検証中)
    // 🎓 Music Theory Suite (2026-04-29 ハブ + MVP レッスン公開)
    'theory', // KUON Music Theory Suite ハブ (Norton Critical Edition 型目次・16 モジュール)
    'theory/m0/l01', // M0-01 五線と音名 (Kuon オリジナル M0・OMT v2 範囲外)
    'theory/m1/l01', // M1-01 西洋音楽記譜法の導入 (OMT v2 Part I 第 1 章)
    'theory/m1/l02', // M1-02 音符の記譜と五線 (OMT v2 Part I 第 2 章前半)
    'theory/m1/l40', // M1-40 三和音の基本形と転回形 (OMT v2 Part I 第 17+19 章)
    'theory/m4/l01', // M4-01 カデンツの種類 (OMT v2 Part IV 第 1 章・機能和声導入)
    // 2026-04-26 開発保留: 'drum' (専門家監修パターン再構築待ち・URL は残存)
  ];

  const appPages: MetadataRoute.Sitemap = apps.map(slug => ({
    url: `${base}/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // ── LP pages — SEO landing pages ──
  const lps = [
    'transposer-lp', 'harmony-lp', 'counterpoint-lp', 'master-check-lp',
    'analyzer-lp', 'normalize-lp', 'resampler-lp', 'dsd-lp', 'ddp-checker-lp',
    'tuner-lp', 'ear-training-lp', 'chord-quiz-lp', 'interval-speed-lp',
    'metronome-lp', 'sight-reading-lp', 'player-lp', 'events-lp', 'soundmap-lp',
    'itadaki-lp', 'slowdown-lp',
    // 🧘 メンタル・本番準備 (2026-04-26 追加)
    'breath-lp', 'checklist-lp', 'frequency-lp',
    // 🎚 制作・スタジオ (2026-04-26 追加)
    'comping-lp', 'daw-lp',
    // 🎼 作曲・分析 (2026-04-28 追加)
    'classical-lp', // KUON CLASSICAL ANALYSIS Landing Page
    'classical/lab-lp', // KUON CLASSICAL LAB Landing Page (Pyodide world's first)
    // 🎓 Music Theory Suite (2026-04-29 LP 先行公開・MVP 開発中)
    'theory-lp', // KUON Music Theory Suite Landing Page (16 modules · 553 lessons · OMT v2 base)
    // 🎙 AI 処理系 (2026-04-30 公開) — Workers AI 完結
    'lesson-recorder-lp', // KUON LESSON RECORDER Landing Page
    'theory-tutor-lp',    // KUON THEORY TUTOR Landing Page
    'sheet-lp',           // KUON SHEET Landing Page (リードシートエディタ・フリーミアム)
    // 2026-04-30 開発保留: 'libretto-lp' (URL は残存・サイトマップには非掲載・価値検証中)
    // 2026-04-26 開発保留: 'drum-lp' (URL は残存・サイトマップには非掲載)
    // 2026-04-27 公開停止: 'separator-lp' (Cloud Run 単体運用が安定しないため
    //   将来 Replicate API 等への乗せ替えと共に再公開予定。アプリ本体コードは温存)
  ];

  const lpPages: MetadataRoute.Sitemap = lps.map(slug => ({
    url: `${base}/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // ── Community & connect pages ──
  const communityPages: MetadataRoute.Sitemap = [
    { url: `${base}/events`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${base}/soundmap`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/player-lp`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/player/upload`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  // ── GPS pages ──
  const gpsPages: MetadataRoute.Sitemap = [
    'gps', 'gps-elevation', 'gps-heatmap', 'gps-plot', 'geocode-viewer',
    'radar', 'rtk-base',
  ].map(slug => ({
    url: `${base}/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  // ── Analog tools (hub + 5 calculators) ──
  const analogToolsPages: MetadataRoute.Sitemap = [
    { url: `${base}/analog-tools`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/analog-tools/tape-remaining`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/analog-tools/tape-time`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/analog-tools/speed-cal`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/analog-tools/jazz-time`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/analog-tools/dbu-volt`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  ];

  // ── Legal & manuals ──
  const legalPages: MetadataRoute.Sitemap = [
    { url: `${base}/legal/tokushoho`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/legal/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/legal/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/manual/p-86s`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${base}/manual/x-86s`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
  ];

  return [
    ...highPriority,
    ...appPages,
    ...lpPages,
    ...communityPages,
    ...gpsPages,
    ...analogToolsPages,
    ...legalPages,
  ];
}
