"use client"

import * as React from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type AttendanceRow = {
  id: string
  employee_id: string
  date: string
  check_in: string | null
  check_out: string | null
  status: string
}

type Employee = { id: string; name: string }

const statusOptions = ["정상", "지각", "결근", "휴가"] as const

export function AttendancePageClient() {
  const supabase = React.useMemo(() => createClient(), [])
  const [rows, setRows] = React.useState<AttendanceRow[]>([])
  const [employees, setEmployees] = React.useState<Employee[]>([])
  const [loading, setLoading] = React.useState(true)

  const [date, setDate] = React.useState<string>("")
  const [employeeFilter, setEmployeeFilter] = React.useState<string>("all")

  const refresh = React.useCallback(async () => {
    setLoading(true)
    const [aRes, eRes] = await Promise.all([
      supabase.from("attendance").select("*").order("date", { ascending: false }),
      supabase.from("employees").select("id,name").order("name"),
    ])
    setRows((aRes.data as AttendanceRow[]) ?? [])
    setEmployees((eRes.data as Employee[]) ?? [])
    setLoading(false)
  }, [supabase])

  React.useEffect(() => {
    void refresh()
  }, [refresh])

  const filtered = rows.filter((r) => {
    const dOk = !date || r.date === date
    const eOk = employeeFilter === "all" || r.employee_id === employeeFilter
    return dOk && eOk
  })

  function formatTime(v: string | null) {
    if (!v) return "-"
    const d = new Date(v)
    return format(d, "HH:mm")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">근태 관리</h1>
          <p className="text-sm text-muted-foreground">날짜별 출퇴근 기록과 상태를 확인합니다.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <CardTitle>근태 현황</CardTitle>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="grid gap-1">
              <Label>날짜</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="grid gap-1">
              <Label>직원</Label>
              <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 직원</SelectItem>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>직원</TableHead>
                  <TableHead>날짜</TableHead>
                  <TableHead>출근</TableHead>
                  <TableHead>퇴근</TableHead>
                  <TableHead>상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      불러오는 중…
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      결과가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">
                        {employees.find((e) => e.id === r.employee_id)?.name ?? "알 수 없음"}
                      </TableCell>
                      <TableCell>{format(new Date(r.date), "yyyy-MM-dd (EEE)", { locale: ko })}</TableCell>
                      <TableCell>{formatTime(r.check_in)}</TableCell>
                      <TableCell>{formatTime(r.check_out)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            r.status === "정상"
                              ? "default"
                              : r.status === "휴가"
                              ? "secondary"
                              : r.status === "지각"
                              ? "outline"
                              : "destructive"
                          }
                        >
                          {r.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

