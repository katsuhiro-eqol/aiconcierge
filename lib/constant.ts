export const foreignLanguages: Record<string, string> = {
    "日本語": "ja-JP",
    "英語": "en-US",
    "中国語（簡体）": "zh-CN",
    "中国語（繁体）": "zh-TW",
    "韓国語": "ko-KR",
    "フランス語": "fr-FR",
    "ポルトガル語": "pt-BR",
    "スペイン語": "es-ES"
}

export const nativeName = {
  "日本語":"日本語", 
  "英語":"English",
  "中国語（簡体）":"简体中文",
  "中国語（繁体）":"繁體中文",
  "韓国語":"한국어",
  "フランス語":"Français",
  "スペイン語":"Español",
  "ポルトガル語":"Português"
}

export const japaneseName = {
  "日本語":"日本語", 
  "English":"英語",
  "简体中文":"中国語（簡体）",
  "繁體中文":"中国語（繁体）",
  "한국어":"韓国語",
  "Français":"フランス語",
  "Español":"スペイン語",
  "Português":"ポルトガル語"
}

export const japaneseName2 = {
  "ja":"日本語", 
  "en":"英語",
  "zh-CN":"中国語（簡体）",
  "zh-TW":"中国語（繁体）",
  "ko":"韓国語",
  "fr":"フランス語",
  "es":"スペイン語",
  "pt":"ポルトガル語"
}

//["lang-code", "voiceNumber_woman", "voiceNumber_man"]
export const foreignLanguageVoice: Record<string, string[]> = {
    "日本語": ["ja-JP","ja-JP-Standard-B", "ja-JP-Standard-C"],
    "英語": ["en-US", "en-US-Standard-F", "en-US-Standard-B"],
    "中国語（簡体）": ["zh-CN", "cmn-CN-Standard-D", "cmn-CN-Standard-B"],
    "中国語（繁体）": ["zh-TW", "cmn-TW-Standard-A", "cmn-TW-Standard-B"],
    "韓国語": ["ko-KR", "ko-KR-Standard-A", "ko-KR-Standard-C"],
    "フランス語": ["fr-FR", "fr-FR-Standard-C", "fr-FR-Standard-G"],
    "ポルトガル語": ["pt-BR", "pt-BR-Standard-A", "pt-BR-Standard-B"],
    "スペイン語": ["es-ES", "es-ES-Standard-H", "es-ES-Standard-G"]
}