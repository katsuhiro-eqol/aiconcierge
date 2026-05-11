"use client"
import React from 'react';
import YouTubeEmbed from "@/app/components/youtubeEmbedded";
import { ChevronRight, Globe, Info, FolderKanban, MicVocal, FileStack, Smile } from 'lucide-react';

const features = [
  {
    icon: <FolderKanban className="w-7 h-7 text-yellow-500" />,
    iconBg: "bg-yellow-50",
    title: "簡単なQ&A登録",
    description: "Q&Aを記載したCSVファイルを登録するだけでデータベースが自動構築されます",
    id: "procedure",
  },
  {
    icon: <Info className="w-7 h-7 text-fuchsia-500" />,
    iconBg: "bg-fuchsia-50",
    title: "インターネット情報を併用",
    description: "QA情報に加えてインターネット情報も参照して回答を生成します",
    id: "generative",
  },
  {
    icon: <Globe className="w-7 h-7 text-blue-500" />,
    iconBg: "bg-blue-50",
    title: "多言語対応",
    description: "日本語Q&Aを登録するだけで5言語対応のアプリが構築されます",
    id: "language",
  },
  {
    icon: <MicVocal className="w-7 h-7 text-lime-600" />,
    iconBg: "bg-lime-50",
    title: "音声認識 & AIボイス",
    description: "多言語の音声認識とAIボイスで会話するように使えます",
    id: "voice",
  },
  {
    icon: <FileStack className="w-7 h-7 text-amber-500" />,
    iconBg: "bg-amber-50",
    title: "会話履歴解析",
    description: "会話履歴を解析してQ&Aの改善やサービス向上に活かせます",
    id: "research",
  },
  {
    icon: <Smile className="w-7 h-7 text-green-500" />,
    iconBg: "bg-green-50",
    title: "ヒューマンサポートチャット",
    description: "人間スタッフとのチャットにシームレスに移行できます（オプション）",
    id: "human_chat",
  },
];

const detailSections = [
  {
    id: "procedure",
    title: "簡単な手順でQ&Aを登録",
    bg: "bg-white",
    body: [
      "オリジナルのQ&AデータをCSVファイルで登録するだけで、AIコンシェルジュに必要なデータベースが自動的にセッティングされます。",
      "登録したQ&Aデータは常時修正・更新・削除が可能です。データの追加も簡単に行えます。",
      "チャットボットとは異なり、単に用意した回答を返すだけでなく、ユーザーの質問に応じてQA情報を再編集するアルゴリズムを採用しています。",
      "Q&A情報の登録にはエクセルやスプレッドシートのテンプレートを用意しています。",
    ],
    image: { src: "/QAtable.png", alt: "エクセルやスプレッドシート" },
    video: { videoId: "p_fKVBbyUN8?si=_7TC6TnTWzP8yJb0", title: "Q&A登録紹介動画" },
  },
  {
    id: "generative",
    title: "インターネット情報を活用",
    bg: "bg-slate-50",
    body: [
      "登録されたQAに該当する情報がない、あるいは不足する場合はインターネット情報等を組み合わせて回答を生成します。",
      "サービス拠点情報をもとに交通アクセスや周辺情報などを回答したり、指定したインターネットページのみを参照させたりも可能です。",
    ],
    image: { src: "/回答アルゴリズム.png", alt: "回答生成アルゴリズム" },
  },
  {
    id: "language",
    title: "多言語対応",
    bg: "bg-white",
    body: [
      "日本語でQA情報を登録するだけで、多言語に対応したAIコンシェルジュを生成できます。",
      "デフォルトで日本語・英語・中国語（簡体）・中国語（繁体）・韓国語の5言語を使用できます。",
      "テキスト表示だけでなく、音声認識・音声出力も多言語対応しています。",
      "その他の言語への対応も応相談です。",
    ],
  },
  {
    id: "voice",
    title: "音声認識 & AIボイス",
    bg: "bg-slate-50",
    body: [
      "多言語での音声認識とAIボイスに対応しているので、会話をするようにAIコンシェルジュを利用できます。",
    ],
  },
  {
    id: "research",
    title: "会話履歴解析",
    bg: "bg-white",
    body: [
      "AIコンシェルジュの会話履歴および解析結果を提供します。",
      "問い合わせ内容や回答を確認・分析してQ&Aの改善に繋げることができます。",
    ],
  },
  {
    id: "human_chat",
    title: "ヒューマンサポートチャット（オプション）",
    bg: "bg-slate-50",
    body: [
      "人間スタッフとのチャットにシームレスに移行することができます。",
    ],
  },
];

export default function Features() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">

      {/* Page header */}
      <section className="bg-gradient-to-b from-blue-50 to-white pt-14 pb-12 px-4 text-center">
        <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
          特徴
        </span>
        <h1 className="text-3xl font-bold text-slate-900 lg:text-4xl">
          顧客満足度を高める<br className="sm:hidden" />さまざまな機能
        </h1>
        <p className="mt-4 text-slate-600 text-sm max-w-xl mx-auto leading-relaxed">
          インバウンドコンシェルジュは、事業者様の負担を最小限に抑えながら、<br className="hidden sm:block" />
          訪日外国人のお客様に最高のサービス体験を提供します。
        </p>
      </section>

      {/* Feature cards grid */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <a
              key={i}
              href={`#${feature.id}`}
              className="group flex flex-col gap-4 p-6 rounded-2xl border border-slate-200 bg-white hover:shadow-lg hover:border-blue-200 transition-all"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${feature.iconBg}`}>
                {feature.icon}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-1">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
              </div>
              <div className="mt-auto flex items-center gap-1 text-blue-500 text-sm font-medium group-hover:gap-2 transition-all">
                詳細を見る <ChevronRight className="w-4 h-4" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Detail sections */}
      {detailSections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className={`py-14 px-4 ${section.bg}`}
        >
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-7 rounded-full bg-blue-500 shrink-0" />
              <h2 className="text-xl font-bold text-slate-800">{section.title}</h2>
            </div>
            <div className="flex flex-col gap-2 mb-8">
              {section.body.map((text, i) => (
                <p key={i} className="text-slate-600 text-sm leading-relaxed">{text}</p>
              ))}
            </div>
            {section.image && (
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm mb-8">
                <img
                  src={section.image.src}
                  alt={section.image.alt}
                  className="w-full opacity-90"
                />
              </div>
            )}
            {section.video && (
              <YouTubeEmbed videoId={section.video.videoId} title={section.video.title} />
            )}
          </div>
        </section>
      ))}

    </div>
  );
}
