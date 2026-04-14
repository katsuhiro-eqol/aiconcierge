"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ConversationModal from "@/app/components/conversationModal";

type Cursor = { date: string } | null;
type DailyCounts = Record<string, number>;
type Props = {
  dailyCounts: DailyCounts;
  organization: string;
  event: string;
};
type ChartItem = {
  date: string;
  day: number;
  value: number;
};

export default function MonthlyBarChart({
  dailyCounts,
  organization,
  event,
}: Props) {
  const now = new Date();
  const defaultYear = now.getFullYear();
  const defaultMonth = now.getMonth() + 1;

  const [year, setYear] = useState(defaultYear);
  const [month, setMonth] = useState(defaultMonth);
  const [day, setDay] = useState<number>(1);
  const [isShow, setIsShow] = useState<boolean>(false);

  const [monthlyTotal, setMonthlyTotal] = useState<number | null>(null);
  const [data, setData] = useState<ChartItem[] | null>(null);
  const [page, setPage] = useState<number>(1);
  const [cursors, setCursors] = useState<Cursor[]>([]);

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

  const dayOptions = useMemo(() => {
    return getDaysInMonth(year, month);
  }, [year, month]);

  function getDaysInMonth(year: number, month: number): number[] {
    const last = new Date(year, month, 0).getDate();
    return Array.from({ length: last }, (_, i) => i + 1);
  }

  function fillMissingDays(
    dailyCounts: DailyCounts,
    year: number,
    month: number
  ): ChartItem[] {
    const monthStr = String(month).padStart(2, "0");
    const daysInMonth = new Date(year, month, 0).getDate();
    const result: ChartItem[] = [];
    let mt = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = String(day).padStart(2, "0");
      const date = `${year}-${monthStr}-${dayStr}`;
      const v = dailyCounts[date] ?? 0;
      mt += v;
      result.push({
        date,
        day,
        value: v,
      });
    }
    setMonthlyTotal(mt);
    return result;
  }

  const loadConversationData = (date: string) => {
    const selectedDay = Number(date.split("-")[2]);
    if (!Number.isFinite(selectedDay)) return;
    setDay(selectedDay);
  };

  useEffect(() => {
    const d = fillMissingDays(dailyCounts, year, month);
    setData(d);
  }, [year, month, dailyCounts]);

  useEffect(() => {
    if (!dayOptions.includes(day)) {
      setDay(dayOptions[0] ?? 1);
    }
  }, [dayOptions, day]);

  const maxValue = data?.length
    ? Math.max(1, ...data.map((d) => d.value))
    : 1;

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <select
            className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={year}
            onChange={(e) => {
              setYear(Number(e.target.value));
              setPage(1);
              setCursors([]);
            }}
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
          <select
            className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={month}
            onChange={(e) => {
              setMonth(Number(e.target.value));
              setPage(1);
              setCursors([]);
            }}
            aria-label="表示する月"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {m}月
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <select
            className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={day}
            onChange={(e) => {
              setDay(Number(e.target.value));
              setPage(1);
              setCursors([]);
            }}
            aria-label="表示する日"
          >
            {dayOptions.map((d) => (
              <option key={d} value={d}>
                {d}日
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => setIsShow(true)}
          className="ml-12 rounded p-2 text-sm text-white bg-blue-500 hover:bg-blue-600"
        >
          会話履歴を確認
        </button>
      </div>
      {data && (
        <div>
          <p className="my-5 text-sm">
            月間アクセス（会話）総数：{monthlyTotal}
          </p>
          <div className="h-64 w-full min-w-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 28, right: 12, left: 4, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: "#4b5563" }}
                  interval={0}
                  height={28}
                />
                <YAxis
                  domain={[0, maxValue]}
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#4b5563" }}
                  width={40}
                />
                <Tooltip
                  formatter={(value) => [
                    value != null ? Number(value) : 0,
                    "会話数",
                  ]}
                  labelFormatter={(label) => `${label}日`}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                  onClick={(item) => {
                    const payload = item.payload as ChartItem | undefined;
                    if (payload?.date) loadConversationData(payload.date);
                  }}
                >
                  <LabelList
                    dataKey="value"
                    position="top"
                    fontSize={11}
                    fill="#374151"
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {isShow && (
        <ConversationModal
          setIsShow={setIsShow}
          organization={organization}
          event={event}
          year={year}
          month={month}
          day={day}
        />
      )}
    </div>
  );
}
