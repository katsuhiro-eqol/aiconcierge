"use client"
import React, { useState } from 'react';
import { db } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Send } from 'lucide-react';

export default function Contact() {
  const [organization, setOrganization] = useState<string>("")
  const [alphabet, setAlphabet] = useState<string>("")
  const [name, setName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [content, setContent] = useState<string>("")
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")

  const sendMail = async () => {
    if (!name || !email || !organization || !alphabet || !content) {
      alert("未入力項目があります")
      return
    }
    const date = new Date()
    const offset = date.getTimezoneOffset() * 60000
    const now = new Date(date.getTime() - offset).toISOString()
    const data = { name, email, organization, alphabet, content }

    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const j = await response.json()
    if (j.ok) {
      await setDoc(doc(db, "Contact", now), { id: j.id, ...data, sendAt: now })
      setStatus("success")
    } else {
      setStatus("error")
    }
  }

  const fields = [
    { label: "お名前", placeholder: "担当者名", value: name, onChange: setName, type: "text" },
    { label: "メールアドレス", placeholder: "example@company.com", value: email, onChange: setEmail, type: "email" },
    { label: "会社・組織名", placeholder: "株式会社〇〇", value: organization, onChange: setOrganization, type: "text" },
    { label: "会社・組織名（英語表記）", placeholder: "Company Name in English", value: alphabet, onChange: setAlphabet, type: "text" },
  ]

  return (
    <div className="min-h-screen bg-white overflow-hidden">

      {/* Page header */}
      <section className="bg-gradient-to-b from-blue-50 to-white pt-14 pb-12 px-4 text-center">
        <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
          お問い合わせ
        </span>
        <h1 className="text-3xl font-bold text-slate-900 lg:text-4xl">
          まずはお気軽にご相談ください
        </h1>
        <p className="mt-4 text-slate-600 text-sm max-w-xl mx-auto leading-relaxed">
          導入のご検討・ご質問・お見積りなど、お気軽にお問い合わせください。<br className="hidden sm:block" />
          担当者より折り返しご連絡いたします。
        </p>
      </section>

      {/* Form */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-xl mx-auto">
          {status === "success" ? (
            <div className="rounded-2xl bg-blue-50 border border-blue-200 p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-5">
                <Send className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">送信が完了しました</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                お問い合わせありがとうございます。<br />
                担当者より順次ご連絡いたします。
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {fields.map((f) => (
                <div key={f.label} className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">{f.label}</label>
                  <input
                    type={f.type}
                    className="rounded-xl px-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
                    placeholder={f.placeholder}
                    value={f.value}
                    onChange={(e) => f.onChange(e.target.value)}
                  />
                </div>
              ))}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">お問い合わせ内容</label>
                <textarea
                  className="rounded-xl px-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition resize-none"
                  placeholder="お問い合わせ内容をご記入ください"
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              {status === "error" && (
                <p className="text-sm text-red-500 text-center">
                  送信中にエラーが発生しました。時間をおいて再度お試しください。
                </p>
              )}

              <button
                onClick={sendMail}
                className="mt-2 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-md"
              >
                <Send className="w-4 h-4" />
                送信する
              </button>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
