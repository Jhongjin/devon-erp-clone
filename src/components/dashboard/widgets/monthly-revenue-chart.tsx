"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { createClient } from "@/lib/supabase/client"

const monthLabels = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]

export function MonthlyRevenueChart() {
  const [data, setData] = React.useState<{ month: string; revenue: number }[]>([])

  React.useEffect(() => {
    const supabase = createClient()
    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().slice(0, 10)

    supabase
      .from("invoices")
      .select("amount,issue_date")
      .gte("issue_date", sixMonthsAgo)
      .in("status", ["발행", "미수", "완료"])
      .then(({ data: rows }) => {
        const byMonth: Record<string, number> = {}
        for (let i = 0; i < 6; i++) {
          const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
          byMonth[key] = 0
        }
        ;(rows ?? []).forEach((r: { amount?: number; issue_date?: string }) => {
          if (r.issue_date) {
            const key = r.issue_date.slice(0, 7)
            if (byMonth[key] !== undefined) byMonth[key] += r.amount ?? 0
          }
        })
        const sorted = Object.entries(byMonth)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => {
            const [y, m] = k.split("-")
            const monthIdx = parseInt(m, 10) - 1
            return {
              month: monthLabels[monthIdx] ?? `${m}월`,
              revenue: v,
            }
          })
        setData(sorted)
      })
  }, [])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data.length ? data : [{ month: "-", revenue: 0 }]} margin={{ left: 8, right: 8 }}>
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

