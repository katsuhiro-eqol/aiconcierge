"use client"
import React from "react";
import { useState, useEffect } from "react";
import { db } from "@/firebase"
import { doc, getDoc, collection, setDoc, updateDoc, arrayUnion } from "firebase/firestore"
import { Circle, CircleDot } from 'lucide-react'
import { Image } from "@/types"
import UIOption from "../../components/uiOption"

export default function CreateEvent2(){
    const [newEvent, setNewEvent] = useState<string>("")
    const [organization, setOrganization] = useState<string>("")
    const [events, setEvents] = useState<string[]>([])
    const [voiceSetting, setVoiceSetting] = useState<string>("音声入力／AIボイスなし")
    const [comment, setComment] = useState<string>("")
    const [selectedOptions, setSelectedOptions] = useState<string[]>(["日本語"]);
    const [role, setRole] = useState<string>("")
    const [address, setAddress] = useState<string>("")
    //const [referenceUrl, setReferenceUrl] = useState<string[]>([])
    const [other, setOther] = useState<string>("")//他言語
    const [uiOption, setUiOption] = useState<Image[]>([])
    const [image, setImage] = useState<Image>({name:"AI-con_woman_01.png", url:"/AI-con_woman_01.png"})
    const options = ["英語", "中国語（簡体）", "中国語（繁体）", "韓国語"];
    const otherOptions = ["その他","フランス語","ポルトガル語","スペイン語"]
    const voiceSettingOptions = ["音声入力／AIボイスなし", "音声入力／AIボイスあり"]
    const model = "text-embedding-3-small" //embeddingモデル
    const gpt = "gpt-4o-mini"

    const loadEvents = async (org:string) => {
        try {           
            const docRef = doc(db, "Users", org)
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data()
                setEvents(data.events)
                setUiOption(data.uiImages)
            } else {
                alert("ログインから始めてください")
            }
        } catch (error) {
            console.log(error)
        }
    }

    const judgeNewEvent = () => {
        if (!newEvent){
            alert("イベント名が記入されていません")
            return false
        } else if (!events){
            return true
        } else if (events.includes(newEvent)){
            alert("既に同じ名前のイベントが登録されています")
            return false
        } else if (role === "") {
            alert("AIの役割が入力されていません")
        } else if (address === "") {
            alert("拠点住所が入力されていまえん")
        } else {
            return true
        }
    }

    const randomStr = (length: number) => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    const registerEvent = async () => {
        const judge = judgeNewEvent()
        const code = randomStr(4)
        const prompt = 
        `あなたは${role}です。会話履歴も含めて質問意図を読み取り、以下の流れで回答してください。
-参照QA情報が回答として適切な場合は、その回答を採用し、参照したidを取得。
-質問意図と一致しない、または回答として不十分な場合は、参照QAと公知情報を使って100文字以内で簡潔に回答してください。idは空文字。
- ["回答","id"]の**JSON配列**のみ、をアウトプットしてください。余計な文字や改行・説明は禁止。
`

        if (judge){
            try {
            const id = organization + "_" + newEvent
            let voiceNumber = 1
            // woman:1, man:2
            if (image.name.includes("woman")){
                voiceNumber = 1
            } else {
                voiceNumber = 2
            }
            const data = {
                organization: organization,
                event: newEvent,
                image: image,
                languages: selectedOptions,
                embedding: model,
                qaData: false,
                code: code,
                voiceSetting:voiceSetting,
                voiceNumber: voiceNumber,
                prompt:prompt,
                gpt:gpt,
                role:role,
                address:address,
                counter:0
            }
            
                const eventRef = collection(db, "Events")
                await setDoc(doc(eventRef, id), data)
        
                const usersRef = collection(db, "Users")
                await updateDoc(doc(usersRef, organization), {events: arrayUnion(newEvent)})
                setComment("イベント新規登録が完了しました")
            } catch (error) {
                console.log(error)
                setComment("イベント新規登録時にエラーが発生しました")
        }
        } else {

        }
    }

    const handleOptionClick = (option: string) => {
        setSelectedOptions((prev) => {
        if (prev.includes(option)) {
            return prev.filter((item) => item !== option);
        } else {
            return [...prev, option];
        }
        });
    };

    const selectOtherLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (e.target.value == "その他"){
            return
        }
        setSelectedOptions((prev) => {
            if (prev.includes(e.target.value)) {
                // すでに選択されている場合は削除
                return prev.filter((item) => item !== e.target.value);
            } else {
                // 選択されていない場合は追加
                return [...prev, e.target.value];
            }
        })
    }

    const pageReload = () => {
        window.location.reload()
    }

    useEffect(() => {
        if (typeof window !== 'undefined') {
            //const value = sessionStorage.getItem('user');
            const org = sessionStorage.getItem("user")
            if (org){
                setOrganization(org)
                loadEvents(org)
            }
          }
    }, [])

    return (
        <div>
            <div>
            <div className="font-bold text-xl my-3">イベントの新規作成</div>
            <div className="text-base font-semibold text-gray-700">・ステップ１: イベント名を入力</div>
            <input className="w-2/3 rounded-md px-4 py-2 bg-inherit border mt-2 mb-6 border-lime-600"
                name="event"
                placeholder="新規イベント名"
                value={newEvent}
                onChange={(e) => setNewEvent(e.target.value)}
                />
            </div>
            <div className="text-base font-semibold text-gray-700">・ステップ２: イベント基本設定</div>

            <div>
            <div className="font-semibold text-sm ml-3 mt-5 underline">対応言語（日本語はデフォルト）</div>
            <div className="flex flex-row gap-x-4">
            {options.map((option) => (
                <div
                key={option}
                className="flex items-center mb-2 cursor-pointer hover:bg-gray-100 p-3 rounded"
                onClick={() => handleOptionClick(option)}
                >
                {/* 選択されている場合は CircleDot、それ以外は Circle を表示 */}
                {selectedOptions.includes(option) ? <CircleDot className="w-4 h-4 text-blue-500" /> : <Circle className="w-4 h-4 text-gray-400" />}
                <span className="ml-2 text-gray-700 text-sm">{option}</span>
                </div>
            ))}
            <select className="mx-8 my-3 w-20 h-4 text-xs text-center" value={other} onChange={selectOtherLanguage}>
            {otherOptions.map((name) => {
            return <option key={name} value={name}>{name}</option>;
            })}
            </select>
            </div>

            <div className="w-2/3 ml-3 mt-1 p-2 bg-gray-100 rounded">
            <p className="text-sm text-gray-600">
                選択した言語: {selectedOptions.join(', ') || 'None'}
                </p>
            </div>

            <div className="font-semibold text-sm ml-3 mt-8 underline">音声入力／AIボイス設定</div>
            <div className="flex flex-row gap-x-4">
                {voiceSettingOptions.map((item) => (
                    <div
                    key={item}
                    className="flex items-center mb-2 cursor-pointer hover:bg-gray-200 p-2 rounded"
                    onClick={() => setVoiceSetting(item)}
                    >
                    {(voiceSetting === item) ? <CircleDot className="w-4 h-4 text-blue-500" /> : <Circle className="w-4 h-4 text-gray-400" />}
                    <span className="ml-2 text-gray-700 text-sm">{item}</span>
                </div>
                ))}
            </div>
            <div className="font-semibold mt-3 text-sm ml-3 underline">キャラクター画像</div>
            <UIOption uiOption={uiOption} setImage={setImage} organization={organization} setUiOption={setUiOption} />
            <div className="font-semibold text-sm ml-3 mt-8 underline">AIの役割</div>
            <input className="w-2/3 rounded-md px-4 py-2 bg-inherit border mt-2 mb-6 border-lime-600"
                name="event"
                placeholder="（例）ホテルメトロポリタン池袋のコンシェルジュ"
                value={role}
                onChange={(e) => setRole(e.target.value)}
            />
            <div className="font-semibold text-sm ml-3 mt-8 underline">サービス拠点住所</div>
            <input className="w-2/3 rounded-md px-4 py-2 bg-inherit border mt-2 mb-6 border-lime-600"
                name="event"
                placeholder="（例）東京都豊島区西池袋1-6-1"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
            />
            </div>
            <div className="flex flex-row gap-x-4">
            <button className="h-10 mt-10 px-2 border-2 rounded" onClick={pageReload}>キャンセル</button>
            <button className="h-10 mt-10 px-2 border-2 bg-amber-200 rounded hover:bg-amber-300" onClick={() => registerEvent()} >新規イベント登録</button>
            </div>
            <div className="text-green-500 font-semibold mt-3">{comment}</div>
        </div>
    )
}
