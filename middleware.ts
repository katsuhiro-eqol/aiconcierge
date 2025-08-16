import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { kv } from "@vercel/kv";
import { jwtVerify } from 'jose'
import { verify } from 'jsonwebtoken';

//aiconページに対するアクセス制限
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
type Session = {
  firstSeen: number;
  expiresAt: number;
  lastRenewedAt?: number;
};

// ミドルウェア関数
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  //aiconサイトへのアクセス制限
  /*
  if (
    path.startsWith("/api/renew") || path === "/expired" ||
    path.startsWith("/user") || path.startsWith("/staff") || path === "/auth" || path === "staffAuth"
  ) {
    return NextResponse.next()
  }
  const sid = request.cookies.get("session_id")?.value;
  if (!sid) return redirectExpired(request);
  const sessionKey = `session:${sid}`;
  const session = await kv.get<Session>(sessionKey);

  if (!session) return redirectExpired(request);

  const now = Date.now();
  if (now > session.expiresAt) return redirectExpired(request);
*/
  // トークンの取得
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
  }

  return NextResponse.next();
}

const redirectExpired = (request: NextRequest) => {
  return NextResponse.redirect(new URL("/expired", request.url));
}

// ミドルウェアを適用するパスを指定
export const config = {
  matcher: [
    '/user/:path*', '/staff/:path*'
  ]
};