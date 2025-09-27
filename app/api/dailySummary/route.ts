import { NextRequest, NextResponse } from "next/server";
import {db} from "@/firebaseAdmin"

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

//毎日午前4時に実行する関数
export async function POST(request: NextRequest) {
    const date = new Date()
    const today = date.toISOString().split("T")[0]

    try {
        const snap = await db.collection("Events").get()
        if (snap.empty) {
            return NextResponse.json({ updated: 0, reason: "no updated" });
        }
        const batch = db.batch();
        let updated = 0;
    
        for (const doc of snap.docs) {
            const data = doc.data();
            if (!("counter" in data)) continue;
      
            const count = data["counter"];
            const stt = data["sttDuration"];
            batch.set(
                doc.ref,
                {
                  ["dailyCounts"]: { [today]: count },
                  ["counter"]: 0,
                  ["dailySTT"]: {[today]: stt},
                  ["sttDuration"]: 0
                },
                { merge: true }
              );
        
              updated++;
        }
        if (updated > 0) await batch.commit();
        return NextResponse.json({ updated });
    } catch (error){
        console.error(error);
        return NextResponse.json(
          { error: error ?? "unknown error" },
          { status: 500 }
        );
    }
}