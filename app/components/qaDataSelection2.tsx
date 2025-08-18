'use client';
import React from "react";
import {useState, useEffect} from "react"
import ForeignModal from "./foreignModal"
import ModalModal from "./modalModal"
import ListenVoice from "./listenVoice"
import { Circle, CircleDot, Speech, Paperclip, Languages } from 'lucide-react';
import { QaData, Answer } from "@/types"

interface QADataSelection2Props {
    qaData:QaData[];
    voiceNumber:number;
    setDeleteIds:(deleteIds:string[]) => void;
}

export default function QADataSelection2({qaData, voiceNumber, setDeleteIds}: QADataSelection2Props){
    const [isForeign, setIsForeign] = useState<boolean>(false)
    const [foreignData, setForeignData] = useState<Answer>({})
    const [answer, setAnswer] = useState<string>("")
    const [isModal, setIsModal] = useState<boolean>(false)
    const [modalUrl, setModalUrl] = useState<string>("")
    const [modalFile, setModalFile] = useState<string>("")
    const [isAudio, setIsAudio] = useState<boolean>(false)
    const [ids, setIds] = useState<string[]>([])

    const columns = [
        { key: 'selection', label: '' },
        { key: 'id', label: 'id' },
        { key: 'question', label: '質問' },
        { key: 'answer', label: '回答' },
        { key: 'read', label: '読み' },
        { key: 'foreignStr', label: '外国語回答' },
        { key: 'modalUrl', label: '添付書類' },
        { key: 'voiceId', label: 'AI音声' },
        { key: 'vector', label: 'Embedding' }
    ]

    const deleteIdClick = (option: string) => {
        setIds((prev) => {
            if (prev.includes(option)) {
                return prev.filter((item) => item !== option);
            } else {
                return [...prev, option];
            }
        });        
    };

    const showModal = (id:string) => {
        const selectedData = qaData.filter((item) => item.id == id)
        const url = selectedData[0].modalUrl
        const file = selectedData[0].modalFile
        console.log(url)
        console.log(file)
        setIsModal(true)
        setModalUrl(url)
        setModalFile(file)
    }

    const showForeign = (id:string) => {
        console.log("foreign", id)
        const selectedData = qaData.filter((item) => item.id == id)
        if (selectedData[0].foreign){
            const foreign = selectedData[0].foreign
            setForeignData(foreign)
        } else {
            setForeignData({})
        }
        
        setIsForeign(true)
        
        setAnswer(selectedData[0].answer)
    }

    const listenVoice = (id:string) => {
        const selectedData = qaData.filter((item) => item.id == id)
        setIsAudio(true)
        setAnswer(selectedData[0].answer)
    }

    useEffect(() => {
        setDeleteIds(ids)
        console.log("deleteIds",ids)
    }, [ids])

    return (
        <div>
            <div className="container mx-auto p-4">
            {}
            <table className="min-w-full border border-gray-300">
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
                {Array.isArray(qaData) && qaData.map((row) => (
                    <tr key={row.id} >
                    {columns.map((column) => {
                        if (column.key === 'selection') {
                            return (
                                <td 
                                key={`${row.id}-${column.key}`}
                                className="border border-gray-300 px-4 py-2 cursor-pointer"
                                onClick={() => deleteIdClick(row.id)}
                                >
                                {ids.includes(row.id) ? (
                                    <CircleDot size={20} className="text-blue-500 font-bold" />
                                ) : (
                                    <Circle size={20} className="text-gray-400 font-bold" />
                                )}
                                </td>
                            );
                                                    }
                        if (column.key==="foreignStr"){
                            return (
                                <td 
                                key={`${row.id}-${column.key}`}
                                className="border border-gray-300 px-4 py-2"
                              >
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => showForeign(row.id)}
                                    className="bg-slate-400 hover:bg-slate-600 text-white px-2 py-1 rounded"
                                  >
                                    <Languages size={18} />
                                  </button>
                                  </div>
                                  </td>
                            )
                        }
                        if (column.key==="modalUrl" && row["modalUrl"] != ""){
                            return (
                                <td 
                                key={`${row.id}-${column.key}`}
                                className="border border-gray-300 px-4 py-2"
                              >
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => showModal(row.id)}
                                    className="bg-slate-400 hover:bg-slate-600 text-white px-2 py-1 rounded"
                                  >
                                    <Paperclip size={18} />
                                  </button>
                                  </div>
                                  </td>
                            )
                        }
                        if (column.key==="voiceId"){
                            return (
                                <td 
                                key={`${row.id}-${column.key}`}
                                className="border border-gray-300 px-4 py-2"
                              >
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => listenVoice(row.id)}
                                    className="bg-slate-400 hover:bg-slate-600 text-white px-2 py-1 rounded"
                                  >
                                    <Speech size={18} />
                                  </button>
                                  </div>
                                  </td>
                            )
                        }           
                        return (
                        <td 
                            key={`${row.id}-${column.key}`}
                            className="border border-gray-300 px-2 py-2 text-xs"
                        >
                            {row[column.key] as React.ReactNode}
                        </td>
                        );
                    })}
                    </tr>
                ))}
                </tbody>
            </table>
            <div>
                {isForeign && (
                    <ForeignModal setIsForeign={setIsForeign} foreignData={foreignData} answer={answer}/>
                )}
                {isModal && (
                    <ModalModal setIsModal={setIsModal} modalUrl={modalUrl} modalFile={modalFile} />
                )}  
                {isAudio && (
                    <ListenVoice setIsAudio={setIsAudio} foreign={foreignData} answer={answer} voiceNumber={voiceNumber}/>
                )}                       
            </div>
            </div>
        </div>
    )
}