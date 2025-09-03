"use client"
import React, {useState, useEffect} from 'react';
import { db } from "@/firebase";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";


export default function Contact() {
    const [organization, setOrganization] = useState<string>("")
    const [alphabet, setAlphabet] = useState<string>("")
    const [name, setName] = useState<string>("")
    const [email, setEmail] = useState<string>("")
    const [content, setContent] = useState<string>("")
    const [status, setStatus] = useState<string>("")

    const sendMail = async () => {        
        if (name ==="" || email ==="" || organization === "" || alphabet === "" || content === ""){
            alert("未入力項目があります")
            return
        }
        const date = new Date()
        const offset = date.getTimezoneOffset() * 60000
        const localDate = new Date(date.getTime() - offset)
        const now = localDate.toISOString()
        const data = {
            name: name,
            email: email,
            organization: organization,
            alphabet:alphabet,
            content:content,
        }
        const response = await fetch('/api/contact', { 
            method: 'POST',
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
         });
        const j = await response.json();
        if (j.ok){
            const data2 = {
                id: j.id,
                name: name,
                email: email,
                organization: organization,
                alphabet:alphabet,
                content:content,
                sendAt:now
            }
            await setDoc(doc(db,"Contact",now),data2)
            setStatus("問い合わせが登録されました。担当からの連絡をお待ちください。")
        } else {
            setStatus("お問い合わせの取得時にエラーが発生しました。時間をおいて再度送信ください。")
        }
    }

    useEffect(() => {
        console.log(name, email, organization, alphabet, content)
    }, [name])

    return (
        <div className="flex justify-center">
            <div className="flex flex-col w-full px-8 mx-10 lg:mx-32 justify-center gap-2">
            <div className="mt-6 text-center font-bold text-xl">お問い合わせフォーム</div>
            <label className="mt-2 text-sm font-bold">お名前</label>
            <input
            className="rounded-md px-4 py-1 bg-blue-100 border"
            name="name"
            placeholder="担当者名"
            value={name}
            onChange={(e) => setName(e.target.value)}
            />
            <label className="mt-2 text-sm font-bold">emailアドレス</label>
            <input
            className="rounded-md px-4 py-1 bg-blue-100 border"
            name="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            />
            <label className="mt-2 text-sm font-bold">所属（会社・組織名）</label>
            <input
            className="rounded-md px-4 py-1 bg-blue-100 border"
            name="organization"
            placeholder="会社名"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            />
            <label className="mt-2 text-sm font-bold">所属（会社・組織名）のアルファベット（英語）表記</label>
            <input
            className="rounded-md px-4 py-1 bg-blue-100 border"
            name="alphabet"
            placeholder="組織名（英語表記orアルファベット)"
            value={alphabet}
            onChange={(e) => setAlphabet(e.target.value)}
            />

            <label className="mt-2 text-sm font-bold">お問い合わせ内容</label>
            <textarea className="rounded-md px-4 py-1 bg-blue-100 border"
                name="content"
                placeholder="お問い合わせ内容"
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
            <button className="mt-4 border-2 rounded-md w-48 h-8 mx-auto bg-blue-600 hover:bg-blue-800 text-white" onClick={sendMail}>送信</button>
            <div className="mt-2 text-sm text-center">{status}</div>
            </div>
        </div>
    );
}
