import { NextResponse } from 'next/server';
import { createClient } from "@vercel/kv"
import type { NextRequest } from 'next/server';

const COOKIE = "session_id";

// KVクライアントを取得する関数（実行時に環境変数を読み込む）
function getKvClient() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  
  // デバッグ用ログ
  console.log('KV環境変数チェック:', {
    hasUrl: !!url,
    hasToken: !!token,
    token20: token?.slice(0,20),
    urlLength: url?.length || 0,
    tokenLength: token?.length || 0,
  });
  
  if (!url || !token) {
    return null;
  }
  
  return createClient({
    url,
    token,
  });
}

  // ミドルウェア関数
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // クッキーの読み込み（デバッグ用）
  const cookieHeader = request.headers.get('cookie');
  const sid = request.cookies.get(COOKIE)?.value;
  
  // KVクライアントを実行時に取得（Edge Runtimeではこれが重要）
  const kv = getKvClient();
  
  // デバッグログ
  console.log('Middleware debug:', {
    path,
    hasCookieHeader: !!cookieHeader,
    cookieHeaderLength: cookieHeader?.length || 0,
    sidValue: sid || 'undefined',
    allCookies: request.cookies.getAll().map(c => c.name),
  });
  
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