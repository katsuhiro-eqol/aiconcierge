import type { Metadata } from "next";
import Header from "@/app//components/headerbar"
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Inbound",
  description: "created by Target/Global",
  icons: {
    icon: '/icons8-ai-48.png', 
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <Header />
        {children}
        <footer className="relative z-10 py-12 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold">AI</span>
              </div>
              <span className="text-lg font-bold">Inbound Concierge</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 Inbound Concierge. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
      </body>
    </html>
  )
}