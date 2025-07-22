import { Answer} from "@/types"

export default async function createForeign(answer:string, languages:string[]){
    const foreignLang = languages.filter((lang) => lang !=="日本語")
    const translatedAnswers:Answer[] = []
        for (const language of foreignLang){
            const response = await fetch("/api/translate", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ answer: answer, language:language}),
              });
      
            const lang = await response.json();
            //const key = answer + "-" + language
            translatedAnswers.push({[language]:lang.foreign})
        }
    return translatedAnswers
}