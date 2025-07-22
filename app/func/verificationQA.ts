import { db } from "@/firebase"
import { getDocs, collection, doc, getDoc } from "firebase/firestore"
import {registerVoice} from "./updateWav"
import createEmbedding from "./createEmbedding"
import createForeign from "./createForeign"
import { QaData } from "@/types"
import md5 from 'md5';


export default async function validateCreatedQA(organization:string, event:string, languages:string[], voiceSetting:boolean, jsonLength:number){
    console.log("validating")
    const eventId = organization + "" + event
    const qa = await loadQA(eventId)
    console.log(jsonLength, qa.length)
    if (qa.length < jsonLength){
        return "未登録のQ&Aデータがある可能性があります。イベント情報一覧で内容を確認してください。"
    } else {
        let voiceErrors = ""
        try {
            for (const item of qa){
                for (const lang of languages){
                    const voiceId = `${md5(item.answer)}-${lang}`
                    const voiceDoc = doc(db, "Voice", voiceId)
                    const voiceSnap = await getDoc(voiceDoc)
                    if (!voiceSnap.exists()){
                       voiceErrors += `${item.id}-${lang},`
                    }
                }
            }
            
        } catch (error) {
    
        }
        if (voiceErrors === ""){
            return "Q&Aデータ登録が正常に終了しました"
        } else {
            voiceErrors.trim()
            return `未登録音声データがある可能性があります。イベント情報一覧で内容を確認してください。${voiceErrors}`
        }
    }
    

}

async function loadQA(eventId:string){
    const querySnapshot = await getDocs(collection(db, "Events", eventId, "QADB"));
    const qa:QaData[] = []
    querySnapshot.forEach((doc) => {
        const data = doc.data()
        const vector = data.vector.substr(0,10) + "..."
        const qadata:QaData = {
            id: doc.id,
            code:data.code,
            question:data.question,
            answer:data.answer,
            modalFile:data.modalFile,
            modalUrl:data.modalUrl,
            foreign:data.foreign,
            vector:vector,
            read:data.read,
            pronunciations:data.pronunciations
        }
        qa.push(qadata)
      })
      qa.sort((a, b) => parseInt(a.id, 10) - parseInt(b.id));
      return qa
}
