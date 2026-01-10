//SpeechRecognition新バージョン
"use client"
import "regenerator-runtime";
import React from "react";
import { useSearchParams as useSearchParamsOriginal } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, Send, Eraser, X, LoaderCircle, CircleStop, Volume2, VolumeX } from 'lucide-react';
import { db } from "@/firebase";
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, arrayUnion, increment } from "firebase/firestore";
import Modal from "../../components/modalModal"
import getVoiceData from "@/app/func/getVoiceData";
import {Message2, EmbeddingsData, EventData, VoiceData, ForeignAnswer} from "@/types"
import { realtimeVoice } from "@/app/func/realtimeVoice";
type LanguageCode = 'ja-JP' | 'en-US' | 'zh-CN' | 'zh-TW' | 'ko-KR' | 'fr-FR' | 'pt-BR' | 'es-ES'
type AudioContextCtor = new (opts?: AudioContextOptions) => AudioContext
//const no_sound = "https://firebasestorage.googleapis.com/v0/b/conciergeproject-1dc77.firebasestorage.app/o/voice%2Fno_sound.wav?alt=media&token=80abe4c5-a52d-40eb-9e6f-23b265fd9d72"

export default function Aicon() {
    const [windowHeight, setWindowHeight] = useState<number>(0)
    const [initialSlides, setInitialSlides] = useState<string|null>(null)
    const [thumbnail, setThumnail] = useState<string|null>("")
    const [userInput, setUserInput] = useState<string>("")
    const [userMessage, setUserMessage] = useState<Message2>({id: "",text: "",sender: 'user',modalUrl:"",modalFile:"",source:null})
    const [messages, setMessages] = useState<Message2[]>([])
    const [history, setHistory] = useState<{user: string, aicon: string}[]>([])
    const [eventData, setEventData] = useState<EventData|null>(null)
    const [langList, setLangList] = useState<string[]>([])
    const [dLang, setDLang] = useState<string>("")//表示用言語
    const [language, setLanguage] = useState<string>("")
    const [embeddingsData, setEmbeddingsData] = useState<EmbeddingsData[]>([])
    const [wavUrl, setWavUrl] = useState<string>("/noSound.wav")
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
    const [undefinedAnswer, setUndefinedAnswer] = useState<ForeignAnswer|null>(null)
    const [voiceCache, setVoiceCache] = useState<Map<string, VoiceData>>(new Map())
    const [isMuted, setIsMuted] = useState<boolean>(false)

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

    //以下WebAudio関連
    const ctxRef = useRef<AudioContext | null>(null);
    const srcRef = useRef<AudioBufferSourceNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const w = typeof window !== 'undefined' ? window as Window & {
        AudioContext?: AudioContextCtor;
        webkitAudioContext?: AudioContextCtor;
    } : {} as Window & {
        AudioContext?: AudioContextCtor;
        webkitAudioContext?: AudioContextCtor;
    };

    const ensureCtx = () => {
        if (!ctxRef.current) {
            const Ctx = w.AudioContext ?? w.webkitAudioContext;
            if (!Ctx) throw new Error('Web Audio API not supported');
            ctxRef.current = new Ctx({ latencyHint: "playback" });
            // GainNodeを作成して音量制御を確実にする
            gainNodeRef.current = ctxRef.current.createGain();
            gainNodeRef.current.connect(ctxRef.current.destination);
            gainNodeRef.current.gain.value = 1.0; // デフォルトは最大音量
        }
        return ctxRef.current!;
      };
    
    /** 初回は必ずユーザー操作内で呼ぶ（クリック直後など） */
    const unlock = async () => {
        const ctx = ensureCtx();
        // 無音1サンプルで解錠
        const buf = ctx.createBuffer(1, 1, 22050);
        const src = ctx.createBufferSource();
        src.buffer = buf; src.connect(ctx.destination); src.start();
        await ctx.resume();
    };

    const stop = () => {
        try { srcRef.current?.stop(0); } catch {}
        srcRef.current = null;
    };

    /** URLの音声をデコードして再生（完了まで待つ） */
    const playUrl = async (url: string) => {
        try {
            const ctx = ensureCtx();
            await ctx.resume(); // iOSでsuspend解除
            stop();

            // iOSでAudioContextが確実にresumeされていることを確認
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            if (isIOS) {
                if (ctx.state === 'suspended') {
                    await ctx.resume();
                }
                // 音声再生前にHTMLAudioElementで無音を再生してスピーカー出力を確実にする
                if (audioRef.current && url !== "/noSound.wav") {
                    try {
                        const originalSrc = audioRef.current.src;
                        audioRef.current.src = '/noSound.wav';
                        audioRef.current.volume = 0.01;
                        await audioRef.current.play();
                        await sleep(50);
                        audioRef.current.pause();
                        audioRef.current.src = originalSrc;
                        audioRef.current.volume = 1.0;
                    } catch (error) {
                        console.error('iOS audio routing setup error:', error);
                    }
                }
            }

            console.log('[playUrl] Fetching audio', { url: url.substring(0, 100) }); // URLの最初の100文字のみログ
            
            // Blob URLの場合は直接fetch、それ以外はaudio-proxy APIを使用
            const isBlobUrl = url.startsWith('blob:');
            let response: Response;
            
            if (isBlobUrl) {
                // Blob URLはブラウザ内でのみ有効なので、直接fetch
                console.log('[playUrl] Using blob URL directly');
                response = await fetch(url, { cache: "no-store" });
            } else {
                // 通常のURL（Firebase Storageなど）はaudio-proxy APIを使用
                console.log("audio-proxy api")
                response = await fetch(`/api/audio-proxy?src=${encodeURIComponent(url)}`, {
                    cache: "no-store",
                });
            }
                
            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Unable to read error response');
                console.error('[playUrl] audio fetch failed:', {
                    status: response.status,
                    statusText: response.statusText,
                    url: url.substring(0, 100),
                    isBlobUrl,
                    errorText: errorText.substring(0, 200)
                });
                throw new Error(`Audio fetch failed: ${response.status} ${response.statusText} - ${errorText.substring(0, 100)}`);
            }
            
            const ab = await response.arrayBuffer();
            if (!ab || ab.byteLength === 0) {
                console.error('audio-proxy: empty arrayBuffer');
                throw new Error('Empty audio data received');
            }
            
            const buffer: AudioBuffer = await new Promise((res, rej) => {
                ctx.decodeAudioData(ab, res, (error) => {
                    console.error('Audio decode error:', error);
                    rej(error);
                });
            });

            const src = ctx.createBufferSource();
            src.buffer = buffer;
            // GainNodeを通して接続することで、音量制御を確実にする
            const gainNode = gainNodeRef.current || ctx.createGain();
            if (!gainNodeRef.current) {
                gainNodeRef.current = gainNode;
                gainNode.connect(ctx.destination);
            }
            src.connect(gainNode);
            
            // 音声再生前に、GainNodeのgain値を確実に設定
            // 音声認識後の問題を回避するため、GainNodeの状態をリセット
            gainNode.gain.cancelScheduledValues(ctx.currentTime);
            gainNode.gain.setValueAtTime(1.0, ctx.currentTime);
            srcRef.current = src;

            await new Promise<void>((resolve) => {
                src.onended = () => { srcRef.current = null; resolve(); };
                src.start(0);
                if (Array.isArray(slides) && slides.length>1 && url != "/noSound.wav"){
                    setCurrentIndex(0)
                    if (intervalRef.current !== null) {//タイマーが進んでいる時はstart押せないように//2
                        return;
                    }
                    intervalRef.current = setInterval(() => {
                        setCurrentIndex((prevIndex) => (prevIndex + 1) % (slides.length))
                    }, 250)
                }
            });
        } catch (error) {
            console.error('playUrl error:', error);
            // エラーが発生しても処理を続行（ユーザー体験を損なわないため）
            // 必要に応じて、エラーメッセージを表示するなどの処理を追加可能
        }
    };

    /** 完全破棄（必要なときだけ） */
    const dispose = async () => {
        stop();
        if (gainNodeRef.current) {
            try {
                gainNodeRef.current.disconnect();
            } catch {}
            gainNodeRef.current = null;
        }
        if (ctxRef.current) {
            try { await ctxRef.current.close(); } catch {}
            ctxRef.current = null;
        }
    }
    //ここまでWebAudio関連

    const sendMessage2 = async () => {
        const date = new Date()
        const offset = date.getTimezoneOffset() * 60000
        const localDate = new Date(date.getTime() - offset)
        const now = localDate.toISOString()
        const userM: Message2 = {
            id: now,
            text: userInput,
            sender: 'user',
            modalUrl:"",
            modalFile:"",
            source:null
        }
        console.log(userM)
        setUserMessage(userM)
        setMessages(prev => [...prev, userM]);
        setCanSend(false)//同じInputで繰り返し送れないようにする

        if (listening){
            if (audioRef.current){
                audioRef.current.muted = true
                //audioRef.current.volume = 0
                setWavUrl("/noSound.wav")
                audioRef.current.play().then(async () => {
                    await sttStop()
                    audioRef.current!.muted = false
                    // iOSでオーディオルーティングが確実に切り替わるように待機
                    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                    if (isIOS) {
                        await sleep(200); // 追加の待機時間
                    }
                    await getAnswer(userM)
                })
            }
        } else {
            await getAnswer(userM)
        }
    }

    const micStreamRef = useRef<MediaStream | null>(null);
    const openMic = async () => {
        // 既存があれば一旦閉じる
        //closeMic();
        micStreamRef.current = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
        });
    };
    const closeMic = () => {
        if (micStreamRef.current) {
          micStreamRef.current.getTracks().forEach(t => t.stop()); // ★これが肝心
          micStreamRef.current = null;
        }
      };

    const useSearchParams = ()  => {
        const searchParams = useSearchParamsOriginal();
        return searchParams;
    }
    const searchParams = useSearchParams()
    const attribute = searchParams.get("attribute")
    const code = searchParams.get("code")

    async function getAnswer(userM:Message2) {    
        console.log("sttStatus2",sttStatus)  
        //closeMic()
        //await sttStop()  
        const date = new Date()
        const offset = date.getTimezoneOffset() * 60000
        const localDate = new Date(date.getTime() - offset)
        const now = localDate.toISOString()
        resetTranscript()
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
                      await saveMessage(userM, aiMessage, attribute!)                    
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
                      await saveMessage(userM, aiMessage, attribute!)
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
                imageArray = ["/AI-con_man_01.png","/AI-con_man_02.png"]
                break;
            case "/AI-con_man2_01.png":
                imageArray = ["/AI-con_man2_01.png","/AI-con_man2_02.png"]
                break;
            case "/AI-con_woman_01.png":
                imageArray = ["/AI-con_woman_01.png","/AI-con_woman_02.png"]
                break;
            case "/AI-con_woman2_01.png":
                imageArray = ["/AI-con_woman2_01.png","/AI-con_woman2_02.png"]
                break;
            default:
                imageArray = Array(2).fill(initialSlides)
                break;
        }
        let imageList:string[] = []
        const n = Math.floor(duration*2)
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
                    alert("QRコードが更新されています。最新のQRコードを読み込んでください")
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
        await setDoc(doc(db, "Events",attr, "Conversation", convId), {conversations: arrayUnion(data), date:userMessage.id, language:language}, {merge:true})
    }


    const createConvField = (attr:string) => {
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
    
    const talkStart = async () => {
        if (dLang === ""){
            alert("使用する言語を選択してください。Please select your language")
            return
        }
        createConvField(attribute!)
        await unlock()

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

    const inputClear = () => {
        resetTranscript()
        setUserInput("")
    }

    const clearSilenceTimer = () => {
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
    };

    /*
    const scheduleSilenceStop = () => {
        clearSilenceTimer();
        silenceTimerRef.current = setTimeout(() => sttStop(), 4000);
    };
    */

    const sttStatus = {
        listening: listening,
        audioRef: audioRef.current,
        currentTime:audioRef.current?.currentTime
    }

    const sttStart = async() => {
        await unlock()
        openMic()
        console.log("sttStatus1",sttStatus)
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

            const langCode = foreignLanguages[language] || "ja-JP";
            await SpeechRecognition.startListening({ 
                language: langCode, 
                continuous: true,
                interimResults: true
            });
        } catch(error) {
            console.error('音声認識の開始に失敗:', error)
        }
    }

    async function waitUntil(pred: () => boolean, timeoutMs: number) {
        const start = Date.now();
        while (!pred()) {
          if (Date.now() - start > timeoutMs) return false;
          await new Promise(r => setTimeout(r, 50));
        }
        return true;
      }

    function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

    const sttStop = async () => {
        const softWaitMs = 800
        const hardWaitMs = 600
        const cooldownMs = 1000
        
        try {
            await SpeechRecognition.stopListening();
            const softOk = await waitUntil(() => !listening, softWaitMs);
            console.log("softOK", softOk)
            if (!softOk && typeof SpeechRecognition.abortListening === "function") {
                SpeechRecognition.abortListening();
                console.log("aborting")
                await waitUntil(() => !listening, hardWaitMs);
            }
            await sleep(cooldownMs)
            
            closeMic()
            
            // iOSで音声出力をスピーカーに戻すための処理
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            if (isIOS) {
                try {
                    // AudioContextがsuspended状態の場合はresume
                    if (ctxRef.current && ctxRef.current.state === 'suspended') {
                        await ctxRef.current.resume();
                    }
                    // GainNodeの状態をリセット（音声認識後の問題を回避）
                    if (gainNodeRef.current && ctxRef.current) {
                        gainNodeRef.current.gain.cancelScheduledValues(ctxRef.current.currentTime);
                        gainNodeRef.current.gain.setValueAtTime(1.0, ctxRef.current.currentTime);
                    }
                    // HTMLAudioElementで無音を短く再生してスピーカー出力を強制
                    if (audioRef.current) {
                        try {
                            const originalSrc = audioRef.current.src;
                            audioRef.current.src = '/noSound.wav';
                            audioRef.current.volume = 0.01; // ほぼ無音だが、オーディオルーティングを確立
                            await audioRef.current.play();
                            await sleep(100); // 短い待機時間
                            audioRef.current.pause();
                            audioRef.current.src = originalSrc; // 元のsrcに戻す
                            audioRef.current.volume = 1.0; // 音量を戻す
                        } catch (error) {
                            console.error('iOS audio routing reset: audioRef error:', error);
                        }
                    }
                } catch (error) {
                    console.error('iOS audio routing reset error:', error);
                }
            } else {
                // iOS以外でも、GainNodeの状態をリセット
                if (ctxRef.current && gainNodeRef.current) {
                    gainNodeRef.current.gain.cancelScheduledValues(ctxRef.current.currentTime);
                    gainNodeRef.current.gain.setValueAtTime(1.0, ctxRef.current.currentTime);
                }
            }
        } catch(error) {
            console.error('音声認識の停止に失敗:', error)
        }
    }

    const selectLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const lang = e.target.value
        setDLang(lang)
        const jLang = japaneseName[lang as keyof typeof japaneseName]
        setLanguage(jLang);
    }

    const closeApp = async () => {
        sttStop().catch((error) => {
            console.error('sttStop error in closeApp:', error);
        });
        
        // 少し待ってからリロード（確実に実行されるように）
        setTimeout(() => {
            if (typeof window !== 'undefined') {
                window.location.reload()
            }
        }, 100);
    }

    useEffect(() => {
        return () => {
            clearSilenceTimer();
        };
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return; // サーバーサイドでは実行しない
        
        const updateHeight = () => {
            setWindowHeight(window.innerHeight);
        };
    
        updateHeight(); // 初期値設定
        window.addEventListener("resize", updateHeight);
    
        return () => {
            window.removeEventListener("resize", updateHeight);
            if (intervalRef.current !== null){
                clearInterval(intervalRef.current);
                intervalRef.current = null
            }
            sttStop()
        };
    }, []);

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

    // ミュート/アンミュート関数
    const toggleMute = () => {
        if (!ctxRef.current || !gainNodeRef.current) return;
        
        const ctx = ctxRef.current;
        const gainNode = gainNodeRef.current;
        
        if (isMuted) {
            // アンミュート: gain値を1.0に設定
            gainNode.gain.cancelScheduledValues(ctx.currentTime);
            gainNode.gain.setValueAtTime(1.0, ctx.currentTime);
            setIsMuted(false);
        } else {
            // ミュート: gain値を0に設定して完全消音
            gainNode.gain.cancelScheduledValues(ctx.currentTime);
            gainNode.gain.setValueAtTime(0, ctx.currentTime);
            setIsMuted(true);
        }
    };


    useEffect(() => {
        if (Array.isArray(slides) && slides.length>1 && wavUrl!= "/noSound.wav"){
            playUrl(wavUrl)
            setCurrentIndex(0)
            if (intervalRef.current !== null) {//タイマーが進んでいる時はstart押せないように//2
                return;
            }
            /*
            intervalRef.current = setInterval(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % (slides.length))
            }, 250)
            */
        }
    }, [slides])




    useEffect(() => {
        if (Array.isArray(slides)){
            if (currentIndex === slides.length-2 && currentIndex !== 0){
                //const s = initialSlides
                setCurrentIndex(0)
                setWavUrl("/noSound.wav")

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
        if (userInput.length !== 0 && currentIndex == 0 && !listening){
            setCanSend(true)
        } else {
            setCanSend(false)
        }
    }, [userInput])

    useEffect(() => {
        if (userInput.length !== 0 && currentIndex == 0 && wavUrl == "/noSound.wav" && !listening){
            setCanSend(true)
        } else {
            setCanSend(false)
        }
    }, [wavUrl])

    useEffect(() => {
        if (!listening && userInput.length !== 0 && currentIndex == 0){
            setCanSend(true)
        } else {
            setCanSend(false)
        }
    }, [listening])
 
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
                    {message.modalUrl && message.modalFile.includes(".pdf") && <img src={"/document.png"} alt={"PDF"} className="mt-2 w-24 h-6 mx-auto hover:cursor-pointer" onClick={() => {setIsModal(true); setModalUrl(message.modalUrl); setModalFile(message.modalFile)}} />}
                    {message.modalUrl && !message.modalFile.includes(".pdf") && <img src={message.modalUrl} alt={message.modalFile??"Image"} className="mt-2 w-24 h-24 mx-auto hover:cursor-pointer" onClick={() => {setIsModal(true); setModalUrl(message.modalUrl); setModalFile(message.modalFile)}} />}
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
            {!listening && userInput ==="" ?(     
                <button className="flex items-center mx-auto border-2 border-sky-600 p-2 text-sky-800 bg-white text-xs rounded" disabled={currentIndex > 0} onClick={sttStart}>
                <Mic size={16} />
                音声入力(mic)
                </button>
            ):!listening && userInput !=="" ?(
                <button className="flex items-center mx-auto text-xs border-2 bg-gray-600 text-white p-2 rounded" onClick={() => inputClear()}>
                <Eraser size={16} />
                クリア(clear)
                </button>
            ):(<button className="flex items-center mx-auto text-xs border-2 bg-pink-600 text-white p-2 rounded" onClick={async() => {await sttStop()}}>
            <CircleStop size={16} />
            入力停止(stop)
            </button>)}

            {canSend ? (
                <button className="flex items-center ml-5 mx-auto border-2 bg-sky-600 text-white p-2 text-xs rounded" onClick={async() => {await sendMessage2()}}>
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
                 <div className="flex flex-col items-end gap-2 relative ml-auto mr-3 mt-5 mb-auto">
                     <div className="flex flex-row items-center justify-center w-24 h-6 bg-white hover:bg-gray-200 p-1 rounded-lg shadow-lg cursor-pointer" onClick={() => closeApp()}>
                         <X size={16} />
                         <div className="text-xs">終了する</div>
                     </div>
                     <button 
                         className={`flex items-center justify-center mt-5 w-24 h-6 border-2 p-1 rounded-lg shadow-lg text-xs ${
                             isMuted 
                                 ? 'bg-red-500 hover:bg-red-600 text-white border-red-600' 
                                 : 'bg-green-500 hover:bg-green-600 text-white border-green-600'
                         }`}
                         onClick={toggleMute}
                         title={isMuted ? '音声ON' : '音声OFF'}
                     >
                         {isMuted ? (
                             <>
                                 <VolumeX size={16} className="mr-1" />
                                 <span>音声OFF</span>
                             </>
                         ) : (
                             <>
                                 <Volume2 size={16} className="mr-1" />
                                 <span>音声ON</span>
                             </>
                         )}
                     </button>       
                 </div>)}
            <audio key={wavUrl} src={wavUrl} ref={audioRef} playsInline preload="auto"/>
        </div>
    );
};
