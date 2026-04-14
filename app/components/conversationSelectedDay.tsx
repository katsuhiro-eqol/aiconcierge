"use client"
import React from "react";
import { useState, useEffect, useMemo } from "react";
import { db } from "@/firebase"
import { doc, getDoc, collection, query, getDocs, orderBy, limit, getCountFromServer, startAfter, setDoc, where } from "firebase/firestore"
import { ConvData } from "@/types"

type Cursor = { date: string } | null
type Props = {
    organization:string;
    event:string;
    year:number;
    month:number;
    day:number;
  };

export default function ConversationSelectedDay({organization, event, year, month, day}: Props){
    const [convData, setConvData] = useState<ConvData[]>([])
    //const [totalCount, setTotalCount] = useState<number>(0)
    const [totalPages, setTotalPages] = useState<number>(1)
    const [page, setPage] = useState<number>(1)
    const [cursors, setCursors] = useState<Cursor[]>([])
    //const [totalConvCount, setTotalConvCount] = useState<number>(0)

    const PAGE_SIZE = 10
    
    const columns = [
        { key: 'id', label: 'id' },
        { key: 'deviceId', label: 'deviceId' },
        { key: 'user', label: 'user' },
        { key: 'lamguage', label: 'language' },
        { key: 'question', label: 'question' },
        { key: 'answer', label: 'answer' }
    ]

    const convStart = (year:number, month:number, day:number) => {
        const td = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2,"0")}T04:00:00`
        return td
    }

    const convEnd = (year:number, month:number, day:number) => {
        const dt = new Date(Date.UTC(year, month - 1, day));
        dt.setUTCDate(dt.getUTCDate() + 1);
        const yy = dt.getUTCFullYear();
        const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
        const dd = String(dt.getUTCDate()).padStart(2, "0");
        return `${yy}-${mm}-${dd}T04:00:00`;
    }

    const loadConvData2 = async (organization:string, event:string, year:number, month:number, day:number, page:number) => {
        const knownPrevCursor = page > 1 ? cursors[page - 2] : null
        //cursorsに記録された最後のindexをbasseIndexとする
        let baseIndex = -1
        if (!knownPrevCursor && page > 1) {
            for (let i = page - 2; i >= 0; i--) {
              if (cursors[i]) {
                baseIndex = i; // i は「ページ(i+1)の最後尾カーソル」
                break;
              }
            }
        }

        let currentPage = baseIndex + 2; // cursorを取得するための変数。初期値がこれ
        let lastCursor = baseIndex >= 0 ? cursors[baseIndex]! : null;
        const nextCursors = [...cursors];
        
        //目標ページの前ページまでのcursor(最後のdate情報)を取得する
        const eventId = organization + "_" + event
        const convRef = collection(db,"Events",eventId, "Conversation")
        const start = convStart(year,month,day)
        const end = convEnd(year,month,day)
        console.log(start, end)
        let q = query(
            convRef,
            where("date", ">=", start),
            where("date", "<", end),
            orderBy("date"),
            limit(PAGE_SIZE)
        )

        while (currentPage <= page) {
            if (currentPage > 1){
                if (!lastCursor){
                    throw new Error("Missing cursor while walking pages")
                }
                q = query(
                    convRef,
                    where("date", ">=", start),
                    where("date", "<", end),
                    orderBy("date"),
                    startAfter(lastCursor.date),
                    limit(PAGE_SIZE)
                );
            }
            const querySnapshot = await getDocs(q)
            const lastDoc = querySnapshot.docs.at(-1);
            const pageCursor:Cursor = lastDoc ? {date: lastDoc!.data().date} : null
            nextCursors[currentPage - 1] = pageCursor

            if (currentPage === page){
                const rows: ConvData[] = []
                let userNumber = (page-1)*10 +1
                querySnapshot.forEach((doc) => {
                    const data = doc.data()
                    const conversations = data.conversations
                    if (Array.isArray(conversations)){
                        conversations.forEach((c) => {
                            //id: c.id.replace(/T/g, '\n'),
                            const con:ConvData = {
                                id: convertDate(c.id),
                                userNumber:`user-${userNumber}`,
                                language:data.language,
                                user:c.user,
                                aicon: c.aicon,
                                unanswerable:c.unanswerable,
                                publicInformation:c.publicInformation ?? false,
                                deviceId:c.deviceId ?? ""
                            }
                            rows.push(con)
                        })
                    }
                    userNumber++
                })
                setConvData(rows)
                console.log("conv count", rows.length)
            }
            lastCursor = pageCursor;
            currentPage++;
        }
        setCursors(nextCursors)
    }    

    const randomStr = (length: number) => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    const convertDate = (date:string) => {
        const day = date.split("T")[0]
        const time = date.split("T")[1].split(".")[0]

        const cDate = `${day} ${time}/${randomStr(4)}`
        return cDate
    }

    const pages = useMemo(() => {
        if (totalPages>20) return Array.from({ length: 20 }, (_, i) => i + 1);
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }, [totalPages]);

    const loadPage = (page:number) => {
        setPage(page)
        void loadConvData2(organization, event, year, month, day, page)
    }

    /*
    useEffect(() => {
        if (!organization || !event) {
            setTotalCount(0);
            setTotalPages(1);
            return;
        }
    }, [organization, event, year, month]);
    */

    useEffect(() => {
        if (!organization || !event) return;
        void loadConvData2(organization, event, year, month, day, page);
    }, [organization, event, year, month, page]);

    return (
        <div>
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
                            <td className="border border-gray-300 text-xs px-1">{conv.id.split("/")[0]}</td>
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
        </div>
    )
}
