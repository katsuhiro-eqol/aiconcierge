
export default function DemoTop() {

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-slate-200 to-slate-100 overflow-hidden">
            <div className="mt-10 text-2xl font-bold text-blue-800 text-center lg:text-3xl sm:text-2xl">インバウンドコンシェルジュ無料体験</div>
            <div className="mt-4 text-lg font-bold text-blue-800 text-center lg:text-2xl sm:text-xl">「ホテル池袋」（架空のホテルです）の宿泊客になったつもりで質問してみましょう</div>
            <div className="mt-6 w-4/5 mx-auto bg-yellow-400 p-5 rounded-xl">
                <li className="ml-5">東京都豊島区内の仮想のホテル「ホテル池袋」を念頭にQ&Aリストを設定しました<span className="mx-5">Q&Aデータを確認したい場合は<a className="text-blue-500" href="https://docs.google.com/spreadsheets/d/1Ff0Ip7R6sMI0oX4pR9PuoKPU9hsYvmL5/edit?usp=sharing&ouid=117492770886811328460&rtpof=true&sd=true" target="_blank" rel="noopener noreferrer">こちら</a></span></li>
                <li className="ml-5">設定したQ&Aは93 WiFi、朝食場所、近隣情報などを学習しています</li>
                <li className="ml-5">学習済みQ&Aを元に回答した場合は、回答の最後に参照したQ&A番号を表示します</li>
                <li className="ml-5">学習済みQ&Aに回答すべき内容がない場合は、汎用AIの知識でコンシェルジュとしてふさわしい回答をするように設計されています</li>
                <li className="ml-5">それでも適切な回答を導けない場合は、あらかじめ設定した回答不能時の応答をします</li>
                <li className="ml-5">対応言語は、「日本語」「英語」「中国語（簡体）」「中国語（繁体）」「韓国語」です</li>
                <li className="ml-5">最初に使用する言語を選択します　お使いのデバイスに設定された言語が自動的に選択されます</li>
                <li className="ml-5">お使いの言語が対応言語の中にない場合は、デフォルトで英語が選択されます 自分で言語を選択することも可能です</li>
                <li className="ml-5">コンシェルジュの解答欄に画像のアイコンが表示される場合は添付書類付きです クリックすると拡大します</li>
            </div>
            <div className="flex items-center justify-center gap-x-8 p-10">
                <button className="w-48 h-24 border-2 rounded-xl bg-blue-800 hover:bg-blue-900 text-white">
                    <a href="https://aiconcierge.vercel.app/api/renew?to=%2Faicon%2Fchat%3Fattribute%3DeQOL_Hotel_Ikebukuro_Demo%26code%3DkNQT" target="_blank" className="flex h-full items-center justify-center">
                    <div className="px-2 text-sm">デモ開始</div>
                    
                    </a>
                </button>
                <div>または</div>
                <div>
                    <img className="h-24" src="/HotelDemo.jpg" alt="QRコード" />
                </div>
            </div>
        </div>
    );
}

/*

*/