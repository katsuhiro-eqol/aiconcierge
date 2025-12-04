import { Answer, TranslatedAnswers} from "@/types"

export default async function createForeign(answer:string, languages:string[]){

  const answers: Answer = {}
  for (const language of languages){
      if (language === "日本語"){
          answers[language] = answer
      } else {
          const response = await fetch("/api/translate", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              //body: JSON.stringify({ input: userInput, character: character, fewShot: fewShot, previousData: previousData, sca: scaList[character] }),
              body: JSON.stringify({ answer: answer, language:language}),
            });
    
          const lang = await response.json();
          answers[language]=lang.foreign
      }
  }
  
  return answers
}
