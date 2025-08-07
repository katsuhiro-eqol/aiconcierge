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
      </body>
    </html>
  )
}