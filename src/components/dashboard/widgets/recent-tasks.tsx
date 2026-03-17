"use client"

import * as React from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type TaskRow = { id: string; title: string; status: string; priority: string; due_date: string | null }

function priorityVariant(p: string) {
  if (p === "높음") return "destructive" as const
  if (p === "낮음") return "secondary" as const
  return "default" as const
}

export function RecentTasks() {
  const [rows, setRows] = React.useState<TaskRow[]>([])

  React.useEffect(() => {
    const supabase = createClient()
    supabase
      .from("tasks")
      .select("id,title,status,priority,due_date")
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => setRows((data as TaskRow[]) ?? []))
  }, [])

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
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
              최근 업무가 없습니다.
            </TableCell>
          </TableRow>
        ) : (
          rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.title}</TableCell>
              <TableCell>
                <Badge variant="outline">{r.status}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={priorityVariant(r.priority)}>{r.priority}</Badge>
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {r.due_date ? format(new Date(r.due_date), "M/d(EEE)", { locale: ko }) : "-"}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}

