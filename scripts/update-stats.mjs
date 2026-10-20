// Fetches Instagram stats and writes stats.json.
// The access token comes ONLY from the IG_ACCESS_TOKEN environment variable
// (a GitHub Actions secret). It is never written to any file.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const TOKEN = process.env.IG_ACCESS_TOKEN;
if (!TOKEN) {
  console.error('Missing IG_ACCESS_TOKEN secret.');
  process.exit(1);
}

const API = 'https://graph.instagram.com/v21.0';
const DAYS = 30;
const OUT = 'stats.json';

async function get(path, params = {}) {
  const url = new URL(`${API}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  url.searchParams.set('access_token', TOKEN);
  const res = await fetch(url);
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.error) {
    // Only the message is logged, never the URL (it contains the token).
    throw new Error(`${path}: ${body.error?.message || res.status}`);
  }
  return body;
}

// Keep the last good numbers so one failed metric never blanks the page.
const previous = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {};

const until = Math.floor(Date.now() / 1000);
const since = until - DAYS * 86400 + 60; // API limit is 30 days max

async function total(metric) {
  try {
    const d = await get('me/insights', {
      metric,
      period: 'day',
      metric_type: 'total_value',
      since,
      until,
    });
    return d.data?.[0]?.total_value?.value ?? null;
  } catch (e) {
    console.warn(`Could not fetch ${metric}: ${e.message}`);
    return null;
  }
}

let followers = null;
try {
  followers = (await get('me', { fields: 'followers_count' })).followers_count ?? null;
} catch (e) {
  console.error(`Could not fetch followers: ${e.message}`);
}

const reach = await total('reach');
const views = await total('views');
const interactions = await total('total_interactions');

// Engagement rate = interactions / reach. Instagram's own dashboard may use a
// slightly different formula, so tweak here if the number differs from yours.
let engagement = null;
if (interactions != null && reach) {
  engagement = Math.round((interactions / reach) * 1000) / 10;
}

if (followers == null && reach == null && views == null) {
  console.error('No data fetched. Keeping the previous stats.json.');
  process.exit(1);
}

const stats = {
  followers: followers ?? previous.followers ?? null,
  reach: reach ?? previous.reach ?? null,
  views: views ?? previous.views ?? null,
  engagement: engagement ?? previous.engagement ?? null,
  period_days: DAYS,
  updated: new Date().toISOString(),
};

writeFileSync(OUT, JSON.stringify(stats, null, 2) + '\n');
console.log('stats.json updated:', stats);

// Best-effort: extend the token's life (long-lived tokens last 60 days).
try {
  const r = new URL('https://graph.instagram.com/refresh_access_token');
  r.searchParams.set('grant_type', 'ig_refresh_token');
  r.searchParams.set('access_token', TOKEN);
  const res = await fetch(r);
  console.log(res.ok ? 'Token refreshed.' : 'Token refresh skipped.');
} catch {
  console.log('Token refresh skipped.');
}
