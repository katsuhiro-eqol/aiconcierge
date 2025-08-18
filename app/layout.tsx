import type { Metadata } from "next";
//import LongTaskObserver from './LongTaskObserver';
//import Header from "@/app//components/headerbar"
import "./globals.css";

export const metadata: Metadata = {
  title: "AIcon",
  description: "created by eQOL",
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
        {children}
      </body>
    </html>
  )
}