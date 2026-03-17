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
import { Textarea } from "@/components/ui/textarea"

type Task = {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  project_id: string | null
  assignee_id: string | null
}

type Project = { id: string; name: string }
type Employee = { id: string; name: string }

const statusColumns = ["할일", "진행중", "완료"] as const
const priorityOptions = ["높음", "중간", "낮음"] as const

export function TasksPageClient() {
  const supabase = React.useMemo(() => createClient(), [])
  const [tasks, setTasks] = React.useState<Task[]>([])
  const [projects, setProjects] = React.useState<Project[]>([])
  const [employees, setEmployees] = React.useState<Employee[]>([])
  const [loading, setLoading] = React.useState(true)

  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Task | null>(null)
  const [form, setForm] = React.useState({
    title: "",
    description: "",
    status: "할일",
    priority: "중간",
    project_id: "none",
    assignee_id: "none",
    due_date: "",
  })

  const refresh = React.useCallback(async () => {
    setLoading(true)
    const [tRes, pRes, eRes] = await Promise.all([
      supabase.from("tasks").select("*").order("created_at", { ascending: false }),
      supabase.from("projects").select("id,name").order("name"),
      supabase.from("employees").select("id,name").order("name"),
    ])
    setTasks((tRes.data as Task[]) ?? [])
    setProjects((pRes.data as Project[]) ?? [])
    setEmployees((eRes.data as Employee[]) ?? [])
    setLoading(false)
  }, [supabase])

  React.useEffect(() => {
    void refresh()
  }, [refresh])

  function openCreate(initialStatus: string) {
    setEditing(null)
    setForm({
      title: "",
      description: "",
      status: initialStatus,
      priority: "중간",
      project_id: "none",
      assignee_id: "none",
      due_date: "",
    })
    setOpen(true)
  }

  function openEdit(task: Task) {
    setEditing(task)
    setForm({
      title: task.title,
      description: task.description ?? "",
      status: task.status,
      priority: task.priority,
      project_id: task.project_id ?? "none",
      assignee_id: task.assignee_id ?? "none",
      due_date: "",
    })
    setOpen(true)
  }

  async function onSave() {
    const payload = {
      title: form.title,
      description: form.description || null,
      status: form.status,
      priority: form.priority,
      project_id: form.project_id === "none" ? null : form.project_id,
      assignee_id: form.assignee_id === "none" ? null : form.assignee_id,
      due_date: form.due_date || null,
    }
    if (editing) {
      await supabase.from("tasks").update(payload).eq("id", editing.id)
    } else {
      await supabase.from("tasks").insert(payload)
    }
    setOpen(false)
    await refresh()
  }

  async function onDelete(id: string) {
    await supabase.from("tasks").delete().eq("id", id)
    await refresh()
  }

  function priorityBadgeVariant(p: string) {
    if (p === "높음") return "destructive" as const
    if (p === "낮음") return "secondary" as const
    return "default" as const
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">업무 관리</h1>
          <p className="text-sm text-muted-foreground">상태별 칼럼에서 업무를 관리합니다.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">불러오는 중…</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {statusColumns.map((status) => (
            <Card key={status} className="flex h-full flex-col">
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-sm font-medium">
                  {status}
                  <span className="ml-1 text-xs text-muted-foreground">
                    {tasks.filter((t) => t.status === status).length}
                  </span>
                </CardTitle>
                <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => openCreate(status)}>
                  +
                </Button>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-2">
                {tasks
                  .filter((t) => t.status === status)
                  .map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => openEdit(t)}
                      className="flex flex-col gap-1 rounded-md border bg-card px-3 py-2 text-left text-sm transition hover:border-primary"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{t.title}</span>
                        <Badge variant={priorityBadgeVariant(t.priority)}>{t.priority}</Badge>
                      </div>
                      {t.description && (
                        <span className="line-clamp-2 text-xs text-muted-foreground">{t.description}</span>
                      )}
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {t.project_id && (
                          <span>
                            프로젝트: {projects.find((p) => p.id === t.project_id)?.name ?? t.project_id.slice(0, 6)}
                          </span>
                        )}
                        {t.assignee_id && (
                          <span>담당: {employees.find((e) => e.id === t.assignee_id)?.name ?? "알 수 없음"}</span>
                        )}
                      </div>
                    </button>
                  ))}
                {tasks.filter((t) => t.status === status).length === 0 && (
                  <p className="text-xs text-muted-foreground">등록된 업무가 없습니다.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>{editing ? "업무 수정" : "업무 추가"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>제목</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>설명</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <Label>상태</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v ?? "할일" }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusColumns.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>우선순위</Label>
                <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v ?? "중간" }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>기한</Label>
                <Input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>프로젝트</Label>
                <Select
                  value={form.project_id}
                  onValueChange={(v) => setForm((f) => ({ ...f, project_id: v ?? "none" }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">미지정</SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>담당자</Label>
                <Select
                  value={form.assignee_id}
                  onValueChange={(v) => setForm((f) => ({ ...f, assignee_id: v ?? "none" }))}
                >
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button onClick={onSave}>{editing ? "저장" : "추가"}</Button>
            {editing && (
              <Button variant="destructive" onClick={() => onDelete(editing.id)}>
                삭제
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

