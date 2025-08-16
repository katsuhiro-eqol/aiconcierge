
const foreignLanguages: Record<string, string[]> = {
    "日本語": ["ja-JP","ja-JP-Standard-B"],
    "英語": ["en-US", "en-US-Standard-F"],
    "中国語（簡体）": ["zh-CN", "cmn-CN-Standard-D"],
    "中国語（繁体）": ["zh-TW", "cmn-TW-Standard-A"],
    "韓国語": ["ko-KR", "ko-KR-Standard-A"],
    "フランス語": ["fr-FR", "fr-FR-Standard-C"],
    "ポルトガル語": ["pt-BR", "pt-BR-Standard-A"],
    "スペイン語": ["es-ES", "es-ES-Standard-H"]
}

export const realtimeVoice = async (text:string, language:string, voiceNumber:number) => {
    const langCode = foreignLanguages[language][0]
    const voice = foreignLanguages[language][1]
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
        const audioBlob = base64ToBlob(audio_data.audioContent, 'audio/mp3')
        const audioUrl = URL.createObjectURL(audioBlob);
        const duration = await getAudioDuration(audio_data.audioContent)
        return {url:audioUrl, duration:duration}
    } else {
        return {url:"" , duration:0}
    }
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