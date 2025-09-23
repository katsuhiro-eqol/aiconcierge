import { NextRequest, NextResponse } from "next/server";
import {db} from "@/firebaseAdmin"

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ReqBody = {
    //一度に処理するドキュメント数
    pageSize?: number;              // 既定 500
    // 再開カーソル（前回の最後のdate）
    cursor?: { lastDate: string } | null;
    // 対象期間の下限（この日時以降のみ対象）
    since?: string | number | null; // ISO文字列 or epochミリ秒
    // ドライラン（削除せずカウントのみ）
    dryRun?: boolean;
}

function isMissing(v:string[]): boolean {
    if (v === undefined || v === null) return true;
    if (Array.isArray(v) && v.length === 0) return true;
    return false;
}

//毎日午前4時に実行する関数
export async function POST(request: NextRequest) {
    const {
        pageSize = 500,
        cursor = null,
        since = null,
        dryRun = false,
    } = (await request.json().catch(() => ({}))) as ReqBody;
    console.log("test")
    let q = db.collectionGroup("conversation")
    .where("date", ">=", since)
    .orderBy("date", "asc")
    .select("date", "conversations")

    if (cursor) {
        q = q.startAfter(cursor.lastDate)
    }

    const snap = await q.limit(pageSize).get()
    if (snap.empty) return NextResponse.json({ done: true, processed: 0, deleted: 0 })

    const writer = db.bulkWriter({ throttling: true })
    let processed = 0, deleted = 0
    let lastDate = ""

    for (const doc of snap.docs) {
        processed++;
        const data = doc.data();
        lastDate = data.date;
    
        if (isMissing(data.conversations)) {
          if (!dryRun) writer.delete(doc.ref); // ← サブコレ文書を削除
          deleted++;
        }
    }
    await writer.close();
    console.log(lastDate)
    const nextCursor = snap.size < pageSize ? null : { lastDate:lastDate };
    return NextResponse.json({ done: !nextCursor, processed, deleted, nextCursor });
}