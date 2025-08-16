declare global {
    interface RequestInit {
      timeout?: number;
    }
  }

export interface Image {
    name: string;
    url: string;
};

export interface Foreign {
    [key: string]: string;
};

export interface Modal {
    name:string;
    type:string;
    size:number;
    path:string;
    url:string;
};

export interface FILE extends File {
    preview?: string;
}

export interface ModalFile {
    [key: string]: string;
}

export interface ForeignAnswer {
    [key: string]:string
}
export interface ForeignAnswers {
    [key: string]:ForeignAnswer[]
}
export interface CsvData {
    [key: string]: string;
}
export type Message = {
    id: string;
    text: string;
    sender: 'user' | 'AIcon' | 'system';
    modalUrl: string | null;
    modalFile: string | null;
    similarity: number | null;
    nearestQ: string | null;
    thumbnail?: string | null;
}

export type Message2 = {
    id: string;
    text: string;
    sender: 'user' | 'AIcon' | 'system';
    modalUrl: string;
    modalFile: string;
    source: boolean | null;
    thumbnail?: string | null;
}
//aiconに読み込むデータ
export interface EmbeddingsData {
    id: string;
    vector: number[];
    question: string;
    answer: string;
    modalUrl: string;
    modalFile: string;
    foreign: Foreign;
}

export interface VoiceData {
    lang:string;
    text:string;
    fText:string;
    url:string;
    frame:number;
    duration:number;
}


export interface EventData {
    id:string;
    image:Image;
    name:string;
    code: string;
    voiceSetting:string;
    qaData: boolean;
    languages:string[];
    embedding:string;
    langStr:string;
    prompt:string;
    gpt:string;
}

export interface MenuItem {
    title: string;
    icon: any;
    path: string|null;
    submenu: boolean;
    submenuItems: SubmenuItem[]|null;
}

export interface SubmenuItem {
title: string;
path: string;
}

export interface Answer {
    [key: string]: string;
}
export interface TranslatedAnswers {
    [key: string]:Answer
}
//データリストに読み込む形式
export interface QaData {
    id: string;
    code: string;
    question: string;
    answer: string;
    read: string;
    modalFile: string;
    modalUrl: string;
    foreign: Answer;
    vector: string;
    pronunciations:Pronunciation[];
    [key: string]: string | Answer | Pronunciation[];
}

export interface ModalData {
    name:string;
    path:string;
    url:string;
}
export interface Pronunciation {
    text: string;
    read: string;
}

export interface StartText {
    text:string;
    url:string;
    voice:string;
}

export interface ConvData {
    id:string;
    user:string;
    uJapanese:string;
    aicon:string;
    aJapanese:string;
    similarity:number;
    nearestQ:string;
}