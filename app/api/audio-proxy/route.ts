export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const u = new URL(req.url);
  const src = u.searchParams.get("src"); // ダウンロードURLをそのまま渡す
  if (!src) return new Response("missing src", { status: 400 });

  const upstream = await fetch(src, { cache: "no-store" });
  if (!upstream.ok || !upstream.body) {
    return new Response("upstream error", { status: 502 });
  }

  // 音声の Content-Type が来ていればそれを尊重
  const ct = upstream.headers.get("content-type") ?? "audio/mpeg";
  return new Response(upstream.body, {
    headers: {
      "Content-Type": ct,
      "Cache-Control": "no-store",
    },
  });
}