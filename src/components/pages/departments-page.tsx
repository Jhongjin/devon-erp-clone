"use client"

import * as React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type Department = { id: string; name: string; description: string | null }
type Employee = { id: string; department_id: string | null }

export function DepartmentsPageClient() {
  const supabase = React.useMemo(() => createClient(), [])
  const [loading, setLoading] = React.useState(true)
  const [departments, setDepartments] = React.useState<Department[]>([])
  const [employees, setEmployees] = React.useState<Employee[]>([])

  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Department | null>(null)
  const [form, setForm] = React.useState({ name: "", description: "" })

  const refresh = React.useCallback(async () => {
    setLoading(true)
    const [{ data: d }, { data: e }] = await Promise.all([
      supabase.from("departments").select("id,name,description").order("name"),
      supabase.from("employees").select("id,department_id"),
    ])
    setDepartments((d as Department[]) ?? [])
    setEmployees((e as Employee[]) ?? [])
    setLoading(false)
  }, [supabase])

  React.useEffect(() => {
    void refresh()
  }, [refresh])

  function countEmployees(deptId: string) {
    return employees.filter((e) => e.department_id === deptId).length
  }

  function openCreate() {
    setEditing(null)
    setForm({ name: "", description: "" })
    setOpen(true)
  }

  function openEdit(d: Department) {
    setEditing(d)
    setForm({ name: d.name ?? "", description: d.description ?? "" })
    setOpen(true)
  }

  async function onSave() {
    if (!form.name.trim()) return
    const payload = { name: form.name.trim(), description: form.description.trim() || null }
    if (editing) {
      await supabase.from("departments").update(payload).eq("id", editing.id)
    } else {
      await supabase.from("departments").insert(payload)
    }
    setOpen(false)
    await refresh()
  }

  async function onDelete(id: string) {
    await supabase.from("departments").delete().eq("id", id)
    await refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">부서 관리</h1>
          <p className="text-sm text-muted-foreground">부서 카드 뷰 및 CRUD를 제공합니다.</p>
        </div>
        <Button onClick={openCreate}>부서 추가</Button>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">불러오는 중…</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((d) => (
            <Card key={d.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3">
                  <span className="truncate">{d.name}</span>
                  <span className="text-sm font-medium text-muted-foreground">{countEmployees(d.id)}명</span>
                </CardTitle>
                <CardDescription className="line-clamp-2">{d.description ?? "설명이 없습니다."}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(d)}>
                  수정
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(d.id)}>
                  삭제
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{editing ? "부서 수정" : "부서 추가"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="name">부서명</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desc">설명</Label>
              <Textarea
                id="desc"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
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

