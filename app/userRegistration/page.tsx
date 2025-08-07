"use client"
import React from "react";
import { useState, useEffect, useCallback, KeyboardEvent } from "react";
import { db } from "@/firebase"
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore"
import { useRouter } from 'next/navigation'

export default function UserRegistration() {
    const [organization, setOrganization] = useState<string>("")
    const [alphabet, setAlphabet] = useState<string>("")
    const [name, setName] = useState<string>("")
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [password2, setPassword2] = useState<string>("")
    const [status, setStatus] = useState<string>("ユーザー登録は完了していません")
    const router = useRouter()

    const login = async() => {
        
        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                //body: JSON.stringify({ input: userInput, character: character, fewShot: fewShot, previousData: previousData, sca: scaList[character] }),
                body: JSON.stringify({ organization: alphabet, password: password}),
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

    const validationInput = async () => {
        if (organization !== "" && alphabet !== "" && name !== "" && email !== ""){
            if (containsInvalidCharacters(alphabet)){
                alert("会社（組織）名のアルファベット入力にエラーがあります")
            } else if (validateEmail(email)){
                if (validatePassword()){
                    try {
                        await registrationTentativeUser()
                        login()
                    } catch {
                        alert("ユーザー登録時にエラーが発生しました")
                    }
                    
                }               
            } else {
                alert("emailアドレスの記載に誤りがあります")
            }
        } else {
            alert("未入力項目があります")
        }
    }

    const registrationTentativeUser = async() => {
        const collectionUsers = collection(db, "Users")
        const querySnapshot = await getDocs(collectionUsers);
        querySnapshot.forEach((doc) => {
            if (doc.data().email === email) {
                alert("このメールアドレスは既に使用されています")
                return null
            }
        })
        const userRef = doc(db, "Users", alphabet)
        const userSnap = await getDoc(userRef)
        if (userSnap.exists()){
            alert("既にこの会社名(alphabet)で登録されています")
            return
        } else {
            const date = new Date()
            const offset = date.getTimezoneOffset() * 60000
            const localDate = new Date(date.getTime() - offset)
            const now = localDate.toISOString()
            const data = {
                organization: organization,
                alphabet:alphabet,
                manager:name,
                email:email,
                password:password,
                createdAt:now,
                plan:"tentative"
            }
            const docRef = doc(db, "Users", alphabet)
            setDoc(docRef, data, {merge:false})
            setStatus("ユーザー登録が完了しました")
        }

    }

    const validateEmail = (text:string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(text);
    };

    const validatePassword = () => {
        const hasNumber = /\d/.test(password)
        const hasUpper = /[A-Z]/.test(password)
        const hasLower = /[a-z]/.test(password)
        if (password.length < 8){
            alert("パスワード文字数が足りません")
            return false
        } else if (hasNumber && hasUpper && hasLower) {
            if (password !== password2){
                alert("再入力パスワードが一致しません")
                return false
            } else {
                return true
            }
        } else {
            alert("パスワードに必要な文字種が含まれていません")
            return false
        }
    }

    const containsInvalidCharacters = (input:string) => {
        // 正規表現で指定した文字種以外の文字が含まれているかチェック
        const invalidCharacters = new RegExp("a-zA-Z0-9");
        return invalidCharacters.test(input);
    }


    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {

        }
    }, []);
    
    useEffect(() => {
    }, [status])

    return (
        <div className="flex justify-center">
            <div className="flex flex-col w-full px-8 lg:max-w-lg justify-center gap-2">
            <div className="mt-10 text-center font-bold text-xl">ユーザー登録</div>
            <div className="mt-2 text-sm text-blue-700">(*)オリジナルデータでシステム構築するにはユーザー登録が必要です</div>
            <label className="mt-2 text-sm font-bold">
            会社名（組織名）
            </label>
            <input
            className="rounded-md px-4 py-1 bg-blue-100 border mb-1"
            name="organization"
            placeholder="会社名"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            />
            <label className="mt-2 text-sm font-bold">
            組織（会社名）アルファベット（英語）表記
            </label>
            <input
            className="rounded-md px-4 py-1 bg-blue-100 border mb-1"
            name="alphabet"
            placeholder="組織名（英語表記orアルファベット)"
            value={alphabet}
            onChange={(e) => setAlphabet(e.target.value)}
            />
            <label className="mt-2 text-sm font-bold">
            担当者名
            </label>
            <input
            className="rounded-md px-4 py-1 bg-blue-100 border mb-1"
            name="name"
            placeholder="担当者名"
            value={name}
            onChange={(e) => setName(e.target.value)}
            />
            <label className="mt-2 text-sm font-bold">
            emailアドレス
            </label>
            <input
            className="rounded-md px-4 py-1 bg-blue-100 border mb-1"
            name="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            />
            <label className="mt-2 text-sm font-bold">
            パスワード<span className="ml-2 text-xs text-red-500">(アルファベット大文字/小文字/数字を含む8文字以上)</span>
            </label>
            <input
            className="rounded-md px-4 py-1 bg-blue-100 border mb-1"
            name="password"
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            />
            <label className="mt-2 text-sm font-bold">
            パスワード（再入力）
            </label>
            <input
            className="rounded-md px-4 py-1 bg-blue-100 border mb-1"
            name="password"
            type="password"
            placeholder="password"
            value={password2}
            onKeyDown={handleKeyDown}
            onChange={(e) => setPassword2(e.target.value)}
            />
            <button className="mt-6 border-2 rounded-md w-48 h-8 mx-auto bg-blue-600 hover:bg-blue-800 text-white" onClick={() => validationInput()}>ユーザー登録する</button>
            <div className="mt-2 text-sm text-center">{status}</div>
            </div>
        </div>
    );
}