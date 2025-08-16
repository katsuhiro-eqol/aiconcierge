"use client"
import React from "react";
import { useState, useEffect } from "react";
import { db } from "@/firebase"
import { doc, getDoc, collection, getDocs } from "firebase/firestore"
import EventsList from "../../components/eventsList"
import QADataList from "../../components/qADataList"
import getQAData from "@/app/func/getQAData"
import { EventData, QaData } from "@/types"

export default function EventList(){
    const [events, setEvents] = useState<string[]>([""]) //firestoreから読み込む
    const [eventsData, setEventsData] = useState<EventData[]>([])
    //const [selectedRowId, setSelectedRowId] = useState(null)
    const [eventId, setEventId] = useState<string|null>(null)
    const [organization, setOrganization] = useState<string>("")
    const [qaData, setQaData] = useState<QaData[]>([])
    const [isQAData, setIsQAData] = useState<boolean>(false)
 


    const loadEvents = async (org:string) => {
        try {
            if (org){
            const docRef = doc(db, "Users", org)
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data()
                setEvents(data.events)
                if (!data.events){
                    alert("イベントが登録されていません")
                }
            } else {
                alert("ログインから始めてください")
            }
        }
        } catch (error) {
            console.log(error)
        }
    }

    const loadEventsData = async () => {
        const esData:EventData[] = []
        for (const item  of events){
            try {
                const id = organization + "_" + item
                const docRef = doc(db, "Events", id)
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data()
                    const lang = data.languages.toString()
                    const eData:EventData = {
                        id: id,
                        name: item,
                        image:data.image,
                        code: data.code,
                        voiceSetting: data.voiceSetting,
                        qaData:data.qaData,
                        embedding:data.embedding,
                        languages:data.languages,
                        langStr:lang,
                        prompt:data.prompt,
                        gpt:data.gpt
                    }
                    esData.push(eData)
                }
            } catch (error) {
                console.log(error)
            }     
        }
        setEventsData(esData)
    }

    const loadQADB = async () => {
        if (eventId){
            const qa = await getQAData(eventId)
            setQaData(qa)
        }
    }

    useEffect(() => {
        if (qaData.length > 0){
            setIsQAData(true)
        }
    }, [qaData])

    useEffect(() => {
        if (eventId){
            loadQADB()
        }
    }, [eventId])

    useEffect(() => {
        if (events){
            loadEventsData()
        }
    },[events])

    useEffect(() => {
        const org = sessionStorage.getItem("user")
        if (org){
            setOrganization(org)
            loadEvents(org)
        }
    },[])

    return (
        <div>
            <div>
               <div className="font-bold text-xl">イベント・Q&A情報一覧</div>
               <EventsList eventsData={eventsData} setEventId={setEventId} />
            </div>
            <div>
            {isQAData && (<QADataList qaData={qaData} />)}
            </div>
        </div>
    )
}
