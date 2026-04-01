import { NextRequest, NextResponse } from "next/server";
import {db} from "@/firebaseAdmin"

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

//毎日午前4時に実行する関数
export async function POST(request: NextRequest) {
    const { task, year, month } = await request.json()

    try {
        const snap = await db.collection("Events").get()
        if (snap.empty) {
            return NextResponse.json({ updated: 0, reason: "no updated" });
        }
        const batch = db.batch();
        let updated = 0;
    
        for (const doc of snap.docs) {
            const data = doc.data();
            if (!("dailyCounts" in data)) continue;
            const dailyCounts = data["dailyCounts"]
            const monthlyTotal = getMonthlyTotalFromMap(dailyCounts, year, month)
            const yearMonth = `${year}-${month}`

            if (monthlyTotal !== 0){
                batch.set(
                    doc.ref,
                    {
                      ["monthlyCounts"]: { [yearMonth]: monthlyTotal },
                    },
                    { merge: true }
                  );
            
                  updated++;
            }
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

  function getMonthlyTotalFromMap(
    dailyCounts: Record<string, number>,
    year: string,
    month: string
  ): number {
    const prefix = `${year}-${month}-`;
  
    let total = 0;
  
    for (const [date, count] of Object.entries(dailyCounts)) {
      if (date.startsWith(prefix)) {
        total += count;
      }
    }
  
    return total;
  }