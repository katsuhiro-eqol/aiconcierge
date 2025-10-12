
import { NextRequest, NextResponse } from "next/server";
import {db, bucket} from "@/firebaseAdmin"

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAIN_COLLECTION = "Events";
const SUB_COLLECTION  = "Conversation";
const DATE_FIELD      = "date";

interface FireConv {
    id: string;
    aicon: string;
    user: string;
    unanswerable: boolean;
}

const headers = ["id", "userNumber", "language", "user", "answer", "unanswerable"]

//Cronで日本時間月初4:00に実行予定n。その１ヶ月前からのデータを取得する。
const getPrevMonthRange = (base = new Date())  => {
    const y = base.getFullYear();
    const m = base.getMonth();
    const prevStart = new Date(y, m - 1, 1, 0, 0, 0, 0);
    const startString = prevStart.toISOString()
    const prevEnd  = new Date(y, m, 1, 0, 0, 0, 0);
    const endString = prevEnd.toISOString()
    const labelY = prevStart.getFullYear();
    const labelM = String(prevStart.getMonth() + 1).padStart(2, "0");
    return { startString, endString, label: `${labelY}-${labelM}` };
}

async function subcollectionExists(parentId: string): Promise<boolean> {
    const snap = await db
      .collection(MAIN_COLLECTION)
      .doc(parentId)
      .collection(SUB_COLLECTION)
      .limit(1)
      .get();
    return !snap.empty;
}

const toCSV = (uNumber: number, lang: string, conv:FireConv[]) => {
    const userNumber = `user-${uNumber}`
    let s = ""
    if (Array.isArray(conv)){
        conv.forEach((c) => {
            if (c.unanswerable){
                s += `${c.id},${userNumber},${lang},${c.user},${c.aicon},true\n`
            }else{
                s += `${c.id},${userNumber},${lang},${c.user},${c.aicon},false\n`
            }
        })
    }
    return s
}

async function processParentDoc(parentId: string, label: string, start: string, end: string) {
    const subRef = db.collection(MAIN_COLLECTION).doc(parentId).collection(SUB_COLLECTION);
    const snap = await subRef
        .where(DATE_FIELD, ">=", start)
        .where(DATE_FIELD, "<", end)
        .get();

      if (snap.empty) return { parentId, count: 0, saved: false };
  
      let csv = headers.join(",")+"\n"
      let uNumber = 1
      snap.forEach((doc) => {
          const data = doc.data()
          csv += toCSV(uNumber, data.language, data.conversations)
          uNumber += 1
      })
      const path = `conversations/${parentId}/${label}.csv`;
    
      await bucket.file(path).save(csv, {
          contentType: "text/csv; charset=utf-8",
          resumable: false,
          });
      
          return { parentId, saved: true, path };        
}


export async function GET() {
    try {
      const { startString, endString, label } = getPrevMonthRange(new Date());
      const parentsSnap = await db.collection(MAIN_COLLECTION).get();
      if (parentsSnap.empty) {
        return NextResponse.json({ ok: true, message: "No parent documents." });
      }

      const results: Array<{
        parentId: string;
        saved: boolean;
        path?: string;
        reason?: string;
      }> = [];
      
      const parentIds = parentsSnap.docs.map((d) => d.id);
      
      // 並列処理で各ドキュメントを処理
      const promises = parentIds.map(async (parentId) => {
        const exists = await subcollectionExists(parentId);
        if (!exists) {
          return { parentId, saved: false, reason: "no-subcollection" };
        }
        return await processParentDoc(parentId, label, startString, endString);
      });
      
      const processedResults = await Promise.all(promises);
      results.push(...processedResults);

      return NextResponse.json({ 
        ok: true, 
        label, 
        processed: results.length, 
        summary: results 
      });
    } catch (e: unknown) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      return NextResponse.json({ ok: false, error: errorMessage }, { status: 500 });
    }
  }
