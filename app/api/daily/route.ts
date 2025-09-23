import { NextRequest, NextResponse } from "next/server";
import {db} from "@/firebase"
import {doc, setDoc} from "firebase/firestore"

//毎日午前4時に実行する関数
export async function GET(request: NextRequest) {
    const date = new Date()
    const offset = date.getTimezoneOffset() * 60000
    const localDate = new Date(date.getTime() - offset)
    const now = localDate.toISOString()

    const y = new Date(date.getTime() - 24 * 60 * 60 * 1000)
    const yDate = new Date(y.getTime() - offset)
    const yesterday = yDate.toISOString()

    const cronRef = doc(db, "Cron",now)
    await setDoc(cronRef, {date:now, yesterday:yesterday})

    //ここから

    return NextResponse.json({ ok: true, at: new Date().toISOString() });
}