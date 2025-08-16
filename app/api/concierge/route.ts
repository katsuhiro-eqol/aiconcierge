import { OpenAI } from 'openai'
import { NextRequest, NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: NextRequest) {
  const { question, model, prompt, refQA, history, language, undefined } = await req.json()
  console.log(`入力トークン数：${calculateTokens(createPrompt(question, refQA, history, prompt, language, undefined))}`)
  console.log(model)
  
  try {
    let answer: string | null = null;
    
    if (model === "gpt-5"){
      try {
          const chatRes = await openai.responses.create({
              model: model,
              input: [{ role: 'user', content: createPrompt(question, refQA, history, prompt, language, undefined)}]
          })
      
          console.log(createPrompt(question, refQA, history, prompt, language, undefined))
          answer = chatRes.output_text
          console.log(`出力トークン数：${calculateTokens(answer!)}`)
      } catch (error) {
          console.error('GPT-5 API error:', error);
          throw error;
      }    
    } else {
      try {
          const chatRes = await openai.chat.completions.create({
              model: model,
              messages: [{ role: 'user', content: createPrompt(question, refQA, history, prompt, language, undefined)}],
              temperature: 0.8
          })
      
          console.log(createPrompt(question, refQA, history, prompt, language, undefined))
          answer = chatRes.choices[0].message.content
          console.log(`出力トークン数：${calculateTokens(answer!)}`)
      } catch (error) {
          console.error('Chat completions API error:', error);
          throw error;
      }
    }
    
    // JSONパースを安全に行う
    console.log(answer)
    if (answer) {
      try {
          const answer1 = JSON.parse(answer);
          if (Array.isArray(answer1) && answer1.length >= 3) {
              return NextResponse.json({
                  answer: answer1[0], 
                  id: answer1[1], 
                  source: answer1[2]
              }, {status: 200});
          } else {
              // JSONパース成功だが配列形式でない場合
              return NextResponse.json({
                  answer: answer, 
                  id: "", 
                  source: answer?.includes("QA情報") ? "QA情報" : ""
              }, {status: 200});
          }
      } catch (parseError) {
          // JSONパース失敗の場合
          console.log("JSON parse failed, using raw answer");
          return NextResponse.json({
              answer: answer, 
              id: "", 
              source: answer?.includes("QA情報") ? "QA情報" : ""
          }, {status: 200});
      }
    } else {
      return NextResponse.json({answer:'No response from API', id: "", source: ""}, { status: 500 })
    }
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({answer:'Failed to get response from API', id: "", source: ""}, { status: 500 })
  }
}

const createPrompt = (question:string, refQA:string, history:{user:string, aicon:string}[], prompt:string, language:string, undefined:string) => {
    const userQuestion = `最新の質問: ${question}`
    const userLanguage = `回答の言語：${language}`
    const referenceQA = `参照QA: ${refQA}`
    const undefinedAnswer = `回答不能時の回答:${undefined}`

    if (Array.isArray(history) && history.length>0){
        const history1 = `会話履歴 Q1:${history[history.length-1].user} A1:${history[history.length-1].aicon}`

        const finalPrompt = prompt + undefinedAnswer + "\n" + history1 + "\n" + referenceQA +  "\n" + userLanguage + "\n" + userQuestion
        return finalPrompt
    } else {
        const history1 = "会話履歴 なし"
        const finalPrompt = prompt + undefinedAnswer + "\n" + history1 + "\n" + referenceQA +  "\n" + userLanguage + "\n" + userQuestion
        return finalPrompt

    }
}

const calculateTokens = (text: string) => {
    const japaneseChars = (text.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/gu) || []).length;
    const otherChars = text.length - japaneseChars;
    const spacesAndBreaks = (text.match(/\s/g) || []).length;

    // 日本語: 約1.1文字/トークン, 英語: 約3.8文字/トークン
    const jpTokens = japaneseChars / 1.1;
    const enTokens = (otherChars - spacesAndBreaks) / 3.8;
    const spaceTokens = spacesAndBreaks / 1.0;

    return Math.ceil(jpTokens + enTokens + spaceTokens);
}
