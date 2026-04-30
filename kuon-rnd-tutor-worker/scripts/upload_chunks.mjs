#!/usr/bin/env node
/**
 * Upload Chunks to Tutor Worker (which embeds + upserts to Vectorize)
 * ====================================================================
 *
 * scripts/data/omt_chunks.jsonl + scripts/data/kuon_lessons_chunks.jsonl
 * を読み込み、デプロイ済みの kuon-rnd-tutor-worker の /api/tutor/upsert に POST。
 *
 * 使い方 (Mac):
 *   cd ~/kuon-rnd/kuon-rnd-tutor-worker
 *   TUTOR_SECRET=<secret> node scripts/upload_chunks.mjs
 *
 * オプション:
 *   --omt-only        OMT v2 のみアップロード
 *   --kuon-only       Kuon Theory レッスンのみアップロード
 *   --dry-run         アップロードせず件数だけ表示
 *   --batch-size=N    1 リクエストあたりの件数 (default 50)
 */

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');

const TUTOR_URL = process.env.TUTOR_URL || 'https://kuon-rnd-tutor-worker.369-1d5.workers.dev';
const TUTOR_SECRET = process.env.TUTOR_SECRET;

if (!TUTOR_SECRET) {
  console.error('ERROR: TUTOR_SECRET env var not set.');
  console.error('Run: TUTOR_SECRET=<secret> node scripts/upload_chunks.mjs');
  process.exit(1);
}

// CLI args
const args = process.argv.slice(2);
const OMT_ONLY = args.includes('--omt-only');
const KUON_ONLY = args.includes('--kuon-only');
const DRY_RUN = args.includes('--dry-run');
const BATCH_SIZE = parseInt(
  (args.find((a) => a.startsWith('--batch-size=')) || '--batch-size=50').split('=')[1],
  10,
);

async function readJsonl(filepath) {
  if (!fs.existsSync(filepath)) {
    console.warn(`  ⚠️  Not found: ${filepath}`);
    return [];
  }
  const items = [];
  const rl = readline.createInterface({
    input: fs.createReadStream(filepath, 'utf-8'),
    crlfDelay: Infinity,
  });
  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      items.push(JSON.parse(line));
    } catch (e) {
      console.error(`  ⚠️  Invalid JSON line: ${line.slice(0, 80)}`);
    }
  }
  return items;
}

function toUpsertPayload(chunk) {
  return {
    id: chunk.id,
    meta: {
      source: chunk.source,
      title: chunk.title,
      chapter: chunk.chapter || '',
      section: '',
      page: chunk.page || 0,
      lessonId: chunk.lessonId || '',
      url: chunk.url || '',
      text: chunk.text,
      language: chunk.language || 'en',
    },
  };
}

async function uploadBatch(batch, batchIndex, totalBatches) {
  const res = await fetch(`${TUTOR_URL}/api/tutor/upsert`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TUTOR_SECRET}`,
    },
    body: JSON.stringify({ chunks: batch }),
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error(`  ❌ Batch ${batchIndex + 1}/${totalBatches} failed:`, res.status, errText.slice(0, 200));
    return false;
  }
  const data = await res.json();
  console.log(`  ✅ Batch ${batchIndex + 1}/${totalBatches}: upserted ${data.upserted}`);
  return true;
}

async function main() {
  console.log(`Tutor Worker URL: ${TUTOR_URL}`);
  console.log(`Batch size: ${BATCH_SIZE}`);

  let allChunks = [];

  if (!KUON_ONLY) {
    console.log('\n📖 Loading OMT v2 chunks...');
    const omt = await readJsonl(path.join(DATA_DIR, 'omt_chunks.jsonl'));
    console.log(`  Loaded ${omt.length} OMT chunks`);
    allChunks = allChunks.concat(omt);
  }

  if (!OMT_ONLY) {
    console.log('\n🎓 Loading Kuon Theory lessons chunks...');
    const kuon = await readJsonl(path.join(DATA_DIR, 'kuon_lessons_chunks.jsonl'));
    console.log(`  Loaded ${kuon.length} Kuon chunks`);
    allChunks = allChunks.concat(kuon);
  }

  console.log(`\n📊 Total chunks to upload: ${allChunks.length}`);

  if (DRY_RUN) {
    console.log('--dry-run mode: not uploading.');
    return;
  }

  if (allChunks.length === 0) {
    console.log('No chunks to upload.');
    return;
  }

  const payloads = allChunks.map(toUpsertPayload);
  const totalBatches = Math.ceil(payloads.length / BATCH_SIZE);
  let success = 0;
  let failed = 0;

  for (let i = 0; i < payloads.length; i += BATCH_SIZE) {
    const batchIndex = Math.floor(i / BATCH_SIZE);
    const batch = payloads.slice(i, i + BATCH_SIZE);
    const ok = await uploadBatch(batch, batchIndex, totalBatches);
    if (ok) success += batch.length;
    else failed += batch.length;
    // throttling: 200ms 間隔で連続呼び出し
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`\n✅ Upload finished!`);
  console.log(`   Success: ${success}`);
  console.log(`   Failed:  ${failed}`);
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
