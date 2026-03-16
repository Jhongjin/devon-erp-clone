"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { month: "1월", revenue: 2050000 },
  { month: "2월", revenue: 4050000 },
  { month: "3월", revenue: 3150000 },
  { month: "4월", revenue: 3550000 },
  { month: "5월", revenue: 4850000 },
  { month: "6월", revenue: 4350000 },
]

export function MonthlyRevenueChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ left: 8, right: 8 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={40}
          tickFormatter={(v) => `${Math.round(v / 1000000)}M`}
        />
        <Tooltip
          cursor={{ fill: "hsl(var(--muted) / 0.6)" }}
          formatter={(value: number | string) =>
            typeof value === "number" ? [`₩ ${value.toLocaleString("ko-KR")}`, "매출"] : [value, "매출"]
          }
        />
        <Bar dataKey="revenue" radius={[6, 6, 0, 0]} fill="hsl(var(--chart-2))" />
      </BarChart>
    </ResponsiveContainer>
  )
}

