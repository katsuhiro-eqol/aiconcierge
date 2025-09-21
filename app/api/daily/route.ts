import { NextRequest, NextResponse } from "next/server";
import {db} from "@/firebase"
import { doc, setDoc} from "firebase/firestore"

export async function GET(request: NextRequest) {
    const date = new Date().toISOString()

    const cronRef = doc(db,"Cron",date)
    await setDoc(cronRef,{date:date})
    return NextResponse.json({ ok: true, at: new Date().toISOString() });
}