import { db } from "@/firebase"
import { doc, getDoc } from "firebase/firestore"
import { VoiceData } from "@/types"
import md5 from 'md5';

export default async function getVoiceData(answer:string, lang:string, voiceNumber:number):Promise<VoiceData|null>{

    const idWord = `${String(voiceNumber)}-${answer.trim()}`
    console.log(idWord)
    const voiceId = `${md5(idWord)}`//voiceIdはtrimした値
    console.log(voiceId)

    try {
        const voiceRef = doc(db, "Voice", voiceId)
        const voiceSnap = await getDoc(voiceRef);
        if (voiceSnap.exists()) {
            const data = voiceSnap.data()
            if (data.language === lang){
                const voiceData:VoiceData = {
                    lang:lang,
                    text:answer,
                    fText:data.answer,
                    url:data.url,
                    frame:data.frame,
                    duration:data.duration
                }
                return voiceData
            } else {
                console.log("no voice data")
                return null
            }    
        } else {
            return null
        }
    } catch (error) {
        return null
    }
}