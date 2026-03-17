"use client"

import * as React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Client = {
  id: string
  company_name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  address: string | null
}

export function ClientsPageClient() {
  const supabase = React.useMemo(() => createClient(), [])
  const [loading, setLoading] = React.useState(true)
  const [rows, setRows] = React.useState<Client[]>([])
  const [query, setQuery] = React.useState("")

  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Client | null>(null)
  const [form, setForm] = React.useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    address: "",
  })

  const refresh = React.useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from("clients").select("*").order("created_at", { ascending: false })
    setRows((data as Client[]) ?? [])
    setLoading(false)
  }, [supabase])

  React.useEffect(() => {
    void refresh()
  }, [refresh])

  const filtered = rows.filter((r) => {
    const q = query.trim().toLowerCase()
    return (
      !q ||
      [r.company_name, r.contact_name ?? "", r.email ?? "", r.phone ?? "", r.address ?? ""].some((v) =>
        v.toLowerCase().includes(q)
      )
    )
  })

  function openCreate() {
    setEditing(null)
    setForm({ company_name: "", contact_name: "", email: "", phone: "", address: "" })
    setOpen(true)
  }

  function openEdit(c: Client) {
    setEditing(c)
    setForm({
      company_name: c.company_name ?? "",
      contact_name: c.contact_name ?? "",
      email: c.email ?? "",
      phone: c.phone ?? "",
      address: c.address ?? "",
    })
    setOpen(true)
  }

  async function onSave() {
    const payload = {
      company_name: form.company_name,
      contact_name: form.contact_name || null,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
    }
    if (editing) {
      await supabase.from("clients").update(payload).eq("id", editing.id)
    } else {
      await supabase.from("clients").insert(payload)
    }
    setOpen(false)
    await refresh()
  }

  async function onDelete(id: string) {
    await supabase.from("clients").delete().eq("id", id)
    await refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">거래처 관리</h1>
          <p className="text-sm text-muted-foreground">거래처 목록 및 CRUD를 제공합니다.</p>
        </div>
        <Button onClick={openCreate}>거래처 추가</Button>
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <CardTitle>거래처 목록</CardTitle>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="회사명/담당자/이메일 검색"
          />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>회사명</TableHead>
                  <TableHead>담당자</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>전화</TableHead>
                  <TableHead className="text-right">작업</TableHead>
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
                      <TableCell className="font-medium">{r.company_name}</TableCell>
                      <TableCell className="text-muted-foreground">{r.contact_name ?? "-"}</TableCell>
                      <TableCell className="text-muted-foreground">{r.email ?? "-"}</TableCell>
                      <TableCell className="text-muted-foreground">{r.phone ?? "-"}</TableCell>
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
            <DialogTitle>{editing ? "거래처 수정" : "거래처 추가"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>회사명</Label>
              <Input
                value={form.company_name}
                onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>담당자</Label>
              <Input
                value={form.contact_name}
                onChange={(e) => setForm((f) => ({ ...f, contact_name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>이메일</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>전화</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>주소</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
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
