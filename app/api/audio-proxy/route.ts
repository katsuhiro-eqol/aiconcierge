export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const u = new URL(req.url);
    const src = u.searchParams.get("src"); // ダウンロードURLをそのまま渡す
    
    console.log('[audio-proxy] Request received', { src: src?.substring(0, 100) }); // URLの最初の100文字のみログ
    
    if (!src) {
      console.error('[audio-proxy] missing src parameter');
      return new Response("missing src", { status: 400 });
    }

    // URLの検証
    try {
      new URL(src); // URLが有効かチェック
    } catch (urlError) {
      console.error('[audio-proxy] invalid URL', { src, error: urlError });
      return new Response(`Invalid URL: ${src}`, { status: 400 });
    }

    console.log('[audio-proxy] Fetching from upstream', { src: src.substring(0, 100) });
    
    const upstream = await fetch(src, { 
      cache: "no-store",
      // タイムアウト設定（30秒）
      signal: AbortSignal.timeout(30000)
    }).catch((fetchError) => {
      console.error('[audio-proxy] fetch error', { 
        src: src.substring(0, 100),
        error: fetchError instanceof Error ? fetchError.message : String(fetchError),
        errorName: fetchError instanceof Error ? fetchError.name : 'Unknown'
      });
      throw fetchError;
    });
    
    if (!upstream.ok) {
      console.error('[audio-proxy] upstream fetch failed', {
        status: upstream.status,
        statusText: upstream.statusText,
        url: src.substring(0, 100),
        headers: Object.fromEntries(upstream.headers.entries())
      });
      return new Response(`upstream error: ${upstream.status} ${upstream.statusText}`, { status: 502 });
    }
    
    if (!upstream.body) {
      console.error('[audio-proxy] upstream body is null', { url: src.substring(0, 100) });
      return new Response("upstream error: no body", { status: 502 });
    }

    // 音声の Content-Type が来ていればそれを尊重
    const ct = upstream.headers.get("content-type") ?? "audio/mpeg";
    console.log('[audio-proxy] Success', { contentType: ct, url: src.substring(0, 100) });
    
    return new Response(upstream.body, {
      headers: {
        "Content-Type": ct,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error('[audio-proxy] error', {
      error: error instanceof Error ? error.message : String(error),
      errorName: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined
    });
    return new Response(`Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
}