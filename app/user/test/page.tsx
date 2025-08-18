"use client"
import React from "react";
import { useState, useEffect } from "react";
import { db } from "@/firebase"
import { doc, getDoc, collection, getDocs, updateDoc } from "firebase/firestore"
import EventsList from "../../components/eventsList"
import QADataList from "../../components/qADataList"
import getQAData from "@/app/func/getQAData"
import { EventData, QaData } from "@/types"

export default function EventList(){
 
    async function updateAllDocumentsInCollection() {
        try {
          // コレクション内の全ドキュメントを取得
          const querySnapshot = await getDocs(collection(db, "Voice"));
          
          // 各ドキュメントを更新
          const updatePromises: Promise<void>[] = [];
          querySnapshot.forEach((document) => {
            updatePromises.push(
              updateDoc(doc(db, "Voice", document.id), {
                ["voiceNumber"]: 1
              })
            );
          });
          
          // 全ての更新が完了するのを待つ
          await Promise.all(updatePromises);
          console.log("全てのドキュメントを更新しました");
        } catch (error) {
          console.error("更新中にエラーが発生しました:", error);
        }
      }

    return (
        <div>
            <div>
               <div className="font-bold text-xl">関数</div>
               <button onClick={() => updateAllDocumentsInCollection()}>voiceNumberをstringからnumberに書き換え</button>
            </div>
        </div>
    )
}
