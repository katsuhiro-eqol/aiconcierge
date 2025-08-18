import { createClient } from "@vercel/kv";
import { NextResponse } from "next/server";

export const runtime = "edge";

const kv = createClient({
  url: process.env.KV_REST_API_URL!,     // ← UpstashのREST URL
  token: process.env.KV_REST_API_TOKEN!, // ← UpstashのREST TOKEN
});

export async function GET() {
  await kv.set("hello", "world", { ex: 60 });
  const val = await kv.get<string>("hello");
  return NextResponse.json({ ok: val === "world", val });
}