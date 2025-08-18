import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "@/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"

const foreignLanguages: Record<string, string[]> = {
    "日本語": ["ja-JP","ja-JP-Standard-B", "ja-JP-Standard-C"],
    "英語": ["en-US", "en-US-Standard-F", "en-US-Standard-B"],
    "中国語（簡体）": ["zh-CN", "cmn-CN-Standard-D", "cmn-CN-Standard-B"],
    "中国語（繁体）": ["zh-TW", "cmn-TW-Standard-A", "cmn-TW-Standard-B"],
    "韓国語": ["ko-KR", "ko-KR-Standard-A", "ko-KR-Standard-C"],
    "フランス語": ["fr-FR", "fr-FR-Standard-C", "fr-FR-Standard-G"],
    "ポルトガル語": ["pt-BR", "pt-BR-Standard-A", "pt-BR-Standard-B"],
    "スペイン語": ["es-ES", "es-ES-Standard-H", "es-ES-Standard-G"]
}

export const registerVoice = async (voiceId:string, text:string, language:string, japanese:string, voiceNumber:number, isUpdate:boolean): Promise<void> => {
    const voiceRef = doc(db, "Voice", voiceId)
    const voiceSnap = await getDoc(voiceRef);
    if (!voiceSnap.exists() || isUpdate) {
        await createAudioFile(voiceId, text, language, japanese, voiceNumber)
    }
}

const createAudioFile = async (voiceId:string, text:string, language:string, japanese:string, voiceNumber:number) => {
    const langCode = foreignLanguages[language][0]
    const voice = foreignLanguages[language][voiceNumber]
    const ttsApiKey = process.env.NEXT_PUBLIC_GOOGLE_TTS_API_KEY

    const audio = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize?key='+ ttsApiKey, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        input: {
            text: text,
        },
        voice: {
            languageCode: langCode,
            name: voice,
        },
        audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 1.0,
        },
        }),
    })
    const audio_data = await audio.json();
    if (audio_data.audioContent) {
        const audioBlob = base64ToBlob(audio_data.audioContent, 'audio/mp3');
        const frame = frameCount(audio_data.audioContent)
        const duration = await getAudioDuration(audio_data.audioContent)
        const fileName = voiceId + ".mp3"
        const storage = getStorage()
        const path = "voice/" + fileName
        const storageRef = ref(storage, path)
        await uploadBytes(storageRef, audioBlob)
        await getDownloadURL(ref(storage, path))
        .then((url) => {
            saveVoiceData(voiceId, text, language, japanese, fileName, url, frame, duration, voiceNumber)
        })
        .catch((error) => {
            console.log(error)
        });
    }
}

const saveVoiceData = async (voiceId:string, text:string, language:string, japanese:string, filename:string, url:string, frame:number, duration:number, voiceNumber:number) => {
    const data = {
        answer: text,
        japanese:japanese,
        language: language,
        filename: filename,
        url: url,
        frame:frame,
        duration:duration,
        voiceNumber:voiceNumber
    }
    const voiceRef = doc(db, "Voice", voiceId);
    await setDoc(voiceRef, data, {merge:true})      
}

function base64ToBlob(base64Data:string, contentType:string) {
    const byteCharacters = atob(base64Data);
    const byteArrays = [];
  
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
  
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
  
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
  
    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

const frameCount = (base64Data:string) => {
    const audioString = base64Data.replace(/-/g, '+').replace(/_/g, '/')
    const byteCharacters = atob(audioString)
    const bytesLength = byteCharacters.length
    const frameCount = bytesLength/2
    return frameCount
}

const getAudioDuration = (base64Data: string): Promise<number> => {
    return new Promise((resolve) => {
        const audioString = base64Data.replace(/-/g, '+').replace(/_/g, '/')
        const audioBlob = base64ToBlob(audioString, 'audio/mp3')
        const audioUrl = URL.createObjectURL(audioBlob)
        
        const audio = new Audio()
        audio.addEventListener('loadedmetadata', () => {
            const duration = audio.duration
            URL.revokeObjectURL(audioUrl) // メモリリーク防止
            resolve(duration)
        })
        
        audio.addEventListener('error', () => {
            URL.revokeObjectURL(audioUrl)
            resolve(0) // エラー時は0を返す
        })
        
        audio.src = audioUrl
    })
}