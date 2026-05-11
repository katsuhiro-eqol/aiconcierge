'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { href: "/inboundSite/features", label: "特徴" },
  { href: "/inboundSite/price", label: "料金" },
  { href: "/inboundSite/contact", label: "お問い合わせ" },
  { href: "/user", label: "サインイン" },
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">

            {/* Logo */}
            <a href="/inboundSite" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-white">AI</span>
              </div>
              <span className="text-slate-800 text-base font-bold tracking-tight">Inbound Concierge</span>
            </a>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="/inboundSite/demoTop"
                className="ml-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
              >
                無料デモ
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="メニュー"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 top-14 z-40 bg-white border-t border-slate-100">
          <div className="flex flex-col px-6 py-6 gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="py-3 text-base text-slate-700 hover:text-slate-900 border-b border-slate-100 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="/inboundSite/demoTop"
              className="mt-4 py-3 rounded-xl bg-blue-600 text-white text-base font-semibold text-center hover:bg-blue-700 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              無料デモ
            </a>
          </div>
        </div>
      )}
    </>
  )
}
