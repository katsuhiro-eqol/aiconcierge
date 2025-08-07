"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Star} from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const [scrollY, setScrollY] = useState(0);


  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background */}
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

      <section className="relative z-10 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center bg-white/10 rounded-full px-4 py-2 mb-8 backdrop-blur-sm">
              <Star className="w-4 h-4 text-yellow-400 mr-2" />
              <span className="text-sm">個別ニーズに対応するチャットAI</span>
            </div>
            
            <h1 className="text-2xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent leading-tight">
              オリジナルQ&Aで育てる
              <br />
              <span className="text-5xl md:text-7xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AIコンシェルジュ
              </span>
            </h1>
            
            <div className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              <div>「AIチャット」と「スタッフサポート」を</div>
             <div> シームレスに連携する</div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button className="group bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 rounded-full text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-2xl">
                無料で始める
                <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <Link href="/sample" rel="noopener noreferrer">
              <button className="px-8 py-4 rounded-full border-2 border-white/20 hover:border-white/40 transition-all backdrop-blur-sm" >
                AIコンシェルジュを試す
              </button>
              </Link>
            </div>


          </div>
        </div>
      </section>

      <section id="start" className="relative z-10 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl p-12 backdrop-blur-sm border border-white/10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              今すぐ始めましょう
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              無料トライアルでQ&A構築手順をお試しいただけます。
              クレジットカード不要、即座に開始できます。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 rounded-full text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-2xl">
                無料トライアル開始
              </button>
            </div>
          </div>
        </div>
      </section>


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