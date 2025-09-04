"use client"
import React from 'react';


export default function InboundSite() {

  return (
    <div className="p-2 min-h-screen bg-gradient-to-br from-white via-slate-200 to-slate-100 overflow-hidden">
        <div className="mt-10 text-2xl font-bold text-blue-800 text-center lg:text-3xl sm:text-2xl">インバウンド顧客対応に頭を悩ませている事業主様へ</div>
        <div className="mt-4 text-lg font-bold text-blue-800 text-center lg:text-2xl sm:text-xl">日本語QAを登録するだけで多言語対応AIコンシェルジュアプリが構築できます</div>
        <div className="mt-6 w-4/5 mx-auto bg-yellow-400 p-5 rounded-xl">
          <li>対応言語は、「日本語」「英語」「中国語（簡体）」「中国語（繁体）」「韓国語」</li>
          <li>日本語のQ&Aデータを用意するだけ</li>
          <li>ユーザーはQRコードで一発アクセス</li>
          <li>地図や写真なども表示可能</li>
          <li>臨時のイベント情報などの追加・更新も簡単</li>
          <li>インターネット情報も参照して回答</li>
          <li>多言語対応の音声入力・AIボイス（オプション）</li>
          <li>人間スタップの対応が必要な場面でのチャットアプリへの移行（オプション）</li>
          <li>問い合わせや回答内容の解析支援（オプション）</li>
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
    </div>
  );
}

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