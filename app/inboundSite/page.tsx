"use client"
import React from 'react';
import YouTubeEmbed from "@/app/components/youtubeEmbedded";
import { Check, ChevronRight } from 'lucide-react';

const highlights = [
  "日本語でQ&Aを登録するだけで多言語AIコンシェルジュが即日稼働",
  "ホテル・店舗・観光施設など様々な業態に対応",
  "QRコード一発アクセスで顧客がすぐ利用開始",
  "英語・中国語（簡・繁）・韓国語など5言語を標準搭載",
  "音声認識・AIボイスで会話するように使える",
  "会話履歴の解析でサービス品質を継続改善",
  "地図・写真・PDFなどの添付ファイルも回答に表示可能",
  "イベント情報の追加・更新を事業者様が簡単に操作",
  "想定Q&Aリストの作成は弊社がサポート",
  "人間スタッフへのチャット引き継ぎもオプションで対応",
];

const languages = [
  { label: "日本語", src: "/日本語1.png" },
  { label: "英語", src: "/English1.png" },
  { label: "中国語（簡体）", src: "/中文1.png" },
];

export default function InboundSite() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">

      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white pt-16 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block mb-5 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium tracking-wide">
            インバウンド向け AI コンシェルジュ
          </span>
          <h1 className="text-3xl font-bold text-slate-900 leading-tight lg:text-5xl">
            インバウンド顧客対応を、<br />
            <span className="text-blue-600">もっとスマートに。</span>
          </h1>
          <p className="mt-6 text-base text-slate-600 max-w-2xl mx-auto leading-relaxed lg:text-lg">
            日本語Q&Aを登録するだけで、多言語対応のAIコンシェルジュが構築できます。<br className="hidden sm:block" />
            頭を悩ませていたインバウンド対応が、シンプルに解決します。
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/inboundSite/demoTop"
              className="px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-md"
            >
              無料デモを試す
            </a>
            <a
              href="/inboundSite/features"
              className="inline-flex items-center justify-center gap-1 px-8 py-3 rounded-xl border-2 border-blue-200 text-blue-700 font-semibold hover:border-blue-400 transition-colors"
            >
              特徴を見る <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-10">
            サービスの特徴
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {highlights.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 hover:bg-blue-50 transition-colors"
              >
                <Check className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                <span className="text-slate-700 text-sm leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Language showcase */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">
            多言語対応
          </h2>
          <p className="text-slate-500 text-center mb-10 text-sm">
            同じQ&Aが複数の言語でシームレスに利用できます
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-start">
            {languages.map((lang) => (
              <div key={lang.label} className="flex-1 max-w-xs mx-auto">
                <p className="text-center text-sm font-semibold text-slate-600 mb-3">{lang.label}</p>
                <div className="rounded-2xl overflow-hidden shadow-md border border-slate-200">
                  <img src={lang.src} alt={lang.label} className="w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-8">
            紹介動画
          </h2>
          <YouTubeEmbed videoId="bER629Yt4Pc?si=oeNjrw14aJnXqyCG" title="インバウンドコンシェルジュ紹介動画" />
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-16 px-4 bg-blue-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            まずは無料デモで体験してみませんか？
          </h2>
          <p className="text-blue-200 mb-8 text-sm">
            架空ホテルのシナリオで、実際の使い心地をすぐに確認できます。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/inboundSite/demoTop"
              className="px-8 py-3 rounded-xl bg-white text-blue-700 font-semibold hover:bg-blue-50 transition-colors shadow-md"
            >
              無料デモを試す
            </a>
            <a
              href="/inboundSite/contact"
              className="px-8 py-3 rounded-xl border-2 border-white/40 text-white font-semibold hover:border-white/70 transition-colors"
            >
              お問い合わせ
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
