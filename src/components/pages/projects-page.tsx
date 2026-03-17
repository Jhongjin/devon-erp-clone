"use client"

import * as React from "react"

import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Department = { id: string; name: string }
type Employee = { id: string; name: string }

type Project = {
  id: string
  name: string
  description: string | null
  status: string
  start_date: string | null
  end_date: string | null
  budget: number | null
  department_id: string | null
  manager_id: string | null
}

const statusOptions = ["계획", "진행중", "보류", "완료"] as const

export function ProjectsPageClient() {
  const supabase = React.useMemo(() => createClient(), [])
  const [loading, setLoading] = React.useState(true)
  const [rows, setRows] = React.useState<Project[]>([])
  const [departments, setDepartments] = React.useState<Department[]>([])
  const [employees, setEmployees] = React.useState<Employee[]>([])

  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [query, setQuery] = React.useState("")

  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Project | null>(null)
  const [form, setForm] = React.useState({
    name: "",
    description: "",
    status: "진행중",
    start_date: "",
    end_date: "",
    budget: "",
    department_id: "none",
    manager_id: "none",
  })

  const refresh = React.useCallback(async () => {
    setLoading(true)
    const [pRes, dRes, eRes] = await Promise.all([
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
      supabase.from("departments").select("id,name").order("name"),
      supabase.from("employees").select("id,name").order("name"),
    ])
    setRows((pRes.data as Project[]) ?? [])
    setDepartments((dRes.data as Department[]) ?? [])
    setEmployees((eRes.data as Employee[]) ?? [])
    setLoading(false)
  }, [supabase])

  React.useEffect(() => {
    void refresh()
  }, [refresh])

  const filtered = rows.filter((r) => {
    const q = query.trim().toLowerCase()
    const qOk = !q || [r.name, r.description ?? ""].some((v) => v.toLowerCase().includes(q))
    const sOk = statusFilter === "all" || r.status === statusFilter
    return qOk && sOk
  })

  function openCreate() {
    setEditing(null)
    setForm({
      name: "",
      description: "",
      status: "진행중",
      start_date: "",
      end_date: "",
      budget: "",
      department_id: "none",
      manager_id: "none",
    })
    setOpen(true)
  }

  function openEdit(p: Project) {
    setEditing(p)
    setForm({
      name: p.name ?? "",
      description: p.description ?? "",
      status: p.status ?? "진행중",
      start_date: p.start_date ?? "",
      end_date: p.end_date ?? "",
      budget: p.budget != null ? String(p.budget) : "",
      department_id: p.department_id ?? "none",
      manager_id: p.manager_id ?? "none",
    })
    setOpen(true)
  }

  async function onSave() {
    const payload = {
      name: form.name,
      description: form.description || null,
      status: form.status,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      budget: form.budget ? Number(form.budget) : 0,
      department_id: form.department_id === "none" ? null : form.department_id,
      manager_id: form.manager_id === "none" ? null : form.manager_id,
    }
    if (editing) {
      await supabase.from("projects").update(payload).eq("id", editing.id)
    } else {
      await supabase.from("projects").insert(payload)
    }
    setOpen(false)
    await refresh()
  }

  async function onDelete(id: string) {
    await supabase.from("projects").delete().eq("id", id)
    await refresh()
  }

  function statusBadgeVariant(s: string) {
    if (s === "완료") return "default" as const
    if (s === "보류") return "secondary" as const
    if (s === "계획") return "outline" as const
    return "destructive" as const
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">전체 프로젝트</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{rows.length}건</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">진행중</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {rows.filter((r) => r.status === "진행중").length}건
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">완료</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {rows.filter((r) => r.status === "완료").length}건
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">보류</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {rows.filter((r) => r.status === "보류").length}건
          </CardContent>
        </Card>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">프로젝트</h1>
          <p className="text-sm text-muted-foreground">프로젝트 진행 상황과 담당자를 한눈에 확인하세요.</p>
        </div>
        <Button onClick={openCreate}>프로젝트 생성</Button>
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <CardTitle>프로젝트 목록</CardTitle>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="프로젝트명 / 설명 검색"
            />
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 상태</SelectItem>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
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
                  <TableHead>상태</TableHead>
                  <TableHead>부서</TableHead>
                  <TableHead>담당자</TableHead>
                  <TableHead>예산</TableHead>
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
                  filtered.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="max-w-[260px]">
                        <div className="font-medium">{p.name}</div>
                        {p.description && (
                          <div className="line-clamp-1 text-xs text-muted-foreground">{p.description}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant(p.status)}>{p.status}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {departments.find((d) => d.id === p.department_id)?.name ?? "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {employees.find((e) => e.id === p.manager_id)?.name ?? "-"}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {p.budget != null ? `₩ ${p.budget.toLocaleString("ko-KR")}` : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEdit(p)}>
                            수정
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => onDelete(p.id)}>
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
        <DialogContent className="sm:max-w-[620px]">
          <DialogHeader>
            <DialogTitle>{editing ? "프로젝트 수정" : "프로젝트 추가"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>이름</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>설명</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <Label>상태</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v ?? "진행중" }))}>
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
              <div className="grid gap-2">
                <Label>부서</Label>
                <Select
                  value={form.department_id}
                  onValueChange={(v) => setForm((f) => ({ ...f, department_id: v ?? "none" }))}
                >
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
                <Label>담당자</Label>
                <Select value={form.manager_id} onValueChange={(v) => setForm((f) => ({ ...f, manager_id: v ?? "none" }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">미지정</SelectItem>
                    {employees.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <Label>시작일</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>종료일</Label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>예산</Label>
                <Input
                  type="number"
                  value={form.budget}
                  onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                />
              </div>
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

