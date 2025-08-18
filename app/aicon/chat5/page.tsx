//音声入力・AIボイスあり
"use client"
import "regenerator-runtime";
import React from "react";
import { useSearchParams as useSearchParamsOriginal } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk"
//import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, Send, Eraser, Paperclip, X } from 'lucide-react';
import { db } from "@/firebase";
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import Modal from "../../components/modalModal"
import getVoiceData from "@/app/func/getVoiceData";
import {Message2, EmbeddingsData, EventData, VoiceData, ForeignAnswer} from "@/types"
import { realtimeVoice } from "@/app/func/realtimeVoice";
type LanguageCode = 'ja-JP' | 'en-US' | 'zh-CN' | 'zh-TW' | 'ko-KR' | 'fr-FR' | 'pt-BR' | 'es-ES'

const no_sound = "https://firebasestorage.googleapis.com/v0/b/conciergeproject-1dc77.firebasestorage.app/o/voice%2Fno_sound.wav?alt=media&token=72bc4be8-0172-469b-a38c-0e318fe91bee"

export default function Aicon() {
    const [windowHeight, setWindowHeight] = useState<number>(0)
    const [thumbnail, setThumnail] = useState<string>("/AICON-w.png")
    const [userInput, setUserInput] = useState<string>("")
    const [messages, setMessages] = useState<Message2[]>([])
    const [history, setHistory] = useState<{user: string, aicon: string}[]>([])
    const [eventData, setEventData] = useState<EventData|null>(null)
    const [langList, setLangList] = useState<string[]>([])
    const [dLang, setDLang] = useState<string>("日本語")//表示用言語
    const [language, setLanguage] = useState<string>("日本語")
    const [embeddingsData, setEmbeddingsData] = useState<EmbeddingsData[]>([])
    const [wavUrl, setWavUrl] = useState<string>(no_sound);
    const [wavReady, setWavReady] = useState<boolean>(false)
    const [record,setRecord] = useState<boolean>(false)
    const [canSend, setCanSend] = useState<boolean>(false)
    const [isModal, setIsModal] = useState<boolean>(false)
    const [modalUrl, setModalUrl] = useState<string|null>(null)
    const [modalFile, setModalFile] = useState<string|null>(null)
    const [convId, setConvId] = useState<string>("")
    const [startText, setStartText] = useState<EmbeddingsData|null>(null)
    const [undefindQA, setUndefindQA] = useState<EmbeddingsData|null>(null)

    const [recognizing, setRecognizing] = useState<boolean>(false)
    const [interim, setInterim] = useState<string>("")
    const [finalTranscript, setFinalTranscript] = useState<string>("")
    const [undefinedAnswer, setUndefinedAnswer] = useState<ForeignAnswer|null>(null)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const nativeName = {"日本語":"日本語", "英語":"English","中国語（簡体）":"简体中文","中国語（繁体）":"繁體中文","韓国語":"한국어","フランス語":"Français","スペイン語":"Español","ポルトガル語":"Português"}
    const japaneseName = {"日本語":"日本語", "English":"英語","简体中文":"中国語（簡体）","繁體中文":"中国語（繁体）","한국어":"韓国語","Français":"フランス語","Español":"スペイン語","Português":"ポルトガル語"}
    
    const foreignLanguages: Record<string, LanguageCode> = {"日本語": "ja-JP","英語": "en-US","中国語（簡体）": "zh-CN","中国語（繁体）": "zh-TW","韓国語": "ko-KR","フランス語": "fr-FR","ポルトガル語": "pt-BR","スペイン語": "es-ES"}
    const audioRef = useRef<HTMLAudioElement>(null)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const recognizerRef = useRef<SpeechSDK.SpeechRecognizer | null>(null)
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)

    const useSearchParams = ()  => {
        const searchParams = useSearchParamsOriginal();
        return searchParams;
    }
    const searchParams = useSearchParams()
    const attribute = searchParams.get("attribute")
    const code = searchParams.get("code")

    async function getAnswer() {        
        setCanSend(false)//同じInputで繰り返し送れないようにする
        setModalUrl(null)
        setModalFile(null)
  
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

        try {
            const response1 = await fetch("/api/embedding2", {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({ input: userInput, model: eventData?.embedding ?? "text-embedding-3-small", language: language }),
            });
            setUserInput("")
            const data1 = await response1.json();
            if (response1.status !== 200) {
              throw data1.error || new Error(`Request failed with status ${response1.status}`);
            }
            //const translatedQuestion = data1.input
            const similarityList = findMostSimilarQuestion(data1.embedding)
            const refQA = chooseQA(similarityList, 3)
            const undefined = undefinedAnswer?.[language] || "申し訳ありません。回答できない質問です。"
            const response = await fetch("/api/concierge", {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({ question: userInput, model: eventData!.gpt, prompt: eventData!.prompt, refQA: refQA, history: history, language: language, undefined:undefined }),
            });
            const data = await response.json();
            const answer = data.answer.trim()
            console.log(answer)
            const voiceData = await realtimeVoice(answer,language,1)
            setWavUrl(voiceData.url)
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
        const similarities = embeddingsData.map((item) => ({
            id: item.id,
            question: item.question,
            answer: item.answer,
            similarity: cosineSimilarity(inputVector, item.vector)
          }));
        similarities.sort((a, b) => b.similarity - a.similarity);

        // 最も類似度の高いベクトルの情報を返す
        return similarities;
    }

    const chooseQA = (similarities:{id:string, question:string, answer:string, similarity:number}[], count:number) => {
        let QAs = ""
        for (let i = 0; i < count; i++){
            const QA = `id:${similarities[i].id} - Q:${similarities[i].question} - A:${similarities[i].answer}\n`
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

    async function loadQAData(attr:string){
        console.log("loadQAData")
        try {
            const querySnapshot = await getDocs(collection(db, "Events",attr, "QADB"));
            const qaData = querySnapshot.docs.map((doc) => {
                const data = doc.data();
                const embeddingsArray = binaryToList(data.vector)
                const embeddingsData = {
                    id:doc.id,
                    vector: embeddingsArray,
                    question:data.question,
                    answer:data.answer,
                    modalUrl:data.modalUrl,
                    modalFile:data.modalFile,
                    foreign:data.foreign,
                }
                return embeddingsData
            })
            console.log(qaData)
            setEmbeddingsData(qaData)
            const undifined = qaData.filter(item => item.id === "2")
            if (undifined[0].foreign){
                setUndefinedAnswer(undifined[0].foreign)
            }
        } catch {
            return null
        }
    }

    async function loadEventData(attribute:string, code:string){
        console.log("event", attribute)
        const eventRef = doc(db, "Events", attribute);
        const event = attribute.split("-")[1]
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
                    prompt:data.prompt2,
                    gpt:data.gpt
                }
                setEventData(event_data)
                loadQAData(attribute)
            } else {
                alert("QRコードをもう一度読み込んでください")
            }
        } else {
            alert("イベントが登録されていません")
        }
    }

    const saveMessage = async (userMessage:Message2, message:Message2, attr:string) => {
        const data = {
            id:userMessage.id,
            user:userMessage.text,
            aicon:message.text
        }
        setHistory(prev => [...prev, data])
        await updateDoc(doc(db, "Events",attr, "Conversation", convId), {conversations: arrayUnion(data)})
    }


    const createConvField = async (attr:string) => {
        const date = new Date()
        const offset = date.getTimezoneOffset() * 60000
        const localDate = new Date(date.getTime() - offset)
        const isoString = localDate.toISOString().split('T')[0]
        const random = randomStr(6)
        const now = localDate.toISOString()

        const convId = `${isoString}_${random}`
        setConvId(convId)
        await setDoc(doc(db,"Events",attr,"Conversation",convId), {conversations:[], langage:language, date:now})
    }

    const getLanguageList = () => {
        if (eventData?.languages){
            const langs = eventData.languages.map((item) => {return nativeName[item as keyof typeof nativeName]})
            setLangList(langs)
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
        audioPlay()
        setWavReady(true)
        const date = new Date()
        const offset = date.getTimezoneOffset() * 60000
        const localDate = new Date(date.getTime() - offset)
        const now = localDate.toISOString()
        console.log("startText",startText)
        if (startText){
            const voiceData: VoiceData | null = await getVoiceData(startText.answer, language, eventData!.voiceNumber)
            console.log("voiceData", voiceData)
            if (voiceData){
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
                    setWavUrl(voiceData.url)
                }, 1500);
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

    const inputClear = () => {
        sttStop()
        setUserInput("")
        setFinalTranscript("")
        setInterim("")
    }

    const clearSilenceTimer = () => {
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
    };

    const scheduleSilenceStop = () => {
        clearSilenceTimer();
        silenceTimerRef.current = setTimeout(() => stopRecognition(), 4000);
    };

    const startRecognition = (langCode:string) => {
        if (recognizerRef.current) return;

        const speechKey = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY!;
        const serviceRegion = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION!;
        const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(speechKey, serviceRegion);
        speechConfig.speechRecognitionLanguage = langCode
        speechConfig.setProperty(SpeechSDK.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, "3000")
        speechConfig.setProperty(SpeechSDK.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs,"2000")

        const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
        const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

        recognizer.recognizing = (_s, e) => {
            setInterim(e.result.text);
            //clearSilenceTimer()
        };

        recognizer.recognized = (_s, e) => {
            if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech && e.result.text) {
            setFinalTranscript((prev) => prev + e.result.text + " ");
            }
            setInterim("");
        };

        recognizer.canceled = (_s, e) => {
            console.error("Recognition canceled:", e);
            stopRecognition();
        };

        recognizer.sessionStopped = () => {
            stopRecognition();
        };

        recognizer.startContinuousRecognitionAsync(
            () => {
            recognizerRef.current = recognizer;
            setRecognizing(true);
            }
        );
    };
    
    const stopRecognition = () => {
        const recognizer = recognizerRef.current;
        clearSilenceTimer();
        if (!recognizer) return;

        recognizer.stopContinuousRecognitionAsync(
            () => {
            recognizer.close();
            recognizerRef.current = null;
            setRecognizing(false);
            }
        );
    };

    const sttStart = () => {
        clearSilenceTimer()
        setUserInput("")
        setFinalTranscript("")
        setInterim("")       
        setRecord(true)
        if (audioRef.current) {
            audioRef.current.pause();
        }
        const langCode = foreignLanguages[language] || "ja-JP"
        startRecognition(langCode)
        scheduleSilenceStop()
    }

    const sttStop = () => {
        setRecord(false)
        stopRecognition()
    }

    const selectLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const lang = e.target.value
        setDLang(lang)
        const jLang = japaneseName[lang as keyof typeof japaneseName]
        setLanguage(jLang);
    }

    useEffect(() => {
        console.log("wavUrl", wavUrl)
        if (wavUrl !== no_sound){
            audioPlay()
        }
    }, [wavUrl])
        
    useEffect(() => {
        return () => {
            clearSilenceTimer();
            if (recognizerRef.current) {
            recognizerRef.current.close();
            }
        };
    }, []);

    useEffect(() => {
        if (recognizing){
            setRecord(true)
        } else {
            setRecord(false)
        }
    }, [recognizing])

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
            stopRecognition()
        };
    },[])

    useEffect(() => {
        if (attribute && code){
            loadEventData(attribute, code)
            createConvField(attribute)
        }        
    }, [attribute, code])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, [messages]);

    useEffect(() => {
        if (eventData){
            getLanguageList()
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
        setUserInput(finalTranscript + interim)
    }, [finalTranscript, interim])

    useEffect(() => {
        clearSilenceTimer()
        if (userInput.length !== 0){
            setCanSend(true)
        } else {
            setCanSend(false)
        }
        if (recognizing){
            scheduleSilenceStop()
        }
    }, [userInput])

    // 音声ファイルの読み込み完了時の処理
    useEffect(() => {
        const handleCanPlay = () => {
            if (audioRef.current) {
                // デバイスのボリュームに追随
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

    return (
        <div className="flex flex-col w-full overflow-hidden" style={{ height: windowHeight || "100dvh" }}>
        {wavReady ? (
        <div className="fixed inset-0 flex flex-col items-center h-full bg-stone-200">
            <div className="my-2 text-lg font-bold text-center">ai concierge</div>
            <div className="flex-none h-[64vh] w-11/12 max-w-96 overflow-auto">
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
            <textarea className="block w-5/6 max-w-96 mx-auto mb-2 px-2 py-2 text-xs"
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
            <button className="w-2/3 bg-cyan-500 hover:bg-cyan-700 text-white mx-auto mt-24 px-4 py-2 rounded" onClick={() => {talkStart()}}>
                <div className="text-2xl font-bold">ai concierge</div>
                <div>start</div>
            </button>
            <div className="mx-auto mt-32 text-sm">使用言語(language)</div>
            <select className="mt-3 mx-auto text-sm w-36 h-8 text-center border-2 border-lime-600" value={dLang} onChange={selectLanguage}>
                {langList.map((lang, index) => {
                return <option className="text-center" key={index} value={lang}>{lang}</option>;
                })}
            </select>
            <button className="mt-auto mb-32 text-blue-500 hover:text-blue-700 text-sm">はじめにお読みください</button>
            </div>            
            )}
            <audio key={wavUrl} src={wavUrl} ref={audioRef} preload="auto"/>
        </div>
    );
}
