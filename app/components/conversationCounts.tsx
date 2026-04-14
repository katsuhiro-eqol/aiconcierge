"use client";

import React, { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type MonthlyCounts = Record<string, number>;
type Props = {
  monthlyCounts: MonthlyCounts;
};

type Row = { ym: string; count: number };

/** 現在月を含む過去12ヶ月分の YYYY-MM キー（古い順 → 新しい順） */
function last12YearMonthKeys(reference = new Date()): string[] {
  const keys: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(
      reference.getFullYear(),
      reference.getMonth() - i,
      1
    );
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    keys.push(`${y}-${m}`);
  }
  return keys;
}

/** 1月のみ `2026/1`、それ以外は月の数字のみ */
function formatXAxisTick(ym: string): string {
  const [y, m] = ym.split("-");
  const month = parseInt(m, 10);
  if (Number.isNaN(month)) return ym;
  if (month === 1) return `${y}/1`;
  return String(month);
}

export default function ConversationCounts({ monthlyCounts }: Props) {
  const data: Row[] = useMemo(() => {
    const keys = last12YearMonthKeys();
    return keys.map((ym) => ({
      ym,
      count: Math.max(0, Number(monthlyCounts[ym] ?? 0) || 0),
    }));
  }, [monthlyCounts]);

  const maxVal = useMemo(
    () => Math.max(1, ...data.map((d) => d.count)),
    [data]
  );

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-1 text-sm font-semibold text-gray-800">
        月次会話数（過去12ヶ月）
      </h3>
      <p className="mb-4 text-xs text-gray-500">
        データがない月は 0 として表示します。
      </p>

      <div className="h-[280px] w-full min-w-[280px] max-w-3xl">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
          >
            <CartesianGrid stroke="#f3f4f6" strokeDasharray="4 4" />
            <XAxis
              dataKey="ym"
              tickFormatter={formatXAxisTick}
              tick={{ fontSize: 11, fill: "#4b5563" }}
              interval={0}
              height={36}
            />
            <YAxis
              domain={[0, maxVal]}
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "#4b5563" }}
              width={40}
            />
            <Tooltip
              labelFormatter={(ym) => String(ym)}
              formatter={(value) => [
                value != null ? Number(value) : 0,
                "会話数",
              ]}
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid #e5e7eb",
              }}
            />
            <Line
              type="linear"
              dataKey="count"
              name="会話数"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 3.5, fill: "#1d4ed8" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
