"use client"
import React from "react";
import { useState, useEffect, useMemo } from "react";
import { db } from "@/firebase"
import { doc, getDoc } from "firebase/firestore"
import MonthlyBarChart from "@/app/components/monthlyBarChart";
import ConversationHistory from "@/app/components/conversationHistory";
import { ConvData } from "@/types"

type Cursor = { date: string } | null
type DailyCounts = Record<string, number>;

export default function EventInspector(){
    const [events, setEvents] = useState<string[]>([""]) //firestoreから読み込む
    const [event, setEvent] = useState<string>("")
    const [organization, setOrganization] = useState<string>("")
    const [selectedAnalysis, setSelectedAnalysis] = useState<string>("")
    const [dailyCounts, setDailyCounts] = useState<DailyCounts|null>(null)
    
    const buttons = [
        { key: 'conversationHistory', label: '会話閲覧'},
        { key: 'time_series', label: '会話数推移'}
    ]

    const loadEvents = async (org:string) => {
        try {
            const docRef = doc(db, "Users", org)
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data()
                const array1 = [""]
                const array2 = array1.concat(data.events)
                setEvents(array2)
                if (!data.events){
                    alert("イベントが登録されていません")
                }
            } else {
                alert("ログインから始めてください")
            }
        } catch (error) {
            console.log(error)
        }
    }

    const selectEvent = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        setEvent(e.target.value);
        if (e.target.value !== ""){
            const eventId = organization + "_" + e.target.value
            const eventRef = doc(db, "Events", eventId)
            const eventSnap = await getDoc(eventRef)
            const dailycounts = eventSnap.data()?.dailyCounts
            setDailyCounts(dailycounts)
        }
    }

    const selectAnalysis = async (analysis:string) => {
        setSelectedAnalysis(analysis)
    }

    useEffect(() => {
        const org = sessionStorage.getItem("user")
        if (org){
            setOrganization(org)
            loadEvents(org)
        }
    },[])

    return (
        <div>
            <div className="font-bold text-xl">会話応答分析：{event}</div>
            <div className="text-base mt-5">イベントを選択</div>
            <select className="mb-8 w-96 h-8 text-center border-2 border-lime-600" value={event} onChange={selectEvent}>
            {events.map((name) => {
            return <option key={name} value={name}>{name}</option>;
            })}
            </select>
            <div className="flex flex-row gap-x-4 mb-10">
            {buttons.map((button) => (
                <div key={button.key} onClick={() => selectAnalysis(button.key)}>
                    {(selectedAnalysis === button.key) ? (
                        <button className="w-36 h-8 mt-2 px-2 border-2 text-sm bg-gray-500 hover:bg-gray-600 text-white">{button.label}</button>
                    ):(
                        <button className="w-36 h-8 mt-2 px-2 border-2 text-sm bg-gray-100 hover:bg-gray-200 text-black">{button.label}</button>
                    )}
                </div>
            ))}
            </div>

            {(selectedAnalysis === "conversationHistory") && dailyCounts && (
                <ConversationHistory organization={organization} event={event} dailyCounts={dailyCounts} />
            )}
            {(selectedAnalysis ==="time_series") && (
                <div>
                {dailyCounts && (
                    <MonthlyBarChart dailyCounts={dailyCounts} />
                )}
                </div>
            )}
        </div>
    )
}

/*
            <div>
            <nav className="flex items-center gap-2">
                {pages.map((p) => (
                <button
                    key={p}
                    onClick={() => loadPage(p)}
                    disabled={p === page}
                    className={`text-xs my-1 px-3 py-1 rounded border ${
                    p === page ? "bg-black text-white" : ""
                    }`}
                >
                    {p}
                </button>
                ))}
            </nav>
            <div className="my-3 text-sm">1スレッドあたりの平均会話数：　{(convCount/10).toFixed(1)}</div>
            <table className="w-full border border-gray-300">
                <thead>
                <tr className="bg-gray-100">
                    {columns.map((column) => (
                    <th 
                        key={column.key}
                        className="border border-gray-300 px-2 py-1 text-left font-medium text-gray-700 text-sm"
                    >
                        {column.label}
                    </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                    {convData.map(conv => (
                        <tr key={conv.id} className={`border border-gray-300 ${conv.unanswerable ? "bg-yellow-200" : "bg-slate-100"} ${conv.publicInformation && "bg-green-200"}`}>
                            <td className="border border-gray-300 text-xs px-1">{conv.id}</td>
                            <td className="border border-gray-300 text-xs px-1">{conv.deviceId.slice(0,10)}</td>
                            <td className="border border-gray-300 text-xs px-1">{conv.userNumber}</td>
                            <td className="border border-gray-300 text-xs px-1">{conv.language}</td>
                            <td className="border border-gray-300 text-xs px-1">{conv.user}</td>
                            <td className="border border-gray-300 text-xs px-1">{conv.aicon}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
            */
/*
    const buttons = [
        { key: 'all', label: '会話閲覧'},
        { key: 'unanswerable', label: '回答不能質問'},
        { key: 'public_information', label: '公開情報回答'},
        { key: 'time_series', label: '会話数推移'}
    ]
{(selectedAnalysis ==="unanswerable") && (<div className="text-red-500">Under Construction</div>)}
{(selectedAnalysis ==="public_information") && (<div className="text-red-500">Under Construction</div>)}
*/