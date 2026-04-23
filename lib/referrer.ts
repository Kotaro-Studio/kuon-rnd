/**
 * Referrer host canonicalization.
 *
 * SNS / messaging platforms often rewrite outbound links through redirect hosts
 * (l.instagram.com, lm.facebook.com, t.co, out.reddit.com ...). Without
 * normalization, the same source appears as many different hostnames in
 * analytics. This module collapses those variants to a single canonical key.
 *
 * Non-destructive read-time normalization: the raw host is preserved in KV,
 * only the display layer applies canonical grouping.
 */

/** Map a hostname (or full URL / "unknown" / "") to a canonical label. */
export function normalizeReferrerHost(input: string | null | undefined): string {
  if (!input) return 'direct';
  const raw = String(input).trim().toLowerCase();
  if (!raw || raw === 'unknown') return 'direct';

  // Extract hostname if a full URL was passed in
  let host = raw;
  try {
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      host = new URL(raw).hostname;
    }
  } catch {
    // fall through with raw
  }

  // Strip leading "www."
  host = host.replace(/^www\./, '');

  // Instagram (l.instagram.com, lm.instagram.com, help.instagram.com ...)
  if (/(^|\.)instagram\.com$/.test(host) || /(^|\.)instagr\.am$/.test(host)) {
    return 'instagram';
  }
  // Facebook / Meta redirects
  if (/(^|\.)facebook\.com$/.test(host) || /(^|\.)fb\.com$/.test(host) || /(^|\.)fb\.me$/.test(host)) {
    return 'facebook';
  }
  // X / Twitter
  if (/(^|\.)twitter\.com$/.test(host) || /(^|\.)x\.com$/.test(host) || host === 't.co') {
    return 'twitter';
  }
  // TikTok
  if (/(^|\.)tiktok\.com$/.test(host) || /(^|\.)vm\.tiktok\.com$/.test(host)) {
    return 'tiktok';
  }
  // YouTube
  if (/(^|\.)youtube\.com$/.test(host) || host === 'youtu.be') {
    return 'youtube';
  }
  // LinkedIn
  if (/(^|\.)linkedin\.com$/.test(host) || host === 'lnkd.in') {
    return 'linkedin';
  }
  // Reddit
  if (/(^|\.)reddit\.com$/.test(host) || host === 'redd.it') {
    return 'reddit';
  }
  // Discord
  if (/(^|\.)discord\.com$/.test(host) || /(^|\.)discordapp\.com$/.test(host)) {
    return 'discord';
  }
  // LINE
  if (/(^|\.)line\.me$/.test(host) || /(^|\.)line-scdn\.net$/.test(host)) {
    return 'line';
  }
  // Threads
  if (/(^|\.)threads\.net$/.test(host)) {
    return 'threads';
  }
  // Google (search / redirects)
  if (/(^|\.)google\./.test(host)) {
    return 'google';
  }
  // Bing / Yahoo / DuckDuckGo / Baidu / Naver / Daum
  if (/(^|\.)bing\.com$/.test(host)) return 'bing';
  if (/(^|\.)yahoo\.(com|co\.jp|co\.uk)$/.test(host)) return 'yahoo';
  if (/(^|\.)duckduckgo\.com$/.test(host)) return 'duckduckgo';
  if (/(^|\.)baidu\.com$/.test(host)) return 'baidu';
  if (/(^|\.)naver\.com$/.test(host)) return 'naver';
  if (/(^|\.)daum\.net$/.test(host)) return 'daum';
  // Self
  if (/(^|\.)kuon-rnd\.com$/.test(host)) return 'kuon-rnd.com';

  return host;
}

/**
 * Aggregate a raw { host: count } map into a { canonical: count } map.
 * Entries with empty / "direct" keys roll up under "direct".
 */
export function aggregateByCanonical(
  raw: Record<string, number> | null | undefined
): Record<string, number> {
  const out: Record<string, number> = {};
  if (!raw) return out;
  for (const [host, count] of Object.entries(raw)) {
    const key = normalizeReferrerHost(host);
    out[key] = (out[key] || 0) + count;
  }
  return out;
}

/** Sort aggregated referrers by count desc and return as ranking array. */
export function rankReferrers(
  agg: Record<string, number>
): Array<{ source: string; count: number }> {
  return Object.entries(agg)
    .sort((a, b) => b[1] - a[1])
    .map(([source, count]) => ({ source, count }));
}
