"use client"

import * as React from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Invoice = {
  id: string
  invoice_number: string
  client_id: string | null
  amount: number
  status: string
  issue_date: string | null
  due_date: string | null
}

type Client = { id: string; company_name: string }

const statusOptions = ["발행", "미수", "완료", "취소"] as const

export function InvoicesPageClient() {
  const supabase = React.useMemo(() => createClient(), [])
  const [loading, setLoading] = React.useState(true)
  const [rows, setRows] = React.useState<Invoice[]>([])
  const [clients, setClients] = React.useState<Client[]>([])
  const [query, setQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")

  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Invoice | null>(null)
  const [form, setForm] = React.useState({
    invoice_number: "",
    client_id: "none",
    amount: "",
    status: "발행",
    issue_date: "",
    due_date: "",
  })

  const refresh = React.useCallback(async () => {
    setLoading(true)
    const [invRes, cRes] = await Promise.all([
      supabase.from("invoices").select("*").order("created_at", { ascending: false }),
      supabase.from("clients").select("id,company_name").order("company_name"),
    ])
    setRows((invRes.data as Invoice[]) ?? [])
    setClients((cRes.data as Client[]) ?? [])
    setLoading(false)
  }, [supabase])

  React.useEffect(() => {
    void refresh()
  }, [refresh])

  const filtered = rows.filter((r) => {
    const q = query.trim().toLowerCase()
    const qOk = !q || [r.invoice_number].some((v) => v.toLowerCase().includes(q))
    const sOk = statusFilter === "all" || r.status === statusFilter
    return qOk && sOk
  })

  function openCreate() {
    setEditing(null)
    setForm({
      invoice_number: "",
      client_id: "none",
      amount: "",
      status: "발행",
      issue_date: "",
      due_date: "",
    })
    setOpen(true)
  }

  function openEdit(i: Invoice) {
    setEditing(i)
    setForm({
      invoice_number: i.invoice_number ?? "",
      client_id: i.client_id ?? "none",
      amount: i.amount != null ? String(i.amount) : "",
      status: i.status ?? "발행",
      issue_date: i.issue_date ?? "",
      due_date: i.due_date ?? "",
    })
    setOpen(true)
  }

  async function onSave() {
    const payload = {
      invoice_number: form.invoice_number,
      client_id: form.client_id === "none" ? null : form.client_id,
      amount: form.amount ? Number(form.amount) : 0,
      status: form.status,
      issue_date: form.issue_date || null,
      due_date: form.due_date || null,
    }
    if (editing) {
      await supabase.from("invoices").update(payload).eq("id", editing.id)
    } else {
      await supabase.from("invoices").insert(payload)
    }
    setOpen(false)
    await refresh()
  }

  async function onDelete(id: string) {
    await supabase.from("invoices").delete().eq("id", id)
    await refresh()
  }

  function statusBadgeVariant(s: string) {
    if (s === "완료") return "default" as const
    if (s === "미수") return "destructive" as const
    if (s === "취소") return "secondary" as const
    return "outline" as const
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">청구서 관리</h1>
          <p className="text-sm text-muted-foreground">청구서 목록 (번호, 금액, 상태) 및 CRUD를 제공합니다.</p>
        </div>
        <Button onClick={openCreate}>청구서 추가</Button>
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <CardTitle>청구서 목록</CardTitle>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="청구서 번호 검색"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                  <TableHead>청구서 번호</TableHead>
                  <TableHead>거래처</TableHead>
                  <TableHead>금액</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>발행일</TableHead>
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
                      <TableCell className="font-medium">{r.invoice_number}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {clients.find((c) => c.id === r.client_id)?.company_name ?? "-"}
                      </TableCell>
                      <TableCell>₩ {(r.amount ?? 0).toLocaleString("ko-KR")}</TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant(r.status)}>{r.status}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.issue_date ? format(new Date(r.issue_date), "yyyy-MM-dd", { locale: ko }) : "-"}
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
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{editing ? "청구서 수정" : "청구서 추가"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>청구서 번호</Label>
              <Input
                value={form.invoice_number}
                onChange={(e) => setForm((f) => ({ ...f, invoice_number: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>거래처</Label>
              <Select value={form.client_id} onValueChange={(v) => setForm((f) => ({ ...f, client_id: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">미지정</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>금액</Label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              />
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
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>발행일</Label>
                <Input
                  type="date"
                  value={form.issue_date}
                  onChange={(e) => setForm((f) => ({ ...f, issue_date: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>만기일</Label>
                <Input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
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
