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
      icon: <Globe className="w-12 h-12 text-blue-500" />,
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
      icon: <Info className="w-12 h-12 text-fuchsia-500" />,
      title: "インターネット情報を併用",
      description: "QAに登録してない内容も一般的な情報は回答可能です（オプリョン）",
      id:"generative"
    } ,
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
                className="p-5 border-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white"
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section id="algorithm" className="mx-8 mt-10 mb-20 p-3 rounded-xl text-black bg-white backdrop-blur-sm border border-white/10">
                <div className="text-2xl text-slate-800">簡単な手順でQ&Aを登録</div>
                <div className="text-sm text-slate-800">御社オリジナルのQ&AデータにてAIコンシェルジュ（AIコン）を作成できます。AIコン作成に必要なデータはQ&Aデータを保存したCSVファイルのみです。</div>
            </section>
        </div>

      <footer className="relative z-10 border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold">AI</span>
              </div>
              <span className="text-lg font-bold">concierge</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 AI concierge. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
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