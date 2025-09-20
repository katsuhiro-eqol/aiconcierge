"use client"
import React from "react";
import { useState, useEffect } from "react";
import { db } from "@/firebase"
import { doc, getDoc, collection, query, getDocs, orderBy, limit, deleteDoc, getCountFromServer, startAfter, setDoc, where } from "firebase/firestore"
import { ConvData, ForeignAnswer } from "@/types"
import { constants } from "fs";

type Cursor = { date: string; id: string } | null


export default function EventInspector(){
    const [events, setEvents] = useState<string[]>([""]) //firestoreから読み込む
    const [event, setEvent] = useState<string>("")
    const [organization, setOrganization] = useState<string>("")
    const [convData, setConvData] = useState<ConvData[]>([])
    const [totalCount, setTotalCount] = useState<number>(0)
    const [totalPages, setTotalPages] = useState<number>(1)
    const [page, setPage] = useState<number>(1)
    const [cursors, setCursors] = useState<Cursor[]>([])
    const [selectedConvs, setSelectedConvs] = useState<ConvData[]>([])
    const [selectedAnalysis, setSelectedAnalysis] = useState<string>("")
    const [unanswerable, setUnanswerable] = useState<ForeignAnswer>({})

    const PAGE_SIZE = 10
    
    const columns = [
        { key: 'id', label: 'id' },
        { key: 'userNumber', label: 'userNumber' },
        { key: 'lamguage', label: 'language' },
        { key: 'question', label: 'question' },
        { key: 'answer', label: 'answer' }
    ]

    const buttons = [
        { key: 'all', label: '全会話閲覧'},
        { key: 'unanswerable', label: '回答不能質問'},
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

    const loadConvData = async (event:string, page:number) => {
        try {
            const eventId = organization + "_" + event
            const convRef = collection(db,"Events",eventId, "Conversation")
            let q = query(convRef, orderBy("date", "desc"), limit(PAGE_SIZE))

                // 2ページ目以降は直前ページの「最後尾」から開始
            if (page > 1) {
                const prevCursor = cursors[page - 2];
                if (prevCursor) {
                q = query(
                    convRef,
                    orderBy("date", "desc"),
                    startAfter(prevCursor.date, prevCursor.id),
                    limit(PAGE_SIZE)
                );
                }
            }

            const querySnapshot = await getDocs(q)
            const rows: ConvData[] = []
            let userNumber = 1
            querySnapshot.forEach((doc) => {
                const data = doc.data()
                const conversations = data.conversations
                if (Array.isArray(conversations)){
                    conversations.forEach((c) => {

                        const con:ConvData = {
                            id: c.id.replace(/T/g, '\n'),
                            userNumber:`user-${userNumber}`,
                            language:data.language,
                            user:c.user,
                            aicon: c.aicon,
                            unanswerable:judgeUnanswerable(c.aicon, data.language)
                        }
                        rows.push(con)
                    })
                }
                userNumber++
            })
            setConvData(rows)
        } catch {
            alert("データのロード時にエラーが発生しました")
        }
            
    }

    //回答不能時の応答をロード
    const loadUnanswerable = async (event:string) => {
        const eventId = organization + "_" + event
        const docRef = doc(db,"Events",eventId, "QADB", "2")
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
            const data = docSnap.data()
            setUnanswerable(data.foreign)
        }
    }
    //回答不能か否かの判定
    const judgeUnanswerable = (answer:string, language:string) => {
        const ans = answer.trim().replace("公開情報","")
        if (ans === unanswerable[language]){
            return true
        } else {
            return false
        }
    }

    const selectEvent = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        setEvent(e.target.value);
        setSelectedConvs([])
        if (e.target.value !== ""){
            const eventId = organization + "_" + e.target.value
            const convRef = collection(db,"Events", eventId, "Conversation")
            const snapshot = await getCountFromServer(query(convRef))
            const total = snapshot.data().count
            setTotalCount(total)
            setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)))
            await loadUnanswerable(e.target.value)
            if (selectedAnalysis === "all"){
                await loadConvData(e.target.value, 1)
            }
        }
    }

    const selectAnalysis = async (analysis:string) => {
        setSelectedAnalysis(analysis)
        if (analysis === "all" && event !== ""){
            await loadConvData(event, 1)
        }

    }

    const convertDate = (date:string) => {
        const day = date.split("T")[0]
        const time = date.split("T")[1].split(":")
        const cDate = `${day} ${time[0]}:${time[1]}`
        return cDate
    }

    const similarityToString = (similarity:number) => {
        const sim = Math.floor(similarity*1000)/1000
        return sim.toString()
    }

    useEffect(() => {
        console.log(selectedConvs)
    }, [selectedConvs])


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
            <div className="text-sm text-red-500">2025/9以降に作成したイベントのみ分析対象</div>
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
            <button onClick={() => loadConvData(event, 1)} className="w-36 h-8 mb-6 px-2 border-2 text-sm bg-green-500 hover:bg-green-600 text-white">データをロード</button>
            <div>全会話スレッド(user)数：　{totalCount}</div>
            {(selectedAnalysis === "all") && (
            <div>
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
                        <tr key={conv.id}>
                            <td className="text-xs px-1">{conv.id}</td>
                            <td className="text-xs px-1">{conv.userNumber}</td>
                            <td className="text-xs px-1">{conv.language}</td>
                            <td className="text-xs px-1">{conv.user}</td>
                            <td className="text-xs px-1">{conv.aicon}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
            )}
            {(selectedAnalysis ==="FAQ") && (<div className="text-red-500">Under Construction</div>)}
            {(selectedAnalysis ==="time_series") && (<div className="text-red-500">Under Construction</div>)}
        </div>
    )
}