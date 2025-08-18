"use client"
import React from "react";
import {useState, useEffect, useRef} from "react"
import { db } from "@/firebase"
import { doc, getDoc, collection, getDocs } from "firebase/firestore"
import { Answer, VoiceData } from "@/types"
import md5 from 'md5';

interface VoiceProps {
    foreign:Answer;
    answer:string;
    voiceNumber:number;
    setIsAudio: (isAudio: boolean ) => void;
}

export default function ListenVoice({foreign, answer, voiceNumber, setIsAudio}:VoiceProps){
    const [language, setLanguage] = useState<string[]>([])
    const [voiceUrlList, setVoiceUrlList] = useState<VoiceData[]>([])
    const audioRef = useRef(null)

    const closeAudio = () => {
        setIsAudio(false)
    }

    const loadVoiceUrl = async () => {
        for (const lang of language){
            const ans = foreign[lang]
            console.log(ans)
            const idWord = `${String(voiceNumber)}-${ans.trim()}`
            const voiceId = `${md5(idWord)}`//voiceIdはtrimした値
            const voiceRef = doc(db, "Voice", voiceId)
            const voiceSnap = await getDoc(voiceRef);
            if (voiceSnap.exists()){
                console.log("existing")
                const data = voiceSnap.data()
                const voiceData = {lang: lang, text: answer, fText: data.answer, url:data.url, duration:data.duration || data.frame, frame:data.frame}
                setVoiceUrlList(prev => [...prev, voiceData])
            }
        }
    }

    useEffect(() => {
        loadVoiceUrl()
    }, [language])

    useEffect(() => {
        const lang = Object.keys(foreign)
        setLanguage(lang)
    }, [foreign])

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-20 flex items-center justify-center z-50">
            <div className="flex flex-col w-96 h-11/12 bg-white p-6 rounded-lg shadow-lg relative ml-auto mr-24 mt-auto mb-24">
            <div className="mb-2 text-center text-sm">{answer}</div>
            {Array.isArray(voiceUrlList) && voiceUrlList.map((ans, index) => (
                <div key={index}>
                <div className="test-sm mt-2">{ans.lang}</div>
                <audio className="mx-auto text-xs" ref={audioRef} controls>
                    <source src={ans.url} type="audio/mp3" />
                    Your browser does not support the audio element.
                </audio>
                </div>
                )
            )}
            <button className="text-xs border-2 w-16 h-6 mt-auto mb-1 mx-auto bg-slate-100" onClick={() => closeAudio()}>閉じる</button>
            </div>
        </div>
    )
}