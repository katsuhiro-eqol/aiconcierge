import { db } from "@/firebase"
import { doc, getDoc } from "firebase/firestore"
import { EventData } from "@/types"

export default async function getEventData(eventId:string):Promise<EventData|null>{
    try {
        const event = eventId.split("-")[1]
        const docRef = doc(db, "Events", eventId)
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data()
            const eventData:EventData = {
                id:eventId,
                name:event,
                code:data.code,
                voiceSetting:data.voiceSetting,
                languages:data.languages,
                embedding:data.embedding,
                qaData:data.qaData,
                langStr:"",
                prompt:data.prompt,
                gpt:data.gpt
            }
            return eventData
            
        } else {
            return null
        }
    } catch (error) {
        return null
    }
}
