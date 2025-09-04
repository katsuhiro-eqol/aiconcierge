//音声入力・AIボイスなし
"use client"
import "regenerator-runtime";
import React from "react";
import { useSearchParams as useSearchParamsOriginal } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Mic, Send, Eraser } from 'lucide-react';
import { db } from "@/firebase";
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import Modal from "../../components/modalModal"
import {Message2, EmbeddingsData, EventData, ForeignAnswer} from "@/types"
type LanguageCode = 'ja-JP' | 'en-US' | 'zh-CN' | 'zh-TW' | 'ko-KR' | 'fr-FR' | 'pt-BR' | 'es-ES'

const no_sound = "https://firebasestorage.googleapis.com/v0/b/conciergeproject-1dc77.firebasestorage.app/o/voice%2Fno_sound.wav?alt=media&token=72bc4be8-0172-469b-a38c-0e318fe91bee"

export default function Aicon4() {
    const [windowHeight, setWindowHeight] = useState<number>(0)
    const [thumbnail, setThumnail] = useState<string>("")
    const [userInput, setUserInput] = useState<string>("")
    const [messages, setMessages] = useState<Message2[]>([])
    const [history, setHistory] = useState<{user: string, aicon: string}[]>([])
    const [eventData, setEventData] = useState<EventData|null>(null)
    const [langList, setLangList] = useState<string[]>([])
    const [dLang, setDLang] = useState<string>("日本語")//表示用言語
    const [language, setLanguage] = useState<string>("日本語")
    const [embeddingsData, setEmbeddingsData] = useState<EmbeddingsData[]>([])

    const [wavReady, setWavReady] = useState<boolean>(false)
    const [canSend, setCanSend] = useState<boolean>(false)
    const [isModal, setIsModal] = useState<boolean>(false)
    const [modalUrl, setModalUrl] = useState<string|null>(null)
    const [modalFile, setModalFile] = useState<string|null>(null)
    const [convId, setConvId] = useState<string>("")
    const [startText, setStartText] = useState<EmbeddingsData|null>(null)
    const [undefinedAnswer, setUndefinedAnswer] = useState<ForeignAnswer|null>(null)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const nativeName = {"日本語":"日本語", "英語":"English","中国語（簡体）":"简体中文","中国語（繁体）":"繁體中文","韓国語":"한국어","フランス語":"Français","スペイン語":"Español","ポルトガル語":"Português"}
    const japaneseName = {"日本語":"日本語", "English":"英語","简体中文":"中国語（簡体）","繁體中文":"中国語（繁体）","한국어":"韓国語","Français":"フランス語","Español":"スペイン語","Português":"ポルトガル語"}
    
    const foreignLanguages: Record<string, LanguageCode> = {"日本語": "ja-JP","英語": "en-US","中国語（簡体）": "zh-CN","中国語（繁体）": "zh-TW","韓国語": "ko-KR","フランス語": "fr-FR","ポルトガル語": "pt-BR","スペイン語": "es-ES"}
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

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
            const refQA = chooseQA(similarityList)
            const undefined = undefinedAnswer?.[language] || "申し訳ありません。回答できない質問です。"   

            //const refQA = `Q:${embeddingsData[similarityList.index].question}--A:${embeddingsData[similarityList.index].answer}`


            const response = await fetch("/api/concierge", {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({ question: userInput, model: eventData!.gpt, prompt: eventData!.prompt, refQA: refQA, history: history, language: language, undefined: undefined }),
            });
            const data = await response.json();
            console.log(data.answer, data.id)

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
        
        // 類似度計算を最適化（上位10件のみ計算）
        const similarities = embeddingsData
            .map((item) => ({
                id: item.id,
                question: item.question,
                answer: item.answer,
                similarity: cosineSimilarity(inputVector, item.vector)
            }))
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 5); // 上位10件のみ保持

        const meaningfulList = similarities.filter(item => item.similarity > 0.5)
        return meaningfulList;
    }

    const chooseQA = (similarities:{id:string, question:string, answer:string, similarity:number}[]) => {
        let QAs = ""
        for (let i = 0; i < similarities.length; i++){
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
                    voiceSetting:data.voiceSetting,
                    voiceNumber:data.voiceNumber,
                    languages:data.languages,
                    embedding:data.embedding,
                    qaData:data.qaData,
                    code:data.code,
                    langStr:"",
                    prompt:data.prompt,
                    gpt:data.gpt
                }
                setEventData(event_data)
                loadQAData(attribute)
                if (data.image.name === "AI-con_man_01.png"){
                    setThumnail("/AICON-m.png")
                } else if (data.image.name === "AI-con_man2_01.png"){
                    setThumnail("/AICON-m2.png")
                } else if (data.image.name === "AI-con_woman_01.png"){
                    setThumnail("/AICON-w.png")
                } else if (data.image.name === "AI-con_woman2_01.png"){
                    setThumnail("/AICON-w2.png")
                } else if (data.image.name === "ai-concierge1_1.png") {
                    setThumnail("/ai-concierge1_1.png")
                } else {
                    setThumnail("")
                }
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
            console.log("languages",eventData?.languages)
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
        //audioPlay()
        setWavReady(true)
        const date = new Date()
        const offset = date.getTimezoneOffset() * 60000
        const localDate = new Date(date.getTime() - offset)
        const now = localDate.toISOString()
        if (startText){
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
            }, 1500);
        }
    }

    const selectLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const lang = e.target.value
        setDLang(lang)
        const jLang = japaneseName[lang as keyof typeof japaneseName]
        setLanguage(jLang);
    }

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
        }
    }, [eventData])
    
    useEffect(() => {
        const sText = embeddingsData.filter((item) => item.question === "最初の挨拶")
        if (sText.length>0){
            setStartText(sText[0])
        }
    }, [embeddingsData])

    useEffect(() => {
        if (userInput !== ""){
            setCanSend(true)
        } else {
            setCanSend(false)
        }
    }, [userInput])

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
                <div className="flex gap-2 mt-3 mx-2">
                <textarea
                    name="userInput"
                    rows={2}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="質問を入力・・・"
                    className="flex-1 p-2 border rounde text-sm"
                />
                {canSend ? (
                    <button type="submit" className="px-2 py-1 text-sm bg-green-500 hover:bg-green-700 text-white rounded disabled:bg-gray-300" onClick={() => getAnswer()}>
                        <Send className="mx-aute" size={16} />
                    </button>
                ):(
                    <button type="submit" className="px-2 py-1 text-sm bg-green-200 hover:bg-green-300 text-white rounded">
                        <Send className="mx-aute" size={16} />
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
            <button className="w-2/3 bg-cyan-500 hover:bg-cyan-700 text-white mx-auto mt-24 px-4 py-2 rounded text-xl font-bold" onClick={() => {talkStart()}}>
            <div className="text-2xl font-bold">ai concierge</div>
            <div>click to start</div></button>
            <div className="mx-auto mt-32 text-sm">使用言語(language)</div>
            <select className="mt-3 mx-auto text-sm w-36 h-8 text-center border-2 border-lime-600" value={dLang} onChange={selectLanguage}>
                {langList.map((lang, index) => {
                return <option className="text-center" key={index} value={lang}>{lang}</option>;
                })}
            </select>
            <button className="mt-auto mb-32 text-blue-500 hover:text-blue-700 text-sm">はじめにお読みください</button>
            </div>            
            )}
        </div>
    );
}
