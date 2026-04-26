import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://kuon-rnd.com';
  const now = new Date().toISOString();

  // ── High-priority: landing pages & main apps ──
  const highPriority: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/audio-apps`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/microphone`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/profile`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/gallery`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    // /certification 削除 (2026-04-25: 認定制度を採用しない決定 / CLAUDE.md §37.5)
    { url: `${base}/for-schools`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
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
    'itadaki-lp', 'slowdown-lp', 'separator-lp',
    // 🧘 メンタル・本番準備 (2026-04-26 追加)
    'breath-lp', 'checklist-lp', 'frequency-lp',
    // 🎚 制作・スタジオ (2026-04-26 追加)
    'comping-lp', 'daw-lp',
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
