"use client"
import React from "react";
import { useState, useEffect, useMemo } from "react";

type DailyCounts = Record<string, number>;
type Props = {
  dailyCounts: DailyCounts;
};
type ChartItem = {
    date: string;
    day: number;
    value: number;
  };

export default function MonthlyBarChart({
  dailyCounts,
}: Props) {
    const now = new Date();
    const defaultYear = now.getFullYear();
    const defaultMonth = now.getMonth() + 1;

    const [year, setYear] = useState(defaultYear);
    const [month, setMonth] = useState(defaultMonth);
    const [monthlyTotal, setMonthlyTotal] = useState<number|null>(null)
    const [data, setData] = useState<ChartItem[] | null>(null);

    const yearOptions = useMemo(() => {
      const fromKeys = Object.keys(dailyCounts)
        .map((k) => Number(k.slice(0, 4)))
        .filter((y) => Number.isFinite(y) && y >= 2000 && y <= 2100);
      const min = fromKeys.length
        ? Math.min(...fromKeys, defaultYear - 3)
        : defaultYear - 3;
      const max = fromKeys.length
        ? Math.max(...fromKeys, defaultYear + 1)
        : defaultYear + 1;
      const list: number[] = [];
      for (let y = min; y <= max; y++) list.push(y);
      return list;
    }, [dailyCounts, defaultYear]);

    function fillMissingDays(
        dailyCounts: DailyCounts,
        year: number,
        month: number
      ): ChartItem[] {
        const monthStr = String(month).padStart(2, "0");
        // その月の末日を取得
        const daysInMonth = new Date(year, month, 0).getDate();
        const result: ChartItem[] = [];
        let mt:number = 0
      
        for (let day = 1; day <= daysInMonth; day++) {
          const dayStr = String(day).padStart(2, "0");
          const date = `${year}-${monthStr}-${dayStr}`;
          mt += dailyCounts[date] ?? 0
          result.push({
            date,
            day,
            value: dailyCounts[date] ?? 0,
          });
        }
        setMonthlyTotal(mt)
        return result;
    }

    useEffect(() => {
      const d = fillMissingDays(dailyCounts, year, month);
      setData(d);
    }, [year, month, dailyCounts]);

  const maxValue = data?.length
    ? Math.max(1, ...data.map((d) => d.value))
    : 1;

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <span className="whitespace-nowrap">年</span>
          <select
            className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            aria-label="表示する年"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}年
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <span className="whitespace-nowrap">月</span>
          <select
            className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            aria-label="表示する月"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {m}月
              </option>
            ))}
          </select>
        </label>
      </div>
    {data && (
      <div>
        <p className="my-5 text-sm">月間アクセス（会話）総数：{monthlyTotal}</p>
      <div className="flex items-end gap-2 h-64 border-b border-gray-300">
      {data.map(({ date, day, value }) => {
        const height = (value / maxValue) * 100;

        return (
          <div key={date} className="flex flex-col items-center flex-1 h-full">
            <div className="text-xs mb-1">{value}</div>

            <div className="flex-1 w-full flex items-end">
              <div
                className="w-full bg-blue-500 rounded-t min-h-[2px]"
                style={{ height: `${height}%` }}
              />
            </div>

            <div className="text-[10px] mt-1">{day}</div>
          </div>
        );
      })}
    </div>
    </div>
    )}

    </div>
  );
}