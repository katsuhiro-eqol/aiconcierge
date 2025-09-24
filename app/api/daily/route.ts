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
      // 1ページ目
    const first = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/purge-missing-field`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ since:yesterday, pageSize: 500, dryRun: false }),
    }).then(r => r.json());
    let totalProcessed = first.processed ?? 0;
    let totalDeleted = first.deleted ?? 0;
    let totalKept = first.kept ?? 0;
    let cursor = first.nextCursor ?? null;

      // 制限時間の心配があるなら、ここで数回に限定して抜ける実装に
    let safety = 10;
    while (cursor && safety-- > 0) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/purge-missing-field`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ since:yesterday, pageSize: 800, cursor }),
        }).then(r => r.json());
        totalProcessed += res.processed ?? 0;
        totalDeleted += res.deleted ?? 0;
        totalKept += res.kept ?? 0;
        cursor = res.nextCursor ?? null;
    }

    return NextResponse.json({
        since:yesterday,
        totalProcessed,
        totalDeleted,
        totalKept,
        complete: cursor === null,
    });

}