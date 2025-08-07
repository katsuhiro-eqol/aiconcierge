'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useRouter } from 'next/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()


  return (
    <>
      {/* ナビゲーション */}
      <nav className="relative z-50 border-b bg-blue-400 backdrop-blur-lg text-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-4">
                
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <a href="/inboundSite">
                <span className="text-xl font-bold">AI</span>
                </a>
              </div>
              <a href="/inboundSite" className="text-slate-900 text-xl font-bold">Inbound Concierge</a>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
            <div className="hidden md:flex items-center space-x-8">
                <a href="/inboundSite/demoTop" className="px-4 text-lg font--bold border-2 rounded-lg border-blue-500 bg-purple-600  text-slate-100 hover:bg-purple-700 transition-colors">無料デモ体験</a>
                <a href="#" className="text-slate-700 hover:text-slate-900">特徴</a>
                <a href="#pricing" className="text-slate-700 hover:text-slate-900">料金</a>
                <a href="/user" className="text-slate-700 hover:text-slate-900">サインイン</a>
              </div>
            </div>

            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* モバイルメニュー */}
      {isMenuOpen && (
            <div className="md:hidden fixed inset-0 z-40 bg-slate-900/95 backdrop-blur-lg">
            <div className="flex flex-col items-center justify-center h-full space-y-8 text-2xl">
              <a href="/features" className="text-white" onClick={() => setIsMenuOpen(false)}>機能</a>
              <a href="#" className="text-white">採用実績</a>
              <a href="#pricing" className="text-white" onClick={() => setIsMenuOpen(false)}>料金</a>
              <a href="#about" className="text-white" onClick={() => setIsMenuOpen(false)}>会社概要</a>
            </div>
          </div>
      )}
    </>
  )
}