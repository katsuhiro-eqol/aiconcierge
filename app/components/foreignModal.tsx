"use client"
import React from "react";
import {useState, useEffect} from "react"
import { Answer } from "@/types"

interface ForeignModalProps {
    setIsForeign: (isForeign: boolean ) => void;
    foreignData: Answer;
    answer: string;
}
export default function ForeignModal({setIsForeign, foreignData, answer}:ForeignModalProps){
    const [languages, setLanguages] = useState<string[]>([])

    const closeModal = () => {
        setIsForeign(false)
    }

    useEffect(() => {
        const lang = Object.keys(foreignData)
        setLanguages(lang)
    },[foreignData])

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-20 flex items-center justify-center z-50">
            <div className="flex flex-col w-96 h-2/3 bg-white p-6 rounded-lg shadow-lg relative ml-auto mr-24 mt-auto mb-24 overflow-auto">
                <div className="text-center text-lg font-bold mb-6">外国語の回答</div>
                {Array.isArray(languages) && languages.map((row, index) => {
                    return (<div className="mb-4" key={index}>{row}: {foreignData[row]}</div>)
                } )}


                <button className="text-xs border-2 w-16 h-6 mt-auto mb-1 mx-auto bg-slate-100" onClick={() => closeModal()}>閉じる</button>
            </div>
        </div>
    )
}