
export default function DemoTop() {

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-slate-200 to-slate-100 overflow-hidden">
            <div className="flex justify-center">
            <div className="flex flex-row-2 gap-x-8 p-10">
                <button className="w-96 h-96 border-2 rounded-xl bg-blue-800 hover:bg-blue-900 text-white">
                    <a href="https://aiconcierge.vercel.app/api/renew?to=%2Faicon%2Fchat5%3Fattribute%3DeQOL_Hotel_Ikebukuro_Demo%26code%3DkNQT" target="_blank" className="flex flex-col h-full">
                    <div className="text-xl font-bold mt-6">インバウンドコンシェルジュ体験</div>
                    <div className="px-2 text-sm mt-4">ホテル宿泊者用アプリのサンプルです</div>
                    <div className="px-2 text-sm mt-8">QRコードを読み取るかこの青いボタンをクリック</div>
                    <img className="w-64 m-4 mx-auto mt-5" src="/HotelDemo.jpg" alt="QRコード" />
                    </a>
                </button>
            </div>
            </div>
        </div>
    );
}