import { Answer, TranslatedAnswers} from "@/types"

export default async function createForeign(answer:string, languages:string[]){

  const answers: Answer = {}
  const readQ = answer.replace(/<表示のみ>.*?<\/表示のみ>/g, "")
  for (const language of languages){
      if (language === "日本語"){
        
        answers[language] = readQ
      } else {
          const response = await fetch("/api/translate", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              //body: JSON.stringify({ input: userInput, character: character, fewShot: fewShot, previousData: previousData, sca: scaList[character] }),
              body: JSON.stringify({ answer: readQ, language:language}),
            });
    
          const lang = await response.json();
          answers[language]=lang.foreign
      }
  }
  
  return answers
}
