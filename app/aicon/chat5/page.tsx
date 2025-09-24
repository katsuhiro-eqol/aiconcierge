//音声入力・AIボイスあり
"use client"
import "regenerator-runtime";
import React from "react";
import { useSearchParams as useSearchParamsOriginal } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
//import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk"
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, Send, Eraser, X, LoaderCircle } from 'lucide-react';
import { db } from "@/firebase";
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, arrayUnion, increment } from "firebase/firestore";
import Modal from "../../components/modalModal"
import getVoiceData from "@/app/func/getVoiceData";
import {Message2, EmbeddingsData, EventData, VoiceData, ForeignAnswer} from "@/types"
import { realtimeVoice } from "@/app/func/realtimeVoice";
type LanguageCode = 'ja-JP' | 'en-US' | 'zh-CN' | 'zh-TW' | 'ko-KR' | 'fr-FR' | 'pt-BR' | 'es-ES'

const no_sound = "https://firebasestorage.googleapis.com/v0/b/conciergeproject-1dc77.firebasestorage.app/o/voice%2Fno_sound.wav?alt=media&token=80abe4c5-a52d-40eb-9e6f-23b265fd9d72"

export default function Aicon() {
    const [windowHeight, setWindowHeight] = useState<number>(0)
    const [initialSlides, setInitialSlides] = useState<string|null>(null)
    const [thumbnail, setThumnail] = useState<string|null>("")
    const [userInput, setUserInput] = useState<string>("")
    const [messages, setMessages] = useState<Message2[]>([])
    const [history, setHistory] = useState<{user: string, aicon: string}[]>([])
    const [eventData, setEventData] = useState<EventData|null>(null)
    const [langList, setLangList] = useState<string[]>([])
    const [dLang, setDLang] = useState<string>("")//表示用言語
    const [language, setLanguage] = useState<string>("")
    const [embeddingsData, setEmbeddingsData] = useState<EmbeddingsData[]>([])
    const [wavUrl, setWavUrl] = useState<string>(no_sound)
    const [slides, setSlides] = useState<string[]|null>(null)
    const [currentIndex, setCurrentIndex] = useState<number>(0)
    const [wavReady, setWavReady] = useState<boolean>(false)
    const [record,setRecord] = useState<boolean>(false)
    const [canSend, setCanSend] = useState<boolean>(false)
    const [isModal, setIsModal] = useState<boolean>(false)
    const [modalUrl, setModalUrl] = useState<string|null>(null)
    const [modalFile, setModalFile] = useState<string|null>(null)
    const [convId, setConvId] = useState<string>("")
    const [startText, setStartText] = useState<EmbeddingsData|null>(null)
    const [undefindQA, setUndefindQA] = useState<EmbeddingsData|null>(null)

    //const [isListening, setIsListening] = useState<boolean>(false)
    //const [recognizing, setRecognizing] = useState<boolean>(false)
    const [undefinedAnswer, setUndefinedAnswer] = useState<ForeignAnswer|null>(null)
    const [voiceCache, setVoiceCache] = useState<Map<string, VoiceData>>(new Map())
    //const [isQADBLoading, setIsQADBLoading] = useState<boolean>(false)

    const {
        transcript,
        resetTranscript,
        listening,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const nativeName = {"日本語":"日本語", "英語":"English","中国語（簡体）":"简体中文","中国語（繁体）":"繁體中文","韓国語":"한국어","フランス語":"Français","スペイン語":"Español","ポルトガル語":"Português"}
    const japaneseName = {"日本語":"日本語", "English":"英語","简体中文":"中国語（簡体）","繁體中文":"中国語（繁体）","한국어":"韓国語","Français":"フランス語","Español":"スペイン語","Português":"ポルトガル語"}
    
    const foreignLanguages: Record<string, LanguageCode> = {"日本語": "ja-JP","英語": "en-US","中国語（簡体）": "zh-CN","中国語（繁体）": "zh-TW","韓国語": "ko-KR","フランス語": "fr-FR","ポルトガル語": "pt-BR","スペイン語": "es-ES"}
    const audioRef = useRef<HTMLAudioElement>(null)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
    const playChainRef = useRef<Promise<void>>(Promise.resolve());

    const useSearchParams = ()  => {
        const searchParams = useSearchParamsOriginal();
        return searchParams;
    }
    const searchParams = useSearchParams()
    const attribute = searchParams.get("attribute")
    const code = searchParams.get("code")

    //stt → audioの最適化検討
    const waitCanPlay = useCallback(() =>
        new Promise<void>((resolve, reject) => {
            const el = audioRef.current
            if (!el){
                return
            }
            const ok = () => { cleanup(); resolve(); };
            const ng = () => { cleanup(); reject(new Error('media error')); };
            const cleanup = () => {
                el.removeEventListener('canplay', ok);
                el.removeEventListener('loadeddata', ok);
                el.removeEventListener('error', ng);
            };
            el.addEventListener('canplay', ok, { once: true });
            el.addEventListener('loadeddata', ok, { once: true });
            el.addEventListener('error', ng, { once: true });
            if (el.readyState >= 2) { cleanup(); resolve(); }
    }), []);

    async function getAnswer() {    
        console.log("sttStatus2",sttStatus)  
        await sttStop()  
        const date = new Date()
        const offset = date.getTimezoneOffset() * 60000
        const localDate = new Date(date.getTime() - offset)
        const now = localDate.toISOString()
  
        const userMessage: Message2 = {
            id: now,
            text: userInput,
            sender: 'user',
            modalUrl:"",
            modalFile:"",
            source:null
        }
        setMessages(prev => [...prev, userMessage]);
        setCanSend(false)//同じInputで繰り返し送れないようにする
        
        const sleep = (ms:number) => new Promise(res => setTimeout(res, ms));
        await sleep(1000)
        setUserInput("")
        
        const res = await fetch("/api/checkHugeRequest", { method: "POST" });
        const data2 = await res.json();
        if (res.status === 429) {
            alert(`１日のアクセス上限に達しました。リセットまで約 ${Math.ceil((data2.resetSec ?? 0)/3600)} 時間`);
            return
        } else {
        console.log("残回数", data2.remaining);
        }
  
        try {
            const response1 = await fetch("/api/embedding2", {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({ input: userInput, model: eventData?.embedding ?? "text-embedding-3-small", language: language }),
            });
            const data1 = await response1.json();
            if (response1.status !== 200) {
              throw data1.error || new Error(`Request failed with status ${response1.status}`);
            }
            //const translatedQuestion = data1.input
            const similarityList = findMostSimilarQuestion(data1.embedding)
            const refQA = chooseQA(similarityList)
            const undefined = undefinedAnswer?.[language] || "申し訳ありません。回答できない質問です"
            const response = await fetch("/api/concierge", {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({ question: userInput, model: eventData!.gpt, prompt: eventData!.prompt, refQA: refQA, history: history, language: language, undefined:undefined }),
            });
            const data = await response.json();
            const answer = data.answer
            
            // キャッシュキーを生成
            const cacheKey = `${eventData!.voiceNumber}-${answer.trim()}`;
            
            // キャッシュから音声データを確認
            let existingVoice: VoiceData | null = voiceCache.get(cacheKey) || null;
            
            if (!existingVoice) {
                // キャッシュにない場合はFirestoreから取得
                existingVoice = await getVoiceData(answer, language, eventData!.voiceNumber);
                if (existingVoice) {
                    // キャッシュに保存
                    setVoiceCache(prev => new Map(prev).set(cacheKey, existingVoice!));
                }
            }

            //await waitCanPlay()
            console.log("sttStatus3",sttStatus)
            
            if (existingVoice){
                console.log("not newly created voice")
                setWavUrl(existingVoice.url)   
                const sl = createSlides(existingVoice.duration)
                setSlides(sl)
            } else {
                const voiceData = await realtimeVoice(answer.trim(),language,1)
                setWavUrl(voiceData.url)
                const sl = createSlides(voiceData.duration)
                setSlides(sl)
            }

            if (data.id !== ""){
                const modal = embeddingsData.filter((item) => item.id === data.id)
                if (modal.length > 0){
                    const aiMessage: Message2 = {
                        id: `A${now}`,
                        text: `${data.answer} ${data.source} ${data.id}`,
                        sender: 'AIcon',
                        modalUrl:modal[0].modalUrl,
                        modalFile:modal[0].modalFile,
                        source:data.source,
                        thumbnail: thumbnail
                      };
                      setMessages(prev => [...prev, aiMessage]);
                      await saveMessage(userMessage, aiMessage, attribute!)                    
                } else {
                    const aiMessage: Message2 = {
                        id: `A${now}`,
                        text: `${data.answer} ${data.source}`,
                        sender: 'AIcon',
                        modalUrl:"",
                        modalFile:"",
                        source:data.source,
                        thumbnail: thumbnail
                      };
                      setMessages(prev => [...prev, aiMessage]);
                      await saveMessage(userMessage, aiMessage, attribute!)
                }
            } else {
                const aiMessage: Message2 = {
                    id: `A${now}`,
                    text: `${data.answer} ${data.source}`,
                    sender: 'AIcon',
                    modalUrl:"",
                    modalFile:"",
                    source:data.source,
                    thumbnail: thumbnail
                  };
                setMessages(prev => [...prev, aiMessage]);
                await saveMessage(userMessage, aiMessage, attribute!)
            }
            //全ユーザーの質問総数
            await incrementCounter(attribute!)
        } catch(error) {
        console.error(error);
        }
      }

      function cosineSimilarity(vec1:number[], vec2:number[]) {
        if (vec1.length !== vec2.length) {
          throw new Error('ベクトルの次元数が一致しません');
        }
        const dotProduct = vec1.reduce((sum, a, i) => sum + a * vec2[i], 0);
        const magnitude1 = Math.sqrt(vec1.reduce((sum, a) => sum + a * a, 0));
        const magnitude2 = Math.sqrt(vec2.reduce((sum, a) => sum + a * a, 0));
        if (magnitude1 === 0 || magnitude2 === 0) {
          return 0;
        }
        return dotProduct / (magnitude1 * magnitude2);
      }
    
    function findMostSimilarQuestion(base64Data:string){
        const inputVector = binaryToList(base64Data)
        
        // 類似度計算を最適化（上位10件のみ計算）
        const similarities = embeddingsData
            .map((item) => ({
                id: item.id,
                question: item.question,
                answer: item.answer,
                foreign:item.foreign,
                similarity: cosineSimilarity(inputVector, item.vector)
            }))
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 5); // 上位10件のみ保持

        const meaningfulList = similarities.filter(item => item.similarity > 0.5)
        return meaningfulList;
    }

    const chooseQA = (similarities:{id:string, question:string, answer:string, foreign: ForeignAnswer, similarity:number}[]) => {
        let QAs = ""
        for (let i = 0; i < similarities.length; i++){
            const QA = `id:${similarities[i].id} - Q:${similarities[i].question} - A:${similarities[i].foreign[language]}\n`
            QAs += QA
        }
        return QAs
    }

    function binaryToList(binaryStr:string){
        const decodedBuffer = Buffer.from(binaryStr, 'base64')
        const embeddingsArray = new Float32Array(
            decodedBuffer.buffer, 
            decodedBuffer.byteOffset, 
            decodedBuffer.byteLength / Float32Array.BYTES_PER_ELEMENT
          )
          const embeddingsList = Array.from(embeddingsArray)
          return embeddingsList
    }

    const incrementCounter = async (attribute:string) => {
        const counterRef = doc(db, "Events", attribute)
        console.log("incriment")
        await updateDoc(counterRef, { counter: increment(1) })
    }

    const createSlides = (duration:number) => {
        let imageArray = []
        switch (initialSlides) {
            case "/AI-con_man_01.png":
                imageArray = ["/AI-con_man_02.png","/AI-con_man_01.png"]
                break;
            case "/AI-con_man2_01.png":
                imageArray = ["/AI-con_man2_02.png","/AI-con_man2_01.png"]
                break;
            case "/AI-con_woman_01.png":
                imageArray = ["/AI-con_woman_02.png","/AI-con_woman_01.png"]
                break;
            case "/AI-con_woman2_01.png":
                imageArray = ["/AI-con_woman2_02.png","/AI-con_woman2_01.png"]
                break;
            default:
                imageArray = Array(2).fill(initialSlides)
                break;
        }
        let imageList:string[] = []
        const n = Math.floor(duration*2)+1
        for (let i = 0; i<n; i++){
            imageList = imageList.concat(imageArray)
        }
        imageList = imageList.concat(Array(4).fill(initialSlides))
        //imageList = imageList.concat(initialSlides)
        return imageList
    }

    async function loadQAData(attr:string){
        try {
            const querySnapshot = await getDocs(collection(db, "Events",attr, "QADB"));
            // バッチ処理でベクトルデコードを最適化
            const qaData = await Promise.all(
                querySnapshot.docs.map(async (doc) => {
                    const data = doc.data();
                    // ベクトルデコードを非同期で実行（UIブロッキングを防止）
                    const embeddingsArray = await new Promise<number[]>((resolve) => {
                        setTimeout(() => {
                            resolve(binaryToList(data.vector));
                        }, 0);
                    });
                    
                    return {
                        id: doc.id,
                        vector: embeddingsArray,
                        question: data.question,
                        answer: data.answer,
                        modalUrl: data.modalUrl,
                        modalFile: data.modalFile,
                        foreign: data.foreign,
                    };
                })
            );
            
            console.log(`Successfully loaded ${qaData.length} QA items`);
            setEmbeddingsData(qaData);
            
            const undifined = qaData.filter(item => item.id === "2");
            if (undifined[0]?.foreign){
                setUndefinedAnswer(undifined[0].foreign);
            }
        } catch (error) {
            console.error("loadQAData error:", error);
            return null;
        } 
    }

    async function loadEventData(attribute:string, code:string){        
        const eventRef = doc(db, "Events", attribute);
        const event = attribute.split("-")[1]
        
        try {
            const eventSnap = await getDoc(eventRef);
            if (eventSnap.exists()) {
                const data = eventSnap.data()
                const memocode = data.code
                if (memocode == code){
                    const event_data:EventData = {
                        id:attribute,
                        name:event,
                        image:data.image,
                        languages:data.languages,
                        voiceSetting:data.voiceSetting,
                        voiceNumber:data.voiceNumber,
                        embedding:data.embedding,
                        qaData:data.qaData,
                        code:data.code,
                        langStr:"",
                        prompt:data.prompt,
                        gpt:data.gpt
                    }
                    
                    // UI要素を先に設定（ユーザー体験の向上）
                    setEventData(event_data)
                    setInitialSlides(data.image.url)
                    setSlides(Array(1).fill(data.image.url))
                    
                    loadQAData(attribute)
                    if (data.image.name === "AI-con_man_01.png"){
                        setThumnail("/AICON-m.png")
                    } else if (data.image.name === "AI-con_man2_01.png"){
                        setThumnail("/AICON-m2.png")
                    } else if (data.image.name === "AI-con_woman_01.png"){
                        setThumnail("/AICON-w.png")
                    } else if (data.image.name === "AI-con_woman2_01.png"){
                        setThumnail("/AICON-w2.png")
                    } else {
                        setThumnail("")
                    }
                    
                } else {
                    alert("QRコードをもう一度読み込んでください")
                }
            } else {
                alert("イベントが登録されていません")
            }
        } catch (error) {
            console.log(error)
        }
    }

    const saveMessage = async (userMessage:Message2, message:Message2, attr:string) => {
        const judge = message.text.endsWith("QA情報 2")
        const data = {
            id:userMessage.id,
            user:userMessage.text,
            aicon:message.text,
            unanswerable:judge
        }
        setHistory(prev => [...prev, data])
        await setDoc(doc(db, "Events",attr, "Conversation", convId), {conversations: arrayUnion(data), date:userMessage.id}, {merge:true})
    }


    const createConvField = async (attr:string) => {
        const date = new Date()
        const offset = date.getTimezoneOffset() * 60000
        const localDate = new Date(date.getTime() - offset)
        const now = localDate.toISOString()

        setConvId(now)
    }

    const getLanguageList = () => {
        if (eventData?.languages){
            const langs = eventData.languages.map((item) => {return nativeName[item as keyof typeof nativeName]})
            const langs2 = ["",...langs]
            setLangList(langs2)            
        }
    }

    const randomStr = (length:number) => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
    
    const talkStart = async () => {
        if (dLang === ""){
            alert("使用する言語を選択してください。Please select your language")
            return
        }
        createConvField(attribute!)
        if (audioRef.current){
            audioRef.current.pause()
            audioRef.current.currentTime = 0
        }
        audioPlay()
        setWavReady(true)
        const date = new Date()
        const offset = date.getTimezoneOffset() * 60000
        const localDate = new Date(date.getTime() - offset)
        const now = localDate.toISOString()
        if (startText){
            const cacheKey = `${eventData!.voiceNumber}-${startText.foreign[language].trim()}`;
            let voiceData: VoiceData | null = voiceCache.get(cacheKey) || null;
            if (!voiceData) {
                // キャッシュにない場合はFirestoreから取得
                voiceData = await getVoiceData(startText.foreign[language], language, eventData!.voiceNumber);
                if (voiceData) {
                    // キャッシュに保存
                    setVoiceCache(prev => new Map(prev).set(cacheKey, voiceData!));
                }
            }
            if (voiceData){
                setWavUrl(voiceData.url)
                setTimeout(() => {
                    const aiMessage: Message2 = {
                        id: now,
                        text: startText.foreign[language],
                        sender: 'AIcon',
                        modalUrl:"",
                        modalFile:"",
                        source:null,
                        thumbnail: thumbnail
                    };
                    setMessages(prev => [...prev, aiMessage])
                    const sl = createSlides(voiceData.duration)
                    setSlides(sl)
                }, 2500);
            }
        }
    }

    const audioPlay = () => {
        if (audioRef.current) {
            audioRef.current.play().catch((error) => {
                console.error('音声再生エラー:', error);
            });
        }
    }

    const inputClear = async () => {
        await sttStop()
        setUserInput("")
    }

    const clearSilenceTimer = () => {
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
    };

    const scheduleSilenceStop = () => {
        clearSilenceTimer();
        silenceTimerRef.current = setTimeout(() => sttStop(), 4000);
    };

    const sttStatus = {
        listening: listening,
        audioRef: audioRef.current,
        currentTime:audioRef.current?.currentTime
    }

    const sttStart = async() => {
        console.log("sttStatus1",sttStatus)
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        if (!browserSupportsSpeechRecognition) {
            alert('このブラウザは音声認識をサポートしていません')
            return
        }
        try {
            if (listening) {
                await SpeechRecognition.stopListening()
                resetTranscript()
            }
            setUserInput("")
            setRecord(true)

            const langCode = foreignLanguages[language] || "ja-JP";
            await SpeechRecognition.startListening({ 
                language: langCode, 
                continuous: false,
                interimResults: true
            });
        } catch(error) {
            console.error('音声認識の開始に失敗:', error)
            setRecord(false)
            //setIsListening(false)
        }
    }

    const sttStop = async () => {
        setRecord(false)
        try {
            if (listening) {
                await SpeechRecognition.stopListening()
                resetTranscript()
                setRecord(false)
            }
        } catch(error) {
            console.error('音声認識の停止に失敗:', error)
            setRecord(false)
            //setIsListening(false)
        }
    }

    const selectLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const lang = e.target.value
        setDLang(lang)
        const jLang = japaneseName[lang as keyof typeof japaneseName]
        setLanguage(jLang);
    }

    const closeApp = async () => {
        await sttStop()
        window.location.reload()
    }

    useEffect(() => {
        return () => {
            clearSilenceTimer();
        };
    }, []);

    useEffect(() => {
        const updateHeight = () => {
            setWindowHeight(window.innerHeight);
          };
      
          updateHeight(); // 初期値設定
          window.addEventListener("resize", updateHeight);

        return () => {
            window.removeEventListener("resize", updateHeight);
            if (intervalRef.current !== null){
                clearInterval(intervalRef.current);
                intervalRef.current = null// コンポーネントがアンマウントされたらタイマーをクリア
            }
            sttStop()
        };
    },[])

    useEffect(() => {
        if (attribute && code){
            loadEventData(attribute, code)
        }        
    }, [attribute, code])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, [messages]);

    useEffect(() => {
        if (eventData){
            getLanguageList()
            console.log(eventData)
            //setInitialSlides(eventData?.image.url)
            
        }
    }, [eventData])
    
    useEffect(() => {
        const sText = embeddingsData.filter((item) => item.id === "1")
        const undefind = embeddingsData.filter((item) => item.id === "2")
        if (sText.length>0){
            setStartText(sText[0])
        }
        if (undefind.length>0){
            setUndefindQA(undefind[0])
        }
    }, [embeddingsData])

    useEffect(() => {
        if (Array.isArray(slides) && slides.length>1 && wavUrl!= no_sound){
            audioPlay()
            setCurrentIndex(0)
            if (intervalRef.current !== null) {//タイマーが進んでいる時はstart押せないように//2
                return;
            }
            intervalRef.current = setInterval(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % (slides.length))
            }, 250)
        }
    }, [slides])

    useEffect(() => {
        if (Array.isArray(slides)){
            if (currentIndex === slides.length-2 && currentIndex !== 0){
                const s = initialSlides
                setCurrentIndex(0)
                if (audioRef.current){
                    audioRef.current.pause()
                    audioRef.current.currentTime = 0
                }

                //setWavUrl(no_sound)
                setSlides(Array(1).fill(initialSlides))
                if (intervalRef.current !== null){
                    clearInterval(intervalRef.current);
                    intervalRef.current = null
                }
            }
        }
    }, [currentIndex]);


    useEffect(() => {
        setUserInput(transcript)
    }, [transcript])

    useEffect(() => {
        if (userInput.length !== 0){
            setCanSend(true)
        } else {
            setCanSend(false)
        }
    }, [userInput])

    /*
    useEffect(() => {
        console.log("record", record)
    }, [record])
    */

    useEffect(() => {
        if (listening === false && userInput === "") {
            setRecord(false);
            if (audioRef.current) {
                // デバイスのボリュームに追随
                audioRef.current.volume = 1.0;
            }
        }
    }, [listening]);

    // 音声ファイルの読み込み完了時の処理
    /*
    useEffect(() => {
        const handleCanPlay = () => {
            if (audioRef.current) {
                audioRef.current.volume = 1.0;
            }
        };

        const audioElement = audioRef.current;
        if (audioElement) {
            audioElement.addEventListener('canplay', handleCanPlay);
        }

        return () => {
            if (audioElement) {
                audioElement.removeEventListener('canplay', handleCanPlay);
            }
        };
    }, []);
*/
    return (
        <div className="flex flex-col w-full overflow-hidden" style={{ height: windowHeight || "100dvh" }}>
        {wavReady ? (
        <div className="fixed inset-0 flex flex-col items-center h-full bg-stone-200">
            <div className="flex-none h-[35vh] w-full mb-5">
                {Array.isArray(slides) && (<img className="mx-auto h-[35vh] " src={slides[currentIndex]} alt="Image" />)}
            </div>
            <div className="flex-none h-[32vh] w-11/12 max-w-96 overflow-auto">
            {messages.map((message) => (
                <div 
                    key={message.id} 
                    className={`mt-2 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div 
                    className={`max-w-xs p-3 rounded-lg ${
                        message.sender === 'user' 
                        ? 'bg-blue-500 text-white rounded-br-none text-xs' 
                        : 'bg-yellow-50 rounded-bl-none shadow text-xs'
                    }`}
                    >
                    <div className="flex flex-row gap-x-4 justify-center">
                    {message.sender === 'AIcon' && message.thumbnail && (
                        <img src={message.thumbnail} alt="AI Character" className="w-8 h-8 rounded-full" />
                    )}
                    <p>{message.text}</p>
                    </div>
                    {message.modalUrl && <img src={message.modalUrl} alt={message.modalFile??"image"} className="mt-2 w-24 h-24 mx-auto hover:cursor-pointer" onClick={() => {setIsModal(true); setModalUrl(message.modalUrl); setModalFile(message.modalFile)}} />}
                    {isModal && (<Modal setIsModal={setIsModal} modalUrl={modalUrl} modalFile={modalFile} />)}
                    </div>
                </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="flex-none h-[18%] w-full max-w-96 overflow-auto">
            <div className="mt-2">
            <textarea className="block w-5/6 max-w-96 mx-auto mb-2 px-2 py-2 text-base"
                name="message"
                placeholder="質問内容(question)"
                rows={2}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
            />
            <div  className="flex flex-row gap-x-4 justify-center">
            {!record ?(     
                <button className="flex items-center mr-5 mx-auto border-2 border-sky-600 p-2 text-sky-800 bg-white text-xs rounded" disabled={!wavReady} onClick={sttStart}>
                <Mic size={16} />
                音声入力(mic)
                </button>
            ):(
                <button className="flex items-center mr-5 mx-auto text-xs border-2 bg-pink-600 text-white p-2 rounded" onClick={inputClear}>
                <Eraser size={16} />
                クリア(clear)
                </button>)}
            {canSend ? (
                <button className="flex items-center ml-5 mx-auto border-2 bg-sky-600 text-white p-2 text-xs rounded" onClick={() => {getAnswer()}}>
                <Send size={16} />
                送信(send)
                </button>):(
                <button className="flex items-center ml-5 mx-auto border-2 bg-slate-200 text-slate-400 p-2 text-xs rounded">
                <Send size={16}/>
                送信(send)
                </button>
                )}
                </div>
                {isModal && (
                    <Modal setIsModal={setIsModal} modalUrl={modalUrl} modalFile={modalFile}/>
                )}
                </div>
            </div>
        </div>):(
            <div className="flex flex-col h-screen bg-stone-200">
            <button className="w-2/3 bg-cyan-500 hover:bg-cyan-700 text-white mx-auto mt-24 px-4 py-2 rounded" disabled={!eventData} onClick={() => {talkStart()}}>
                <div className="text-2xl font-bold">ai concierge</div>
                <div>click to start</div>
            </button>
            {eventData ? (
                <div className="flex flex-col">
                    <div className="mx-auto mt-32 text-sm">使用言語(language)</div>
                    <select className="mt-3 mx-auto text-sm w-36 h-8 text-center border-2 border-lime-600" value={dLang} onChange={selectLanguage}>
                        {langList.map((lang, index) => {
                        return <option className="text-center" key={index} value={lang}>{lang}</option>;
                        })}
                    </select>
                </div>
            ):(
                <div className="flex flex-row gap-x-4 mx-auto mt-32">
                <LoaderCircle size={24} className="text-slate-500 animate-spin" />
                <p className="text-slate-500">データ読み込み中(Data Loading...)</p>
                </div>
            )}
            <button className="mt-auto mb-32 text-blue-500 hover:text-blue-700 text-sm">はじめにお読みください</button>
            </div>            
            )}
                        {wavReady && (
            <div className="flex flex-row w-20 h-6 bg-white hover:bg-gray-200 p-1 rounded-lg shadow-lg relative ml-auto mr-3 mt-5 mb-auto" onClick={() => closeApp()}>
            <X size={16} />
            <div className="text-xs">終了する</div>
            </div>
            )}
            <audio key={wavUrl} src={wavUrl} ref={audioRef} playsInline preload="auto"/>
        </div>
    );
}
