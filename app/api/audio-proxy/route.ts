export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const u = new URL(req.url);
    const src = u.searchParams.get("src"); // ダウンロードURLをそのまま渡す
    if (!src) return new Response("missing src", { status: 400 });

    const upstream = await fetch(src, { cache: "no-store" });
    if (!upstream.ok) {
      console.error('audio-proxy: upstream fetch failed', {
        status: upstream.status,
        statusText: upstream.statusText,
        url: src
      });
      return new Response(`upstream error: ${upstream.status} ${upstream.statusText}`, { status: 502 });
    }
    
    if (!upstream.body) {
      console.error('audio-proxy: upstream body is null', { url: src });
      return new Response("upstream error: no body", { status: 502 });
    }

    // 音声の Content-Type が来ていればそれを尊重
    const ct = upstream.headers.get("content-type") ?? "audio/mpeg";
    return new Response(upstream.body, {
      headers: {
        "Content-Type": ct,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error('audio-proxy: error', error);
    return new Response(`Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
}