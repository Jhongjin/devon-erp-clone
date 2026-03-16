"use client"

import * as React from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const rows = [
  { title: "대시보드 KPI 설계", status: "진행중", priority: "높음", due: new Date("2025-03-25") },
  { title: "알림 UI", status: "진행중", priority: "중간", due: new Date("2025-04-05") },
  { title: "근태 테이블 설계", status: "진행중", priority: "중간", due: new Date("2025-03-27") },
  { title: "직원 테이블 UI", status: "할일", priority: "중간", due: new Date("2025-03-28") },
  { title: "프로젝트 상세 페이지", status: "할일", priority: "높음", due: new Date("2025-04-12") },
]

function priorityVariant(p: string) {
  if (p === "높음") return "destructive" as const
  if (p === "낮음") return "secondary" as const
  return "default" as const
}

export function RecentTasks() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>업무</TableHead>
          <TableHead className="w-[90px]">상태</TableHead>
          <TableHead className="w-[90px]">우선순위</TableHead>
          <TableHead className="w-[120px] text-right">기한</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.title}>
            <TableCell className="font-medium">{r.title}</TableCell>
            <TableCell>
              <Badge variant="outline">{r.status}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={priorityVariant(r.priority)}>{r.priority}</Badge>
            </TableCell>
            <TableCell className="text-right text-muted-foreground">
              {format(r.due, "M/d(EEE)", { locale: ko })}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

