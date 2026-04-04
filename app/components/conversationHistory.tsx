"use client"
import React from "react";
import { useState, useEffect, useMemo } from "react";
import { db } from "@/firebase"
import { doc, getDoc, collection, query, getDocs, orderBy, limit, getCountFromServer, startAfter, setDoc, where } from "firebase/firestore"
import { ConvData } from "@/types"

type Cursor = { date: string } | null
type DailyCounts = Record<string, number>;
type Props = {
    dailyCounts: DailyCounts;
    organization:string;
    event:string;
  };

export default function ConversationHistory({dailyCounts, organization, event}: Props){
    const now = new Date();
    const defaultYear = now.getFullYear();
    const defaultMonth = now.getMonth() + 1;

    const [year, setYear] = useState(defaultYear);
    const [month, setMonth] = useState(defaultMonth);

    const [convData, setConvData] = useState<ConvData[]>([])
    const [totalCount, setTotalCount] = useState<number>(0)
    const [totalPages, setTotalPages] = useState<number>(1)
    const [page, setPage] = useState<number>(1)
    const [cursors, setCursors] = useState<Cursor[]>([])
    const [totalConvCount, setTotalConvCount] = useState<number>(0)

    const yearOptions = useMemo(() => {
        const fromKeys = Object.keys(dailyCounts)
          .map((k) => Number(k.slice(0, 4)))
          .filter((y) => Number.isFinite(y) && y >= 2000 && y <= 2100);
        const min = fromKeys.length
          ? Math.min(...fromKeys, defaultYear - 3)
          : defaultYear - 3;
        const max = fromKeys.length
          ? Math.max(...fromKeys, defaultYear + 1)
          : defaultYear + 1;
        const list: number[] = [];
        for (let y = min; y <= max; y++) list.push(y);
        return list;
      }, [dailyCounts, defaultYear]);

    const PAGE_SIZE = 10
    
    const columns = [
        { key: 'id', label: 'id' },
        { key: 'deviceId', label: 'deviceId' },
        { key: 'user', label: 'user' },
        { key: 'lamguage', label: 'language' },
        { key: 'question', label: 'question' },
        { key: 'answer', label: 'answer' }
    ]

    const monthStart = (year:number, month:number) => {
        const start = `${year}-${String(month).padStart(2, "0")}-01T04:00:00`
        return start
    }

    const monthEnd = (year:number, month:number) => {
        let end:string = ""
        if (month != 12){
            end = `${year}-${String(month+1).padStart(2, "0")}-01T04:00:00`
        } else {
            end = `${year+1}-01-01T04:00:00`
        }
        return end
    }

    const fetchMonthConversationCount = async (
        organization: string,
        event: string,
        year: number,
        month: number,
        dailyCounts: DailyCounts
    ): Promise<void> => {
        if (!organization || !event) {
            setTotalCount(0);
            setTotalPages(1);
            return;
        }

        const monthStr = String(month).padStart(2, "0");
        const prefix = `${year}-${monthStr}-`;
      
        let totalConv = 0;
      
        for (const [date, count] of Object.entries(dailyCounts)) {
          if (date.startsWith(prefix)) {
            totalConv += count;
          }
        }
        setTotalConvCount(totalConv)

        const eventId = organization + "_" + event;
        const convRef = collection(db, "Events", eventId, "Conversation");
        const start = monthStart(year, month);
        const end = monthEnd(year, month);
        const countQ = query(
            convRef,
            where("date", ">=", start),
            where("date", "<", end),
            orderBy("date")
        );
        const snapshot = await getCountFromServer(countQ);
        const total = snapshot.data().count;
        setTotalCount(total);
        setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
    };

    const loadConvData2 = async (organization:string, event:string, year:number, month:number, page:number) => {
        //cursorsに前pageの情報があるかどうか確認し、なければ生成する

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
        const start = monthStart(year,month)
        const end = monthEnd(year,month)
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

    const convertDate = (date:string) => {
        const day = date.split("T")[0]
        const time = date.split("T")[1].split(".")[0]

        const cDate = `${day} ${time}`
        return cDate
    }

    const pages = useMemo(() => {
        if (totalPages>20) return Array.from({ length: 20 }, (_, i) => i + 1);
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }, [totalPages]);

    const loadPage = (page:number) => {
        setPage(page)
        void loadConvData2(organization, event, year, month, page)
    }

    useEffect(() => {
        if (!organization || !event) {
            setTotalCount(0);
            setTotalPages(1);
            return;
        }
        void fetchMonthConversationCount(organization, event, year, month, dailyCounts);
    }, [organization, event, year, month]);

    useEffect(() => {
        if (!organization || !event) return;
        void loadConvData2(organization, event, year, month, page);
    }, [organization, event, year, month, page]);

    return (
        <div>
            <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <span className="whitespace-nowrap">年</span>
          <select
            className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={year}
            onChange={(e) => {
              setYear(Number(e.target.value));
              setPage(1);
              setCursors([]);
            }}
            aria-label="表示する年"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}年
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <span className="whitespace-nowrap">月</span>
          <select
            className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={month}
            onChange={(e) => {
              setMonth(Number(e.target.value));
              setPage(1);
              setCursors([]);
            }}
            aria-label="表示する月"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {m}月
              </option>
            ))}
          </select>
        </label>
      </div>
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
            <div className="my-2 text-sm text-gray-700">
              対象月の会話スレッド数：{totalCount}（{totalPages}ページ）  対象月の全アクセス（会話）数：{totalConvCount}
            </div>
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
        </div>
    )
}


    /*
    const loadConvData = async (event:string, page:number) => {
        //cursorsに前pageの情報があるかどうか確認し、なければ生成する
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
        let q = query(convRef, orderBy("date", "desc"), limit(PAGE_SIZE))

        while (currentPage <= page) {
            if (currentPage > 1){
                if (!lastCursor){
                    throw new Error("Missing cursor while walking pages")
                }
                q = query(
                    convRef,
                    orderBy("date", "desc"),
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
    
                            const con:ConvData = {
                                id: c.id.replace(/T/g, '\n'),
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
                setConvCount(rows.length)
            }
            lastCursor = pageCursor;
            currentPage++;
        }
        setCursors(nextCursors)
    }    
        */

/*
    const selectAnalysis = async (analysis:string) => {
        setSelectedAnalysis(analysis)
        if (analysis === "all" && event !== ""){
            await loadConvData(event 1)
        } else if (analysis === 'time_series'){

        }

    }
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