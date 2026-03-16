"use client"

import * as React from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

const data = [
  { name: "계획", value: 2, color: "hsl(var(--chart-1))" },
  { name: "진행중", value: 6, color: "hsl(var(--chart-2))" },
  { name: "보류", value: 1, color: "hsl(var(--chart-4))" },
  { name: "완료", value: 3, color: "hsl(var(--chart-3))" },
]

export function ProjectStatusPie() {
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

