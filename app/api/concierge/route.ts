import { OpenAI } from 'openai'
import { NextRequest, NextResponse } from 'next/server'
import { create } from 'domain'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: NextRequest) {
  const { question, model, prompt, refQA, history } = await req.json()

  try {
    const chatRes = await openai.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: createPrompt(question, refQA, history, prompt)}],
        temperature: 0.8
      })
    
      console.log(createPrompt(question, refQA, history, prompt))
      const answer = chatRes.choices[0].message.content
      return NextResponse.json({answer: answer, source:answer?.includes("QA情報")}, {status: 200})
  } catch {
    return NextResponse.json({answer:'Failed to parse paraphrases' }, { status: 500 })
  }
}

const createPrompt = (question:string, refQA:string, history:{user:string, aicon:string}[], prompt:string) => {
    const userQuestion = `最新の質問: ${question}`
    const referenceQA = `参照QA: ${refQA}`

    if (Array.isArray(history) && history.length>0){
        const history1 = `会話履歴 Q1:${history[history.length-1].user} A1:${history[history.length-1].aicon}`

        const finalPrompt = prompt + userQuestion + "\n" + history1 + "\n" + referenceQA
        return finalPrompt
    } else {
        const history1 = "会話履歴なし"
        const finalPrompt = prompt + history1 + "\n" + referenceQA +  "\n" +userQuestion
        return finalPrompt

    }
}

/*
    const prompt1 = "あなたはホテルメトロポリタン池袋のコンシェルジュです。会話履歴も含めて顧客意図を読み取り、以下の流れで回答してください。\n"
    const prompt2 = "参照QA情報が回答として適切な場合は、その回答を返してください\n"
    const prompt3 = "質問意図と一致しない、または回答として不十分な場合は、公開情報を使って100文字以内で簡潔に回答してください\n"
    const prompt4 = "回答が難しい場合は、次の質問を誘導してください。\n"
    const prompt5 = "最後に、使用した情報源を明記してください（例：「情報元：QA情報」「情報元：公開情報」など）\n\n"
*/

