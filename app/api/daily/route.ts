import { NextRequest, NextResponse } from "next/server";
import {db} from "@/firebase"
import {doc, setDoc} from "firebase/firestore"

//毎日午前4時に実行する関数
export async function GET(request: NextRequest) {
    const date = new Date()
    //apiなのでgetTimezoneOffset()が取得できない。
    const jOffset = 9 * 60 * 60 * 1000
    const localDate = new Date(date.getTime() - jOffset)
    const now = localDate.toISOString()

    const y = new Date(date.getTime() - 24 * 60 * 60 * 1000)
    const yDate = new Date(y.getTime() - jOffset)
    const yesterday = yDate.toISOString()

    const cronRef = doc(db, "Cron",now)
    await setDoc(cronRef, {date:now, yesterday:yesterday})
}