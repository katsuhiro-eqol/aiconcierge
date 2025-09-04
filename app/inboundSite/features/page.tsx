"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Zap, Globe, Info, Menu, X, Star, Smile, Paperclip, MicVocal, FolderKanban, FileStack } from 'lucide-react';
import Image from 'next/image';

export default function Features() {
  const [scrollY, setScrollY] = useState(0);


  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
        icon: <FolderKanban className="w-12 h-12 text-yellow-500" />,
        title: "簡単な手順でQ&Aを登録",
        description: "Q&Aを記載したCSVファイルを登録するだけです",
        id:"procedure"
    },
    {
        icon: <Info className="w-12 h-12 text-fuchsia-500" />,
        title: "インターネット情報を併用",
        description: "QA情報に加えてインターネット情報も参照します",
        id:"generative"
        } ,
    {
        icon: <Globe className="w-12 h-12 text-orange-400" />,
        title: "多言語対応",
        description: "日本語Q&Aを登録するだけで多言語対応アプリが構築されます",
        id:"language"
        },
    {
        icon: <MicVocal className="w-12 h-12 text-lime-500" />,
        title: "音声認識＆AIボイス",
        description: "音声認識とAIボイスが多言語で使用可能です（オプション）",
        id:"voice"
        },
    {
        icon: <Smile className="w-12 h-12 text-green-500" />,
        title: "ヒューマンサポートチャット",
        description: "人間スタッフとのチャットにシームレスに移行できます（オプション）",
        id:"human_chat"
        },
    {
        icon: <FileStack className="w-12 h-12 text-amber-500" />,
        title: "会話履歴解析",
        description: "会話履歴を解析しより良いサービス提供に繋げることができます（オプション）",
        id:"research"
        }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-200 to-slate-100 overflow-hidden">
      <section id="features" className="relative z-10 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8 text-2xl font-bold text-blue-800 text-center lg:text-3xl sm:text-2xl">
              <div>インバウンドコンシェルジュには</div>
              <div>顧客満足度を高めるさまざまな機能があります</div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="p-5 border-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white"
              >
                <div className="mb-6 transform group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                <div className="mt-6 flex items-center text-blue-400 group-hover:text-purple-400 transition-colors">
                    <a href={`#${feature.id}`}>
                    <span className="text-sm font-semibold">詳細を見る</span>
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


        <section id="procedure" className="mx-8 mt-10 mb-20 p-3 rounded-xl text-black bg-white backdrop-blur-sm border border-white/10">
            <div className="mb-5 font-bold text-2xl text-blue-800">簡単な手順でQ&Aを登録</div>
            <div className="text-base text-slate-800">オリジナルのQ&Aデータを保存したCSVファイルを登録するだけで、AIコンシェルジュに必要なデータベースが自動的にセッティングされます</div>
            <div className="text-base text-slate-800">登録したQ&Aデータは常時修正・更新・削除が可能です。またデータの追加も簡単です</div>
            <div className="text-base text-slate-800">チャットボットとは異なり、単に用意したAを返すだけでなく、ユーザー質問に応じてQA情報を再編集するアルゴリズムを採用しています</div>
            <img className="min-w-72 w-2/5 mx-auto mt-8 opacity-60" src="/QAtable.png" alt="エクセルやスプレッドシート" />
        </section>
        <section id="generative" className="mx-8 mt-10 mb-20 p-3 rounded-xl text-black bg-white backdrop-blur-sm border border-white/10">
            <div className="mb-5 font-bold text-2xl text-blue-800">インターネット情報を併用</div>
            <div className="text-base text-slate-800">登録されたQAに該当する情報がない、あるいは不足する場合はインターネット情報等を組み合わせて回答を生成します</div>
            <div className="text-base text-slate-800">サービスを提供する拠点情報をもとに、交通アクセスや周辺情報などを回答したり、指定したインターネットページのみを参照させたりも可能です</div>
        </section>
        <section id="language" className="mx-8 mt-10 mb-20 p-3 rounded-xl text-black bg-white backdrop-blur-sm border border-white/10">
            <div className="mb-5 font-bold text-2xl text-blue-800">多言語対応</div>
            <div className="text-base text-slate-800">日本語でQA情報を登録するだけで、多言語に対応したAIコンシェルジュを生成できます</div>
            <div className="text-base text-slate-800">現時点で、日本語（デフォルト）、英語、中国語（簡体）、中国語（繁体）、韓国語に対応可能です</div>
            <div className="text-base text-slate-800">インバウンドコンシェルジュアプリを利用するユーザーが使用言語を指定します</div>
        </section>
        <section id="voice" className="mx-8 mt-10 mb-20 p-3 rounded-xl text-black bg-white backdrop-blur-sm border border-white/10">
            <div className="mb-5 font-bold text-2xl text-blue-800">音声認識＆AIボイス（オプション）</div>
            <div className="text-base text-slate-800">多言語での音声認識とAIボイスに対応していますので、会話をするようにAIコンシェルジュを利用できます</div>
        </section>
        <section id="human_chat" className="mx-8 mt-10 mb-20 p-3 rounded-xl text-black bg-white backdrop-blur-sm border border-white/10">
            <div className="mb-5 font-bold text-2xl text-blue-800">ヒューマンサポートチャット（オプション）</div>
            <div className="text-base text-slate-800">人間スタッフとのチャットにシームレスに移行することができます</div>
        </section>
        <section id="research" className="mx-8 mt-10 mb-20 p-3 rounded-xl text-black bg-white backdrop-blur-sm border border-white/10">
            <div className="mb-5 font-bold text-2xl text-blue-800">会話履歴解析（オプション）</div>
            <div className="text-base text-slate-800">AIコンシェルジュの会話履歴を解析することが可能です</div>
        </section>
    </div>
  );
}

/*
className="group p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all hover:transform hover:scale-105"


<div className="fixed inset-0 z-0">
<div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-pulse"></div>
<div 
    className="absolute inset-0 opacity-30"
    style={{
    backgroundImage: `radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%), 
                        radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.3) 0%, transparent 50%), 
                        radial-gradient(circle at 40% 80%, rgba(14, 165, 233, 0.3) 0%, transparent 50%)`,
    transform: `translateY(${scrollY * 0.5}px)`
    }}
></div>
</div>
*/