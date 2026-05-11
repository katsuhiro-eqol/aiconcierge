import { Check, QrCode, ExternalLink } from 'lucide-react';

const notes = [
  <>東京都豊島区内の仮想ホテル「ホテル池袋」を念頭に、デモ用Q&Aリストを設定しました。<a className="text-blue-500 underline underline-offset-2 ml-1" href="https://docs.google.com/spreadsheets/d/1Ff0Ip7R6sMI0oX4pR9PuoKPU9hsYvmL5/edit?usp=sharing&ouid=117492770886811328460&rtpof=true&sd=true" target="_blank" rel="noopener noreferrer">Q&Aデータを確認</a></>,
  "WiFi・朝食・近隣情報など93件のQ&Aを学習しています",
  "学習済みQ&Aを参照した場合、回答末尾に参照Q&A番号を表示します",
  "Q&Aに回答すべき内容がない場合は、汎用AIの知識でコンシェルジュとしてふさわしい回答をします",
  "対応言語：日本語・英語・中国語（簡体・繁体）・韓国語",
  "最初に使用言語を選択します。デバイスの言語設定が自動的に適用されます",
  "コンシェルジュの回答に画像アイコンが表示される場合は添付ファイル付きです。クリックで拡大します",
];

export default function DemoTop() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">

      {/* Page header */}
      <section className="bg-gradient-to-b from-blue-50 to-white pt-14 pb-12 px-4 text-center">
        <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
          無料体験
        </span>
        <h1 className="text-3xl font-bold text-slate-900 lg:text-4xl">
          インバウンドコンシェルジュを<br className="sm:hidden" />体験してみましょう
        </h1>
        <p className="mt-4 text-slate-600 text-sm max-w-xl mx-auto leading-relaxed">
          架空のホテル「ホテル池袋」の宿泊客になったつもりで、<br className="hidden sm:block" />
          自由に質問してみてください。
        </p>
      </section>

      {/* Notes */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-base font-bold text-slate-700 mb-5">デモについて</h2>
          <div className="flex flex-col gap-3">
            {notes.map((note, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50">
                <Check className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                <span className="text-slate-600 text-sm leading-relaxed">{note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-4 bg-blue-600">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-2">デモを開始する</h2>
          <p className="text-blue-200 text-sm mb-10">
            ボタンをタップするか、QRコードをスキャンしてアクセスしてください
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <a
              href="https://aiconcierge.vercel.app/api/renew?to=%2Faicon%2Fchat%3Fattribute%3DeQOL_Hotel_Ikebukuro_Demo%26code%3DkNQT"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-white text-blue-700 font-bold text-base hover:bg-blue-50 transition-colors shadow-md"
            >
              <ExternalLink className="w-5 h-5" />
              デモ開始
            </a>
            <div className="flex flex-col items-center gap-2">
              <div className="p-2 bg-white rounded-xl shadow-md">
                <img className="h-28 w-28" src="/HotelDemo.jpg" alt="QRコード" />
              </div>
              <span className="text-blue-200 text-xs">QRコードでアクセス</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
