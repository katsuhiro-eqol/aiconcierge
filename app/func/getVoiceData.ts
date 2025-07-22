import { db } from "@/firebase"
import { doc, getDoc } from "firebase/firestore"
import { VoiceData } from "@/types"
import md5 from 'md5';

export default async function getVoiceData(answer:string, lang:string):Promise<VoiceData|null>{
    const voiceId = `${md5(answer)}-${lang}`

    try {
        const voiceRef = doc(db, "Voice", voiceId)
        const voiceSnap = await getDoc(voiceRef);
        if (voiceSnap.exists()) {
            const data = voiceSnap.data()
            const voiceData:VoiceData = {
                lang:lang,
                text:answer,
                fText:data.answer,
                url:data.url,
                frame:data.frame
            }
            return voiceData
            
        } else {
            return null
        }
    } catch (error) {
        return null
    }
}