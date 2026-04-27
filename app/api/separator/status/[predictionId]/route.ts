export const runtime = 'edge';

/**
 * KUON SEPARATOR — ステータス取得 (Replicate prediction polling)
 *
 * フロー:
 *   1. Cookie から JWT を取り出す（クォータ消費は run 時点で完了済みのため、
 *      ここでは認証だけ確認してクォータには触れない）
 *   2. Replicate API で prediction の現在状態を取得
 *   3. クライアントに { status, output, error } を返す
 *      - status: starting / processing / succeeded / failed / canceled
 *      - output: succeeded 時のみ { vocals, drums, bass, other } の URL
 *
 * クライアントはこのエンドポイントを 3 秒間隔でポーリングし、
 * status が succeeded / failed / canceled になったら停止する。
 */

const REPLICATE_API_BASE = 'https://api.replicate.com/v1';

function getCookie(request: Request, name: string): string | null {
  const cookies = request.headers.get('Cookie') || '';
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? match[1] : null;
}

/**
 * Replicate Demucs の出力を { drums, bass, vocals, other } 形式に正規化する。
 *
 * Replicate のモデルバージョンによって出力形式が:
 *   - object 形式: { vocals: url, drums: url, bass: url, other: url }
 *   - array 形式:  [drums_url, bass_url, vocals_url, other_url]
 *   - object 形式 (代替): { vocal: url, drum: url, ... } など揺れあり
 * となるケースがあるため、両対応する。
 */
function normalizeStemUrls(output: unknown): Record<string, string> | null {
  if (!output) return null;

  // Object 形式
  if (typeof output === 'object' && !Array.isArray(output)) {
    const obj = output as Record<string, unknown>;
    const result: Record<string, string> = {};

    // 期待するキー名のマッピング (各バリエーションに対応)
    const stemKeys: Array<{ canonical: string; aliases: string[] }> = [
      { canonical: 'drums',  aliases: ['drums', 'drum'] },
      { canonical: 'bass',   aliases: ['bass'] },
      { canonical: 'vocals', aliases: ['vocals', 'vocal'] },
      { canonical: 'other',  aliases: ['other', 'others'] },
    ];

    for (const { canonical, aliases } of stemKeys) {
      for (const alias of aliases) {
        const v = obj[alias];
        if (typeof v === 'string' && v.startsWith('http')) {
          result[canonical] = v;
          break;
        }
      }
    }

    return Object.keys(result).length === 4 ? result : null;
  }

  // Array 形式 (cjwbw/demucs の古いバージョンで観測される)
  if (Array.isArray(output) && output.length === 4 && output.every(v => typeof v === 'string')) {
    // Demucs CLI のデフォルト順は drums, bass, other, vocals
    return {
      drums:  output[0] as string,
      bass:   output[1] as string,
      other:  output[2] as string,
      vocals: output[3] as string,
    };
  }

  return null;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ predictionId: string }> } | { params: { predictionId: string } }
) {
  const token = getCookie(request, 'kuon_token');
  if (!token) {
    return Response.json({ error: 'auth_required' }, { status: 401 });
  }

  // Next.js 15 / 14 両対応: params が Promise の場合と object の場合を吸収
  const rawParams = (context as { params: unknown }).params;
  const params = (rawParams && typeof (rawParams as { then?: unknown }).then === 'function'
    ? await (rawParams as Promise<{ predictionId: string }>)
    : (rawParams as { predictionId: string }));
  const predictionId = params.predictionId;

  if (!predictionId) {
    return Response.json({ error: 'missing_prediction_id' }, { status: 400 });
  }

  const env = (request as unknown as { env?: Record<string, string> }).env
    || (globalThis as unknown as { process?: { env: Record<string, string> } }).process?.env
    || {};
  const replicateToken = env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_TOKEN;

  if (!replicateToken) {
    return Response.json({ error: 'service_unavailable' }, { status: 503 });
  }

  let res: Response;
  try {
    res = await fetch(`${REPLICATE_API_BASE}/predictions/${predictionId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${replicateToken}` },
    });
  } catch (e) {
    return Response.json(
      { error: 'service_unreachable', detail: String(e) },
      { status: 502 }
    );
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    return Response.json(
      { error: 'status_fetch_failed', detail: `Replicate (${res.status}): ${errText.slice(0, 200)}` },
      { status: res.status === 404 ? 404 : 502 }
    );
  }

  const data = await res.json() as {
    id: string;
    status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
    output?: unknown;
    error?: string | null;
    metrics?: { predict_time?: number };
  };

  // succeeded 時のみ output を { drums, bass, vocals, other } 形式に正規化
  const normalizedOutput = data.status === 'succeeded'
    ? normalizeStemUrls(data.output)
    : null;

  return Response.json({
    predictionId: data.id,
    status: data.status,
    output: normalizedOutput,  // null until complete or if format unrecognized
    error: data.error || null,
    processingTimeSec: data.metrics?.predict_time,
  });
}
