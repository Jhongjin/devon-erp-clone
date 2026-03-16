"use client"

import * as React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

type Department = { id: string; name: string }
type Employee = {
  id: string
  name: string
  email: string
  phone: string | null
  position: string | null
  status: string
  department_id: string | null
  hire_date: string | null
  salary: number | null
}

const statusOptions = ["재직", "휴직", "퇴사"] as const

export function EmployeesPageClient() {
  const supabase = React.useMemo(() => createClient(), [])
  const [loading, setLoading] = React.useState(true)
  const [departments, setDepartments] = React.useState<Department[]>([])
  const [rows, setRows] = React.useState<Employee[]>([])
  const [query, setQuery] = React.useState("")
  const [deptFilter, setDeptFilter] = React.useState<string>("all")

  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Employee | null>(null)
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    status: "재직",
    department_id: "none",
    hire_date: "",
    salary: "",
  })

  const refresh = React.useCallback(async () => {
    setLoading(true)
    const [{ data: deptData }, { data: empData }] = await Promise.all([
      supabase.from("departments").select("id,name").order("name"),
      supabase.from("employees").select("*").order("created_at", { ascending: false }),
    ])
    setDepartments(deptData ?? [])
    setRows((empData as Employee[]) ?? [])
    setLoading(false)
  }, [supabase])

  React.useEffect(() => {
    void refresh()
  }, [refresh])

  const filtered = rows.filter((r) => {
    const q = query.trim().toLowerCase()
    const qOk = !q || [r.name, r.email, r.phone ?? "", r.position ?? ""].some((v) => v.toLowerCase().includes(q))
    const dOk = deptFilter === "all" || r.department_id === deptFilter
    return qOk && dOk
  })

  function openCreate() {
    setEditing(null)
    setForm({
      name: "",
      email: "",
      phone: "",
      position: "",
      status: "재직",
      department_id: "none",
      hire_date: "",
      salary: "",
    })
    setOpen(true)
  }

  function openEdit(row: Employee) {
    setEditing(row)
    setForm({
      name: row.name ?? "",
      email: row.email ?? "",
      phone: row.phone ?? "",
      position: row.position ?? "",
      status: row.status ?? "재직",
      department_id: row.department_id ?? "none",
      hire_date: row.hire_date ?? "",
      salary: row.salary != null ? String(row.salary) : "",
    })
    setOpen(true)
  }

  async function onSave() {
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      position: form.position || null,
      status: form.status,
      department_id: form.department_id === "none" ? null : form.department_id,
      hire_date: form.hire_date || null,
      salary: form.salary ? Number(form.salary) : 0,
    }

    if (editing) {
      await supabase.from("employees").update(payload).eq("id", editing.id)
    } else {
      await supabase.from("employees").insert(payload)
    }
    setOpen(false)
    await refresh()
  }

  async function onDelete(id: string) {
    await supabase.from("employees").delete().eq("id", id)
    await refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">직원 관리</h1>
          <p className="text-sm text-muted-foreground">직원 정보를 검색/필터링하고 CRUD를 수행합니다.</p>
        </div>
        <Button onClick={openCreate}>직원 추가</Button>
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <CardTitle>직원 목록</CardTitle>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="이름/이메일/직책 검색" />
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="w-full md:w-[240px]">
                <SelectValue placeholder="부서 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 부서</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이름</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>부서</TableHead>
                  <TableHead>직책</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      불러오는 중…
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      결과가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="text-muted-foreground">{r.email}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {departments.find((d) => d.id === r.department_id)?.name ?? "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{r.position ?? "-"}</TableCell>
                      <TableCell>
                        <Badge variant={r.status === "재직" ? "default" : r.status === "휴직" ? "secondary" : "outline"}>
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEdit(r)}>
                            수정
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => onDelete(r.id)}>
                            삭제
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <span className="hidden" />
        </DialogTrigger>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{editing ? "직원 수정" : "직원 추가"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="name">이름</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">전화</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>부서</Label>
                <Select value={form.department_id} onValueChange={(v) => setForm((f) => ({ ...f, department_id: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">미지정</SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>상태</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="position">직책</Label>
                <Input
                  id="position"
                  value={form.position}
                  onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="hire_date">입사일</Label>
                <Input
                  id="hire_date"
                  type="date"
                  value={form.hire_date}
                  onChange={(e) => setForm((f) => ({ ...f, hire_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="salary">연봉</Label>
              <Input
                id="salary"
                type="number"
                value={form.salary}
                onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button onClick={onSave}>{editing ? "저장" : "추가"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

