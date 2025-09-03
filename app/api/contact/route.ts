import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs"; // ← Node.js ランタイムで

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
    const { name, email, organization, alphabet, content } = await req.json()
    try {
        const { data, error } = await resend.emails.send({
        from: process.env.CONTACT_FROM!,      // 例: "Your Co <info@example.com>"
        to: email,             // テスト宛先
        bcc: "katsuhiro.yamashita@eqol.club",
        replyTo: process.env.CONTACT_REPLY_TO || undefined,
        subject: "インバウンドコンシェルジュの問い合わせを受け付けました",
        text: emailText(name, email, organization, alphabet, content),
        });
        if (error) return NextResponse.json({ ok:false, error }, { status: 500 });
        return NextResponse.json({ ok:true, id: data?.id });
    } catch (error) {
        return NextResponse.json({ ok:false, error: error ?? "unknown" }, { status: 500 });
    }
}

const emailText = ( name:string, email:string, organization:string, alphabet:string, content:string) => {
    const t = `${organization}\n${name}様\n\nお問い合わせありがとうございます\n\nお問い合わせ内容：\n${content}\n\nお問い合わせ内容を確認の上、弊社担当者よりご連絡いたします\n\n株式会社eQOL https://eqol.main.jp\nInbound Conciergeは株式会社eQOLが運営しています`
    return t
}

// app/api/contact/route.ts
/*
import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY!);

const Schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(10),
  // Turnstile を使う場合
  turnstileToken: z.string().optional(),
});

async function verifyTurnstile(token: string, ip?: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // 導入前はスキップ可
  const form = new URLSearchParams({
    secret,
    response: token,
    ...(ip ? { remoteip: ip } : {}),
  });
  const r = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    { method: "POST", body: form }
  );
  const json = await r.json();
  return Boolean(json.success);
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined;
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // Bot対策（導入時）
  if (parsed.data.turnstileToken) {
    const ok = await verifyTurnstile(parsed.data.turnstileToken, ip);
    if (!ok) {
      return NextResponse.json({ error: "Bot verification failed" }, { status: 400 });
    }
  }

  const FROM = process.env.CONTACT_FROM!; // 例: 'Your Company <contact@updates.example.com>'
  const TO_INTERNAL = process.env.CONTACT_TO!; // 社内通知先: 'info@example.com' など

  // (a) 社内通知（返信はユーザー宛へ飛ぶように replyTo を設定）
  await resend.emails.send({
    from: FROM,
    to: TO_INTERNAL,
    replyTo: parsed.data.email,
    subject: `【問い合わせ】${parsed.data.name} さんより`,
    text:
      `From: ${parsed.data.name} <${parsed.data.email}>\n\n` +
      `${parsed.data.message}\n`,
  });

  // (b) 自動受付（From は自社ドメイン）
  await resend.emails.send({
    from: FROM,
    to: parsed.data.email,
    subject: "お問い合わせありがとうございます",
    text:
      `${parsed.data.name} 様\n\n` +
      `この度はお問い合わせありがとうございます。内容を確認のうえ、通常24時間以内にご返信いたします。\n\n` +
      `— お問い合わせ内容 —\n${parsed.data.message}\n`,
  });

  return NextResponse.json({ ok: true });
}
*/