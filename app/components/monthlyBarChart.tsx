type DailyCounts = Record<string, number>;

type Props = {
  dailyCounts: DailyCounts;
  year: string;
  month: string;
};

export default function MonthlyBarChart({
  dailyCounts,
  year,
  month,
}: Props) {
  const prefix = `${year}-${month}-`;

  // 対象月データ抽出 & ソート
  const data = Object.entries(dailyCounts)
    .filter(([date]) => date.startsWith(prefix))
    .sort(([a], [b]) => a.localeCompare(b));

  const maxValue = Math.max(...data.map(([, v]) => v), 1);

  return (
    <div className="w-full">
      <div className="flex items-end gap-2 h-48 border-b border-gray-300">
        {data.map(([date, value]) => {
          const day = date.split("-")[2];
          const height = (value / maxValue) * 100;

          return (
            <div key={date} className="flex flex-col items-center flex-1">
              {/* 値 */}
              <div className="text-xs mb-1">{value}</div>

              {/* 棒 */}
              <div
                className="w-full bg-blue-500 rounded-t"
                style={{ height: `${height}%` }}
              />

              {/* 日付 */}
              <div className="text-[10px] mt-1">{day}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}