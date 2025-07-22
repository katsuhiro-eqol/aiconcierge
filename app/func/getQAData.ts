import { db } from "@/firebase"
import { getDocs, collection } from "firebase/firestore"
import { QaData } from "@/types"

export default async function getQAData(eventId:string):Promise<QaData[]>{
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
            read:data.read,
            modalFile:data.modalFile,
            modalUrl:data.modalUrl,
            foreign:data.foreign,
            vector:vector,
            pronunciations:data.pronunciations
        }
        qa.push(qadata)
      })
      qa.sort((a, b) => parseInt(a.id, 10) - parseInt(b.id));
      return qa
}