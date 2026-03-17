"use client"

import * as React from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { createClient } from "@/lib/supabase/client"

const colors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-4))", "hsl(var(--chart-3))"]
const statusOrder = ["계획", "진행중", "보류", "완료"]

export function ProjectStatusPie() {
  const [data, setData] = React.useState<{ name: string; value: number; color: string }[]>([])

  React.useEffect(() => {
    const supabase = createClient()
    supabase
      .from("projects")
      .select("status")
      .then(({ data: rows }) => {
        const counts: Record<string, number> = { 계획: 0, 진행중: 0, 보류: 0, 완료: 0 }
        ;(rows ?? []).forEach((r: { status?: string }) => {
          const s = r.status ?? "진행중"
          counts[s] = (counts[s] ?? 0) + 1
        })
        setData(
          statusOrder.map((name, i) => ({
            name,
            value: counts[name] ?? 0,
            color: colors[i] ?? colors[0],
          }))
        )
      })
  }, [])

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip formatter={(v: number | string) => [v, "건수"]} />
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {data.map((d) => (
          <div key={d.name} className="flex items-center justify-between rounded-md border px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: d.color }} />
              <span className="text-muted-foreground">{d.name}</span>
            </div>
            <span className="font-medium">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

