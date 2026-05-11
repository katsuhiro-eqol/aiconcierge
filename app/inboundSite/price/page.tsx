"use client"
import React from 'react';
import { Check } from 'lucide-react';

const basicFeatures = [
  "Q&Aリスト作成を全面サポート",
  "3ヶ月間の月額料金が初期費用に含まれます",
  "多言語対応（日本語・英語・中国語（簡体・繁体）・韓国語）",
  "音声認識・AIボイス",
  "インターネット情報を併用して回答",
  "任意の言語の追加が可能（応相談）",
];

const options = [
  {
    title: "オプション言語",
    description: "ご希望の言語を1言語単位で追加できます",
    price: "¥50,000",
    unit: "/ 言語（初期費用のみ）",
  },
  {
    title: "ヒューマンサポートチャット",
    features: [
      "ユーザーの要請でAIからスタッフチャットへシームレスに移行",
      "ユーザーの質問は自動翻訳され、日本語で回答可能",
      "スタッフ用の専用システム・管理ページを追加",
    ],
    price: "¥100,000",
    unit: "/ 月",
  },
];

export default function Price() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">

      {/* Page header */}
      <section className="bg-gradient-to-b from-blue-50 to-white pt-14 pb-12 px-4 text-center">
        <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
          料金
        </span>
        <h1 className="text-3xl font-bold text-slate-900 lg:text-4xl">
          シンプルな料金体系
        </h1>
        <p className="mt-4 text-slate-600 text-sm max-w-xl mx-auto leading-relaxed">
          まずは3ヶ月間、実際にサービスをお試しください。<br className="hidden sm:block" />
          Q&Aリストの作成から導入まで、弊社が全面サポートします。
        </p>
      </section>

      {/* Basic plan */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-base font-bold text-slate-500 uppercase tracking-widest text-center mb-8">
            基本料金
          </h2>
          <div className="rounded-2xl border-2 border-blue-200 overflow-hidden shadow-sm">
            <div className="bg-blue-600 px-8 py-6 text-white">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                <div>
                  <p className="text-blue-200 text-sm mb-1">ベーシックプラン</p>
                  <h3 className="text-2xl font-bold">QAデータ数 500件未満</h3>
                </div>
                <div className="text-right">
                  <p className="text-blue-200 text-xs mb-0.5">月額</p>
                  <p className="text-3xl font-bold">¥100,000<span className="text-lg font-medium text-blue-200"> / 月</span></p>
                </div>
              </div>
            </div>
            <div className="bg-white px-8 py-6">
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm font-semibold text-slate-700">初期費用</p>
                <p className="text-lg font-bold text-slate-900">¥300,000<span className="text-sm font-normal text-slate-500 ml-1">（3ヶ月分の月額を含む）</span></p>
              </div>
              <div className="h-px bg-slate-100 mb-5" />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">含まれる機能</p>
              <div className="flex flex-col gap-3">
                {basicFeatures.map((f, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    <span className="text-slate-600 text-sm leading-relaxed">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-4 text-slate-400 text-xs text-center">
            ＊ QAデータが500件を超える場合はご相談ください
          </p>
        </div>
      </section>

      {/* Options */}
      <section className="py-14 px-4 bg-slate-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-base font-bold text-slate-500 uppercase tracking-widest text-center mb-8">
            オプション料金
          </h2>
          <div className="flex flex-col gap-5">
            {options.map((opt, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-800">{opt.title}</h3>
                  <div className="text-right shrink-0">
                    <span className="text-xl font-bold text-slate-900">{opt.price}</span>
                    <span className="text-slate-400 text-sm ml-1">{opt.unit}</span>
                  </div>
                </div>
                <div className="px-8 py-5">
                  {opt.description && (
                    <p className="text-slate-600 text-sm">{opt.description}</p>
                  )}
                  {opt.features && (
                    <div className="flex flex-col gap-2">
                      {opt.features.map((f, j) => (
                        <div key={j} className="flex items-start gap-3">
                          <Check className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                          <span className="text-slate-600 text-sm leading-relaxed">{f}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-4 bg-blue-600">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-3">まずはお気軽にご相談ください</h2>
          <p className="text-blue-200 text-sm mb-8">
            導入に関するご質問や見積もりのご依頼はお問い合わせフォームから承ります。
          </p>
          <a
            href="/inboundSite/contact"
            className="inline-block px-10 py-3 rounded-xl bg-white text-blue-700 font-bold hover:bg-blue-50 transition-colors shadow-md"
          >
            お問い合わせ
          </a>
        </div>
      </section>

    </div>
  );
}
