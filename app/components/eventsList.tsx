'use client';
import React from "react";
import { useState, useEffect } from 'react';
import { Circle, CircleDot } from 'lucide-react';
import { EventData } from "@/types"

interface EventsListProps {
    eventsData: EventData[];
    setEventId: (id: string | null) => void;
}

export default function EventsList({eventsData, setEventId}:EventsListProps){
    const [selectedRowId, setSelectedRowId] = useState<string|null>(null)
    const [comment, setComment] = useState<string>("")

    const columns = [
        { key: 'selection', label: '' },
        { key: 'name', label: 'イベント名' },
        { key: 'code', label: 'コード' },
        { key: 'voiceSetting', label: '音声入力／AIボイス' },
        { key: 'langStr', label: '対応外国語' }
    ]

    const toggleRowSelection = (rowId: string) => {
        if (selectedRowId === rowId) {
            setSelectedRowId(null); // 選択解除
        } else {
            setSelectedRowId(rowId)
        }
    }

    const loadQAData = () => {
        if (selectedRowId){
            const selectedData = eventsData.filter((item) => item.id === selectedRowId)
            const qaData = selectedData[0].qaData
            const event = selectedData[0].name
            if (qaData){
                setEventId(selectedRowId)
                setComment(event)
            } else {
                setComment(`${event}はQ&Aデータ未登録です`)
            }
        } else {
            alert("イベントが選択されていません")
        }
    }

    useEffect(() => {
        console.log(comment)
    },[comment])

    useEffect(() => {
        if (!selectedRowId){
            setComment("")
        }
    }, [selectedRowId])

    return (
        <div>
            <div className="container mx-auto p-4">
            <table className="min-w-full border border-gray-300">
                <thead>
                <tr className="bg-gray-100">
                    {columns.map((column) => (
                    <th 
                        key={column.key}
                        className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700 text-sm"
                    >
                        {column.label}
                    </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {Array.isArray(eventsData) && eventsData.map((row) => (
                    <tr 
                    key={row.id} 
                    className={`hover:bg-gray-50 ${selectedRowId === row.id ? 'bg-blue-50' : ''}`}
                    >
                    {columns.map((column) => {
                        // 選択カラムの場合はアイコンを表示
                        if (column.key === 'selection') {
                        return (
                            <td 
                            key={`${row.id}-${column.key}`}
                            className="border border-gray-300 px-4 py-2 cursor-pointer"
                            onClick={() => toggleRowSelection(row.id)}
                            >
                            {selectedRowId === row.id ? (
                                <CircleDot size={20} className="text-blue-500 font-bold" />
                            ) : (
                                <Circle size={20} className="text-gray-400 font-bold" />
                            )}
                            </td>
                        );
                        }
                        // その他のカラムは通常通り表示
                        return (
                        <td 
                            key={`${row.id}-${column.key}`}
                            className="border border-gray-300 px-4 py-2 text-xs"
                        >
                            {String(row[column.key as keyof typeof row])}
                        </td>
                        );
                    })}
                    </tr>
                ))}
                </tbody>
            </table>
            <div>
                <div className="flex flex-row gap-x-4">
                <button className="bg-cyan-500 hover:bg-cyan-700 text-white ml-3 mt-3 px-2 py-1 rounded text-xs" onClick={loadQAData}>Q&Aデータ表示</button>
                <div className="ml-5 mt-3 px-2 py-1 text-base font-bold">{comment}</div>
                </div>
            </div>
            </div>
        </div>
    )
}

/*

            */