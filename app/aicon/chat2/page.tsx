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
import {Message, EmbeddingsData, EventData} from "@/types"
type LanguageCode = 'ja-JP' | 'en-US' | 'zh-CN' | 'zh-TW' | 'ko-KR' | 'fr-FR' | 'pt-BR' | 'es-ES'

const no_sound = "https://firebasestorage.googleapis.com/v0/b/conciergeproject-1dc77.firebasestorage.app/o/voice%2Fno_sound.wav?alt=media&token=72bc4be8-0172-469b-a38c-0e318fe91bee"

export default function Aicon() {
    const [windowHeight, setWindowHeight] = useState<number>(0)
    const [thumbnail, setThumnail] = useState<string>("/AICON-w.png")
    const [userInput, setUserInput] = useState<string>("")
    const [messages, setMessages] = useState<Message[]>([])
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
  
        const userMessage: Message = {
            id: now,
            text: userInput,
            sender: 'user',
            modalUrl:null,
            modalFile:null,
            similarity:null,
            nearestQ:null
        }
        setMessages(prev => [...prev, userMessage]);
  
        try {
          const response = await fetch("/api/embedding2", {
              method: "POST",
              headers: {
              "Content-Type": "application/json",
              },
              body: JSON.stringify({ input: userInput, model: eventData?.embedding ?? "text-embedding-3-small", language: language }),
          });
          setUserInput("")
          const data = await response.json();
          if (response.status !== 200) {
            throw data.error || new Error(`Request failed with status ${response.status}`);
          }
          const translatedQuestion = data.input
          const similarityList = findMostSimilarQuestion(data.embedding)
  
          //類似質問があったかどうかで場合わけ
          if (similarityList.similarity > 0.5){
              const aiMessage: Message = {
                id: `A${now}`,
                text: embeddingsData[similarityList.index].foreign[language],
                sender: 'AIcon',
                modalUrl:judgeNull(embeddingsData[similarityList.index].modalUrl),
                modalFile:judgeNull(embeddingsData[similarityList.index].modalFile),
                similarity:similarityList.similarity,
                nearestQ:embeddingsData[similarityList.index].question,
                thumbnail: thumbnail
              };
            setMessages(prev => [...prev, aiMessage]);

            if (attribute){
                await saveMessage(userMessage, aiMessage, attribute, translatedQuestion, similarityList.index)
            }
          //類似質問不在の場合に会話履歴も考慮して質問意図を把握し、質問文候補を複数生成の上、それとの一致度を比較するアルゴリズムを追加
          }else{
            console.log(history)
            try {
              const response = await fetch("/api/paraphrase", {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({ question: translatedQuestion, model: eventData?.embedding ?? "text-embedding-3-small", history:history }),
              });
              const data = await response.json();
              console.log(data.paraphrases)
              let maxValue = 0
              let properAnswer = ""
              let index = 0
              for (const embedding of data.embeddings){
                  const similarityList2 = findMostSimilarQuestion(embedding)
                  if (similarityList2.similarity > maxValue){
                      maxValue = similarityList2.similarity
                      properAnswer = embeddingsData[similarityList2.index].answer
                      index = similarityList2.index
                  }
              }
              if (maxValue > 0.5) {
                console.log(maxValue)
                const aiMessage: Message = {
                  id: `A${now}`,
                  text: embeddingsData[index].foreign[language],
                  sender: 'AIcon',
                  modalUrl:judgeNull(embeddingsData[index].modalUrl),
                  modalFile:judgeNull(embeddingsData[index].modalFile),
                  similarity:maxValue,
                  nearestQ:embeddingsData[index].question,
                  thumbnail: thumbnail
                };
                setMessages(prev => [...prev, aiMessage]);
                if (attribute){
                    await saveMessage(userMessage, aiMessage, attribute, translatedQuestion, index)
                }
  
              //類似質問が見つからなかった場合のアルゴリズム。分類できなかった質問の回答文が複数あることを想定
              } else {
                const unclassified = embeddingsData.filter(item => item.question ==="分類できなかった質問")
                const aiMessage: Message = {
                  id: `A${now}`,
                  text: unclassified[0].foreign[language],
                  sender: 'AIcon',
                  modalUrl:null,
                  modalFile:null,
                  similarity:similarityList.similarity,
                  nearestQ:embeddingsData[similarityList.index].question,
                  thumbnail: thumbnail
                };
                setMessages(prev => [...prev, aiMessage]);
                if (attribute){
                    await saveMessage(userMessage, aiMessage, attribute, translatedQuestion,-1)
                }             
                }
            } catch (error) {
                console.error(error);
            }
          }
        } catch(error) {
        console.error(error);
        }
      }
  
      const judgeNull = (value:string) => {
        if (value === ""){
          return null
        } else {
          return value
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
        const similarities = embeddingsData.map((item, index) => ({
            index,
            similarity: cosineSimilarity(inputVector, item.vector)
          }));
        similarities.sort((a, b) => b.similarity - a.similarity);

        // 最も類似度の高いベクトルの情報を返す
        return similarities[0];
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
                    id:data.id,
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
            } else {
                alert("QRコードをもう一度読み込んでください")
            }
        } else {
            alert("イベントが登録されていません")
        }
    }

    const saveMessage = async (userMessage:Message, message:Message, attr:string, translatedQuestion:string, index:number) => {
        if (index === -1){
            const hdata = {
                user:translatedQuestion,
                aicon:"回答不能です"
            }
            setHistory(prev => [...prev, hdata])

            const data = {
                id:userMessage.id,
                user:userMessage.text,
                uJapanese:translatedQuestion,
                aicon:message.text,
                aJapanese: "回答不能",
                nearestQ:message.nearestQ,
                similarity:message.similarity
            }
            await updateDoc(doc(db, "Events",attr, "Conversation", convId), {conversations: arrayUnion(data)})
        }else {
            const hdata = {
                user:translatedQuestion,
                aicon:embeddingsData[index].answer
            }
            setHistory(prev => [...prev, hdata])

            const data = {
                id:userMessage.id,
                user:userMessage.text,
                uJapanese:translatedQuestion,
                aicon:message.text,
                aJapanese: embeddingsData[index].answer,
                nearestQ:message.nearestQ,
                similarity:message.similarity
            }
            await updateDoc(doc(db, "Events",attr, "Conversation", convId), {conversations: arrayUnion(data)})
        }
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
        await setDoc(doc(db,"Events",attr,"Conversation",convId), {conversations:[], language:language, date:now})
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
        //audioPlay()
        setWavReady(true)
        const date = new Date()
        const offset = date.getTimezoneOffset() * 60000
        const localDate = new Date(date.getTime() - offset)
        const now = localDate.toISOString()
        console.log("startText",startText)
        if (startText){
            setTimeout(() => {
                const aiMessage: Message = {
                    id: now,
                    text: startText.foreign[language],
                    sender: 'AIcon',
                    modalUrl:null,
                    modalFile:null,
                    similarity:null,
                    nearestQ:null,
                    thumbnail: thumbnail
                };
                setMessages(prev => [...prev, aiMessage])
            }, 1500);
        }
    }

    const inputClear = () => {
        setUserInput("")
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
                <button type="submit" className="px-2 py-1 text-sm bg-green-500 hover:bg-green-700 text-white rounded disabled:bg-gray-300" onClick={() => getAnswer()}>
                    <Send className="mx-aute" size={16} />
                </button>
                </div>
                {isModal && (
                    <Modal setIsModal={setIsModal} modalUrl={modalUrl} modalFile={modalFile}/>
                )}
                </div>
            </div>
        </div>):(
            <div className="flex flex-col h-screen bg-stone-200">
            <button className="w-2/3 bg-cyan-500 hover:bg-cyan-700 text-white mx-auto mt-24 px-4 py-2 rounded text-xl font-bold" onClick={() => {talkStart()}}>ai concierge</button>
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
