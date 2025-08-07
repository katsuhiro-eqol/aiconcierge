"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Star} from 'lucide-react';
import Image from 'next/image';

export default function InboundSite() {
  const [scrollY, setScrollY] = useState(0);


  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="p-2 min-h-screen bg-gradient-to-br from-white via-slate-200 to-slate-100 overflow-hidden">
        <div className="mt-10 text-2xl font-bold text-blue-800 text-center lg:text-3xl sm:text-2xl">インバウンド顧客対応に頭を悩ませている事業主様へ</div>
        <div className="mt-4 text-lg font-bold text-blue-800 text-center lg:text-2xl sm:text-xl">日本語でQ&Aを登録するだけで、多言語対応AIコンシェルジュが利用できます</div>

        <div className="mt-12 text-2xl font-bold text-blue-800 text-center">1st ステップ</div>
        <div className="mt-5 text-base text-blue-800 text-center lg:text-xl">事業者様に「顧客に頻繁に質問される事項」と「それに対する回答」を</div>
        <div className="text-base text-blue-800 text-center lg:text-xl">日本語で、エクセルシートに記入していただきます</div>
        <div className="text-base text-blue-800 text-center lg:text-xl">提示したい図面がある場合はそのファイル名を記載します</div>
        <img className="min-w-72 w-2/5 mx-auto mt-8 opacity-60" src="/QAtable.png" alt="エクセルやスプレッドシート" />
        <div className="mt-12 text-2xl font-bold text-blue-800 text-center">2nd ステップ</div>
        <div className="mt-5 mb-5 text-base text-blue-800 text-center lg:text-xl">自動でデータベースが構築され、顧客用QRコードが発行されます</div>
        <img className="min-w-64 w-1/5 mx-auto mt-8 opacity-60" src="/コンシェルジュQRコード.jpg" alt="QRコード" />
        <div className="mt-12 text-2xl font-bold text-blue-800 text-center">3rd ステップ</div>
        <div className="mt-5 text-xl text-blue-800 text-center lg:text-xl">顧客はQRコードからアプリにアクセス</div>        
        <div className="mb-5 text-xl text-blue-800 text-center lg:text-xl">言語を選択して、チャット形式で質問できます</div>  
        <div className="w-4/5 mx-auto flex flex-row gap-x-4 bg-blue-800 py-5">
            <div className="w-1/4 mx-auto" >
            <p className="text-bold text-center text-white mb-3">日本語</p>
            <img src="/日本語1.png" alt="エクセルやスプレッドシート" />
            </div>
            <div className="w-1/4 mx-auto" >
            <p className="text-bold text-center text-white mb-3">英語</p>
            <img src="/English1.png" alt="エクセルやスプレッドシート" />
            </div>
            <div className="w-1/4 mx-auto" >
            <p className="text-bold text-center text-white mb-3">中国語（簡体）</p>
            <img src="/中文1.png" alt="エクセルやスプレッドシート" />
            </div>            
        </div>
    </div>
  );
}

/*
<div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
*/