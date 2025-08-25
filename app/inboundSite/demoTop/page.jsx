
export default function DemoTop() {

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-slate-200 to-slate-100 overflow-hidden">
            <div className="flex justify-center">
            <div className="flex flex-row-2 gap-x-8 p-10">
                <button className="w-48 sm:w-72 lg:w-96 h-96 border-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white">
                    <a href="/aicon/chat?attribute=eQOL_ホテルコンシェルジュサンプル&code=Q0mO" target="_blank" className="flex flex-col h-full">
                    <div className="text-xl font-bold sm:text-2xl mt-12">インバウンドコンシェルジュ体験</div>
                    <div className="px-2 text-sm mt-4">ホテル宿泊者用アプリのサンプルです</div>
                    <div className="px-2 text-sm mt-16">QRコードを読み取るかこのボタンをクリック</div>
                    <img className="w-40 m-5 mx-auto mt-5" src="/コンシェルジュQRコード.jpg" alt="QRコード" />
                    </a>
                </button>
                <button className="w-48 sm:w-72 lg:w-96 h-96 border-2 bg-blue-900 rounded-xl hover:bg-blue-950 text-white">
                    <a href="/userRegistration" className="flex flex-col h-full">
                    <div className="text-xl font-bold sm:text-2xl mt-12">オリジナルコンシェルジュを作る</div>
                    <div className="mx-8 mt-4 text-sm">コンシェルジュアプリ作成の一連の流れを体験できるデモを用意しました</div>
                    <div className="mx-8 mt-10 text-sm">作成したアプリは1ヶ月間無料で利用可能。期間内に有料契約に変更すれば継続利用が可能です</div>
                    </a>
                </button>
            </div>
            </div>
        </div>
    );
}