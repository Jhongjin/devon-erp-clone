"use client"

import * as React from "react"
import { toast } from "sonner"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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

  // 삭제 확인 다이얼로그
  const [deleteTarget, setDeleteTarget] = React.useState<Employee | null>(null)

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
      const { error } = await supabase.from("employees").update(payload).eq("id", editing.id)
      if (error) {
        toast.error("수정 실패", { description: error.message })
        return
      }
      toast.success("직원 정보가 수정되었습니다.")
    } else {
      const { error } = await supabase.from("employees").insert(payload)
      if (error) {
        toast.error("추가 실패", { description: error.message })
        return
      }
      toast.success("새 직원이 추가되었습니다.")
    }
    setOpen(false)
    await refresh()
  }

  async function onDelete() {
    if (!deleteTarget) return
    const { error } = await supabase.from("employees").delete().eq("id", deleteTarget.id)
    if (error) {
      toast.error("삭제 실패", { description: error.message })
    } else {
      toast.success(`"${deleteTarget.name}" 직원이 삭제되었습니다.`)
    }
    setDeleteTarget(null)
    await refresh()
  }

  function statusBadgeVariant(s: string) {
    if (s === "재직") return "default" as const
    if (s === "휴직") return "secondary" as const
    return "outline" as const
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">직원 관리</h1>
          <p className="text-sm text-muted-foreground">직원 정보를 검색/필터링하고 관리합니다.</p>
        </div>
        <Button onClick={openCreate}>직원 추가</Button>
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <CardTitle>직원 목록</CardTitle>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="이름/이메일/직책 검색" />
            <Select value={deptFilter} onValueChange={(v) => setDeptFilter(v ?? "all")}>
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
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 w-full animate-pulse rounded bg-muted" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-4xl">📋</div>
                        <p className="text-sm font-medium text-muted-foreground">결과가 없습니다.</p>
                        <p className="text-xs text-muted-foreground">검색 조건을 변경하거나 새 직원을 추가하세요.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r) => (
                    <TableRow key={r.id} className="transition-colors hover:bg-muted/50">
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="text-muted-foreground">{r.email}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {departments.find((d) => d.id === r.department_id)?.name ?? "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{r.position ?? "-"}</TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant(r.status)}>
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEdit(r)}>
                            수정
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(r)}>
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

      {/* 생성/수정 다이얼로그 */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className="hidden" />
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{editing ? "직원 수정" : "직원 추가"}</DialogTitle>
            <DialogDescription>
              {editing ? "직원 정보를 수정합니다." : "새 직원 정보를 입력합니다."}
            </DialogDescription>
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
                <Select value={form.department_id} onValueChange={(v) => setForm((f) => ({ ...f, department_id: v ?? "none" }))}>
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
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v ?? "재직" }))}>
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

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>직원 삭제</DialogTitle>
            <DialogDescription>
              &ldquo;{deleteTarget?.name}&rdquo; 직원을 정말 삭제하시겠습니까?
              <br />이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              취소
            </Button>
            <Button variant="destructive" onClick={onDelete}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
