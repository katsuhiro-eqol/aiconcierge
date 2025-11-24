// lib/quota.ts
import { createClient } from "@vercel/kv";

// KVクライアントを明示的に作成（環境変数から読み込む）
const kv = createClient({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

type Opts = {
  sessionId: string;
  functionName: string;
  limit: number;           // 例: 1日20回
  windowSec?: number;      // 例: 86400 = 24h
};

export async function checkQuotaOrThrow({
  sessionId,
  functionName,
  limit,
  windowSec = 60 * 60 * 24,
}: Opts) {
  // 環境変数の確認（デバッグ用）
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    console.error('KV環境変数が設定されていません:', {
      hasUrl: !!process.env.KV_REST_API_URL,
      hasToken: !!process.env.KV_REST_API_TOKEN,
    });
    throw new Error('KV環境変数が設定されていません');
  }

  const key = `quota:${functionName}:${sessionId}`;
  console.log("key", key)
  // 原子的にカウント
  const n = await kv.incr(key);

  // 初回だけ TTL を付与
  if (n === 1) {
    await kv.expire(key, windowSec);
  }

  if (n > limit) {
    const ttl = await kv.ttl(key); // 残り秒
    const err = new Error("QUOTA_EXCEEDED") as Error & { meta?: { remaining: number; reset: number } };
    err.meta = { remaining: 0, reset: ttl > 0 ? ttl : windowSec };
    throw err;
  }

  return { remaining: Math.max(0, limit - n) };
}
