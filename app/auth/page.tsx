"use client"
import React from "react";
import { useState, useRef, useCallback, KeyboardEvent } from "react";
import { useRouter } from 'next/navigation';

export default function AUTH() {
    const [organization, setOrganization] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const organizationRef = useRef("")
    const passwordRef = useRef("")
    const router = useRouter()

    const handleOrganizationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      organizationRef.current = e.target.value;
      setOrganization(e.target.value); // 表示用にstateも更新
    };
    
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      passwordRef.current = e.target.value;
      setPassword(e.target.value);
    };

    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        login()
      }
    }, []);

    const login = async() => {
        const organizationValue = organizationRef.current
        const passwordValue = passwordRef.current
        console.log(organizationValue)
        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                //body: JSON.stringify({ input: userInput, character: character, fewShot: fewShot, previousData: previousData, sca: scaList[character] }),
                body: JSON.stringify({ organization: organizationValue, password: passwordValue}),
              });
              const data = await response.json()
              console.log(data)
              if (data.success){
                sessionStorage.setItem("user", data.user)
                router.push("/user")
              } else {
                alert('認証に失敗しました');
              }
        } catch (error){
            console.log(error)
            alert("認証エラー")
        }
    }

  return (
    <div className="flex justify-center">
        <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
        <div className="py-14 font-bold text-xl">ログイン画面</div>
        <label className="text-sm font-bold">
        会社名（組織名）　アルファベット表記
        </label>
        <input
        className="rounded-md px-4 py-2 bg-inherit border mb-6"
        name="organization"
        placeholder="会社名"
        value={organization}
        onChange={(e) => handleOrganizationChange(e)}
        />
        <label className="text-sm font-bold">
        Password
        </label>
        <input
        className="rounded-md px-4 py-2 bg-inherit border mb-6"
        type="password"
        name="password"
        placeholder="••••••••"
        value={password}
        onKeyDown={handleKeyDown}
        onChange={(e) => handlePasswordChange(e)}
        />

        <br />
        <button className="p-2 border-2 rounded-lg bg-blue-600 hover:bg-blue-800 text-white" onClick={() => login()}>login</button>
        <br />
        </div>
    </div>
  );
}

/*
        <a href="/inboundSite/contact" className="text-center text-blue-500 hover:text-blue-700">ユーザー登録はお問い合わせページから</a>
"use client"
import React from "react";
import { useState, useEffect, useRef } from "react";
import REGISTER_CSV from "../components/registerCSV";
import {db} from "@/firebase"
import { collection, query, where, getDocs} from "firebase/firestore"
import Link from "next/link";


export default function AUTH() {
    const [organization, setOrganization] = useState<string>("")
    const [event, setEvent] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [embeddingModel, setEmbeddingModel] = useState<string>("text-embedding-3-small")
    const [auth, setAuth] = useState<boolean>(false)

    const login = async() => {
        console.log(organization, event, password)
        try {
            const q = query(collection(db,"Setting"), where("organization", "==", organization), where("event", "==", event), where("password", "==", password))
            const querySnapshot = await getDocs(q)
            if (querySnapshot.docs.length != 0){
                const data = querySnapshot.docs[0].data()
                console.log(data)
                setEmbeddingModel(data.embedding_model)
                setAuth(true)
            } else {
                alert("認証できませんでした")
            }
        } catch (error){
            alert("認証エラー")
        }
    }

    useEffect(() => {
        console.log(auth)
    }, [auth])

  return (
    <div className="flex justify-center">
    {auth ? (
        <div className="w-full">
            <REGISTER_CSV organization={organization} event={event} model={embeddingModel} />
        </div>
    ):(
        <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
        <div className="py-14 font-bold text-xl">ログイン画面</div>
        <label className="text-md" htmlFor="email">
        会社名（組織名）
        </label>
        <input
        className="rounded-md px-4 py-2 bg-inherit border mb-6"
        name="organization"
        placeholder="会社名"
        value={organization}
        onChange={(e) => setOrganization(e.target.value)}
        />
        <label className="text-md" htmlFor="email">
        イベント名
        </label>
        <input
        className="rounded-md px-4 py-2 bg-inherit border mb-6"
        name="event"
        placeholder="イベント名"
        value={event}
        onChange={(e) => setEvent(e.target.value)}
        />
        <label className="text-md" htmlFor="password">
        Password
        </label>
        <input
        className="rounded-md px-4 py-2 bg-inherit border mb-6"
        type="password"
        name="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        />

        <br />
        <button className="border-2" onClick={() => login()}>login</button>
        <br />
        </div>
    )}   
    </div>
  );
}
  */