import { NextResponse } from 'next/server';
import { createClient } from "@vercel/kv"
import type { NextRequest } from 'next/server';

const COOKIE = "session_id";

// KVクライアントを取得する関数（実行時に環境変数を読み込む）
function getKvClient() {
  console.log('[GET_KV_CLIENT START]');
  
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  
  // デバッグ用ログ（確実に表示されるように）
  console.log('[KV環境変数チェック]', {
    hasUrl: !!url,
    hasToken: !!token,
    token20: token?.slice(0,20),
    urlLength: url?.length || 0,
    tokenLength: token?.length || 0,
  });
  
  if (!url || !token) {
    console.log('[KV CLIENT] 環境変数が不足しているためnullを返す');
    return null;
  }
  
  try {
    const client = createClient({
      url,
      token,
    });
    console.log('[KV CLIENT] クライアント作成成功');
    return client;
  } catch (error) {
    console.error('[KV CLIENT] エラー:', error);
    return null;
  }
}

  // ミドルウェア関数
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // 最初にログを出力（確実に表示されるように）
  console.log('[MIDDLEWARE START]', path);
  
  // クッキーの読み込み（デバッグ用）
  const cookieHeader = request.headers.get('cookie');
  const sid = request.cookies.get(COOKIE)?.value;
  
  console.log('[COOKIE CHECK]', {
    hasCookieHeader: !!cookieHeader,
    cookieHeaderLength: cookieHeader?.length || 0,
    sidValue: sid || 'undefined',
    allCookies: request.cookies.getAll().map(c => c.name),
  });
  
  // KVクライアントを実行時に取得（Edge Runtimeではこれが重要）
  console.log('[BEFORE KV CLIENT]');
  const kv = getKvClient();
  console.log('[AFTER KV CLIENT]', { kvIsNull: kv === null, kvIsUndefined: kv === undefined });
  
  // KVとSIDの状態をログ出力
  const kvStatus = (kv === null || kv === undefined) ? "kv:false" : "kv:OK";
  const sidStatus = (sid === null || sid === undefined) ? "sid:false" : "sid:OK";
  
  console.log('[STATUS]', { kvStatus, sidStatus });
  
  // 個別のログも出力（互換性のため）
  if (kv === null || kv === undefined){
    console.log("kv:false")
  } else {
    console.log("kv:OK")
  }
  if (sid === null || sid === undefined){
    console.log("sid:false")
  } else {
    console.log("sid:OK")
  }

  // 基本的なパスチェック
  if (path.startsWith("/_next") || path.startsWith("/favicon.ico") || path.startsWith("/inboundSite")) {
    return NextResponse.next();
  }

  // ログインが必要なページのトークンの取得
  const token = request.cookies.get('authToken')?.value
  const staffToken = request.cookies.get('authStaffToken')?.value

  if (path.startsWith("/user")){
    if (!token) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  } else if (path.startsWith("/staff")){
    if (!staffToken) {
      return NextResponse.redirect(new URL('/staffAuth', request.url));
    } 
  } else if (path.startsWith("/aicon")){
    // KVセッション管理を追加

    if (!kv) {
      return NextResponse.next();
    }
    
    const sid = request.cookies.get(COOKIE)?.value;
    if (!sid) {
      return redirectExpired(request);
    }
    
    try {
      const data = await kv.get<{ expiresAt: number }>(`session:${sid}`);
      if (!data || Date.now() > Number(data.expiresAt)) {
        return redirectExpired(request);
      }
    } catch (error) {
      console.error('KV error:', error);
      return redirectExpired(request);
    }
  }
  
  return NextResponse.next();
}


const redirectExpired = (request: NextRequest) => {
  return NextResponse.redirect(new URL("/expired", request.url));
}

// ミドルウェアを適用するパスを指定
export const config = {
  matcher: [
    '/user/:path*', '/staff/:path*', '/aicon/:path*'
  ]
};

/*
 else if (path.startsWith("/aicon")){
    // KVセッション管理を追加

    if (!kv) {
      return NextResponse.next();
    }
    
    const sid = request.cookies.get(COOKIE)?.value;
    if (!sid) {
      return redirectExpired(request);
    }
    
    try {
      const data = await kv.get<{ expiresAt: number }>(`session:${sid}`);
      if (!data || Date.now() > Number(data.expiresAt)) {
        return redirectExpired(request);
      }
    } catch (error) {
      console.error('KV error:', error);
      return redirectExpired(request);
    }

  }
    */