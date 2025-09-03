"use client"
import React from 'react';


export default function Price() {
    const pricing = [

    ]

  return (
    <div>
    <div className="mt-6 text-xl font-bold text-center">基本料金</div>
    <div className="flex justify-center w-full">
      <table className="mt-4 w-4/5 table-auto bg-yellow-200">
        <tbody>
          <tr className="border-b">
            <td className="p-4 border border-gray-400">
                <div>ベーシックプラン</div>
                <div>(QAデータ数500未満)</div>
                </td>
            <td className="p-4 border border-gray-400">        
                <li>多言語対応（日本語、英語、中国語（簡体、繁体）、韓国語</li>
                <li>インターネット情報も併用して回答</li>
            </td>
            <td className="p-4 border border-gray-400">¥20,000/月</td>
          </tr>
        </tbody>
      </table>
      </div>
      <div className="mt-16 text-xl font-bold text-center">オプション料金</div>
      <div className="flex justify-center w-full">
      <table className="mt-4 mb-10 w-4/5 table-auto bg-blue-200">
        <tbody>
          <tr className="border-b">
            <td className="p-4 border border-gray-400">
                <div>音声認識・AIボイス</div>
                </td>
            <td className="p-4 border border-gray-400">        
                <li>音声認識はAZURE APIを使用</li>
                <li>AIボイスはGoogle APIを使用</li>
                <li className="mt-2 text-red-500 text-xs">オリジナルAIボイスを検討されている場合は別途ご相談ください</li>
            </td>
            <td className="p-4 border border-gray-400">¥30,000/月</td>
          </tr>
          <tr className="border-b">
            <td className="p-4 border border-gray-400">
                <div>ヒューマンサポートチャット</div>
                </td>
            <td className="p-4 border border-gray-400">        
                <li>ユーザー要請でシームレスにAIからスタップチャットに移行</li>
                <li>スタッフ用のシステム・専用ページを追加</li>
            </td>
            <td className="p-4 border border-gray-400">¥100,000/月</td>
          </tr>
          <tr className="border-b">
            <td className="p-4 border border-gray-400">
                <div>質問内容・AI回答の解析サポート</div>
                </td>
            <td className="p-4 border border-gray-400">        
                <li>AIが回答不能となった質問の分析</li>
                <li>ユーザー関心事の解析、など</li>
            </td>
            <td className="p-4 border border-gray-400">¥100,000/月</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div className="text-center mb-10">（＊）500をこえるQ&Aデータを登録したい場合はご相談ください</div>
    </div>

  );
}

/*
    <div className="flex justify-center">
    <div className="w-4/5 flex flex-row gap-x-4">
        <div className="p-4">
        <div>ベーシックプラン</div><div>(QAデータ数500未満)</div>
        </div>
        <div className="p-4">
        <li>多言語対応（日本語、英語、中国語（簡体、繁体）、韓国語</li>
        <li>インターネット情報を利用して回答</li>            
        </div>
        <div className="p-4">
        ¥20,000/月
        </div>
    </div>
    </div>

    <div className="mt-6 text-center font-bold text-xl">料金体系</div>
    <div className="flex flex-col w-full px-8 mx-10 lg:mx-32 justify-center gap-2">
        <table className="w-4/5">
        <tbody>
            <tr key="basic">
                <td className="w-56">
                    <div>ベーシックプラン</div><div>(QAデータ数500未満)</div></td>
                <td className="w-1/2">
                    <li>多言語対応（日本語、英語、中国語（簡体、繁体）、韓国語</li>
                    <li>インターネット情報を利用して回答</li>
                </td>
                <td className="w-48">¥20,000/月</td>
            </tr>
        </tbody>
    </table>
*/