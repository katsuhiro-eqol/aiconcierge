"use client"
import React from 'react';
import YouTubeEmbed from "@/app/components/youtubeEmbedded";

export default function InboundSite() {

  return (
    <div className="p-2 min-h-screen bg-gradient-to-br from-white via-slate-200 to-slate-100 overflow-hidden">
        <div className="mt-10 text-2xl font-bold text-blue-800 text-center lg:text-3xl sm:text-2xl">インバウンド顧客対応に頭を悩ませている事業主様へ</div>
        <div className="mt-4 text-lg font-bold text-blue-800 text-center lg:text-2xl sm:text-xl">日本語QAを登録するだけで多言語対応AIコンシェルジュアプリが構築できます</div>

        <div className="mt-6 w-4/5 mx-auto bg-yellow-400 p-5 rounded-xl">
          <li className="ml-5">事業者様の日本語想定Q&Aリストを元にAIデータベースを作成します</li>
          <li className="ml-5">サービス拠点付近の情報（最寄駅など）は公開情報を併用することも可能です</li>
          <li className="ml-5">想定Q&Aリストの作成は弊社がサポートいたします</li>
          <li className="ml-5">ユーザーはQRコードで一発アクセス。選択した言語でサービスを利用できます</li>
          <li className="ml-5">対応言語は、「日本語」「英語」「中国語（簡体）」「中国語（繁体）」「韓国語」（デフォルト）</li>
          <li className="ml-5">言語の追加も応相談です</li>
          <li className="ml-5">地図や写真などの画像ファイル、pdfファイルなども回答に添付して表示可能です</li>
          <li className="ml-5">臨時のイベント情報などの追加・更新も事業者様自身で簡単にできるようになっています</li>
          <li className="ml-5">質問や回答には多言語対応の音声入力・AIボイスが利用できます</li>
          <li className="ml-5">問い合わせや回答内容を確認・解析してQ&Aの改善に繋げることができます</li>
          <li className="ml-5">人間スタップの対応が必要な場面でのチャットアプリへの移行サービスもオプションで用意しています</li>
        </div>


        <div className="mt-10 w-4/5 mx-auto flex flex-row gap-x-4 bg-blue-500 py-5 rounded-xl">
            <div className="w-1/4 mx-auto" >
            <p className="text-bold text-center text-white mb-3">日本語</p>
            <img src="/日本語1.png" alt="エクセルやスプレッドシート" />
            </div>
            <div className="w-1/4 mx-auto" >
            <p className="text-bold text-center text-white mb-3">英語</p>
            <img src="/English1.png" alt="エクセルやスプレッドシート" />
            </div>
            <div className="w-1/4 mx-auto" >
            <p className="text-bold text-center text-white mb-3">中国語（簡体）</p>
            <img src="/中文1.png" alt="エクセルやスプレッドシート" />
            </div>            
        </div>
        <div className="mt-8 mb-8 w-3/5 mx-auto">
        <YouTubeEmbed videoId="bER629Yt4Pc?si=oeNjrw14aJnXqyCG" title="インバウンドコンシェルジュ紹介動画"/>
        </div>
    </div>
  );
}
/*
        <div className="mt-8 mb-8 w-3/5 mx-auto">
        <YouTubeEmbed videoId="m2QlPKsPFz0?si=IPZzoWGjw-SKPXA5" title="インバウンドコンシェルジュ紹介動画"/>
        </div>
*/

/*
        <div className="mt-12 text-2xl font-bold text-blue-800 text-center">1st ステップ</div>
        <div className="mt-5 text-base text-blue-800 text-center lg:text-xl">事業者様に「顧客に頻繁に質問される事項」と「それに対する回答」を</div>
        <div className="text-base text-blue-800 text-center lg:text-xl">日本語で、エクセルシートに記入していただきます</div>
        <div className="text-base text-blue-800 text-center lg:text-xl">提示したい図面がある場合はそのファイル名を記載します</div>
        <img className="min-w-72 w-2/5 mx-auto mt-8 opacity-60" src="/QAtable.png" alt="エクセルやスプレッドシート" />
        <div className="mt-12 text-2xl font-bold text-blue-800 text-center">2nd ステップ</div>
        <div className="mt-5 mb-5 text-base text-blue-800 text-center lg:text-xl">自動でデータベースが構築され、顧客用QRコードが発行されます</div>
        <img className="min-w-64 w-1/5 mx-auto mt-8 opacity-60" src="/コンシェルジュQRコード.jpg" alt="QRコード" />
        <div className="mt-12 text-2xl font-bold text-blue-800 text-center">3rd ステップ</div>
        <div className="mt-5 text-xl text-blue-800 text-center lg:text-xl">顧客はQRコードからアプリにアクセス</div>        
        <div className="mb-5 text-xl text-blue-800 text-center lg:text-xl">言語を選択して、チャット形式で質問できます</div>  
*/