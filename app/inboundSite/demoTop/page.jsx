
export default function DemoTop() {

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-slate-200 to-slate-100 overflow-hidden">
            <div className="flex justify-center">
            <div className="flex flex-row-2 gap-x-8 p-10">
                <button className="w-96 h-96 border-2 rounded-xl bg-blue-800 hover:bg-blue-900 text-white">
                    <a href="https://aiconcierge.vercel.app/api/renew?to=%2Faicon%2Fchat4%3Fattribute%3DeQOL_%E3%83%9B%E3%83%86%E3%83%AB%E3%82%B3%E3%83%B3%E3%82%B7%E3%82%A7%E3%83%AB%E3%82%B8%E3%83%A5%E3%82%B5%E3%83%B3%E3%83%97%E3%83%AB%26code%3DQ0mO" target="_blank" className="flex flex-col h-full">
                    <div className="text-xl font-bold sm:text-2xl mt-12">インバウンドコンシェルジュ体験</div>
                    <div className="px-2 text-sm mt-4">ホテル宿泊者用アプリのサンプルです</div>
                    <div className="px-2 text-sm mt-16">QRコードを読み取るかこのボタンをクリック</div>
                    <img className="w-40 m-5 mx-auto mt-5" src="/sample_qrcode.jpg" alt="QRコード" />
                    </a>
                </button>
            </div>
            </div>
        </div>
    );
}