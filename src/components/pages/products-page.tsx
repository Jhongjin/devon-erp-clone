"use client"

import * as React from "react"

import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Product = {
  id: string
  name: string
  description: string | null
  sku: string
  price: number
  stock_quantity: number
  category: string | null
}

export function ProductsPageClient() {
  const supabase = React.useMemo(() => createClient(), [])
  const [loading, setLoading] = React.useState(true)
  const [rows, setRows] = React.useState<Product[]>([])
  const [query, setQuery] = React.useState("")

  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Product | null>(null)
  const [form, setForm] = React.useState({
    name: "",
    description: "",
    sku: "",
    price: "",
    stock_quantity: "",
    category: "",
  })

  const refresh = React.useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false })
    setRows((data as Product[]) ?? [])
    setLoading(false)
  }, [supabase])

  React.useEffect(() => {
    void refresh()
  }, [refresh])

  const filtered = rows.filter((r) => {
    const q = query.trim().toLowerCase()
    return (
      !q ||
      [r.name, r.sku, r.category ?? "", r.description ?? ""].some((v) => v.toLowerCase().includes(q))
    )
  })

  function openCreate() {
    setEditing(null)
    setForm({ name: "", description: "", sku: "", price: "", stock_quantity: "", category: "" })
    setOpen(true)
  }

  function openEdit(p: Product) {
    setEditing(p)
    setForm({
      name: p.name ?? "",
      description: p.description ?? "",
      sku: p.sku ?? "",
      price: p.price != null ? String(p.price) : "",
      stock_quantity: p.stock_quantity != null ? String(p.stock_quantity) : "",
      category: p.category ?? "",
    })
    setOpen(true)
  }

  async function onSave() {
    const payload = {
      name: form.name,
      description: form.description || null,
      sku: form.sku,
      price: form.price ? Number(form.price) : 0,
      stock_quantity: form.stock_quantity ? Number(form.stock_quantity) : 0,
      category: form.category || null,
    }
    if (editing) {
      await supabase.from("products").update(payload).eq("id", editing.id)
    } else {
      await supabase.from("products").insert(payload)
    }
    setOpen(false)
    await refresh()
  }

  async function onDelete(id: string) {
    await supabase.from("products").delete().eq("id", id)
    await refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">상품 관리</h1>
          <p className="text-sm text-muted-foreground">상품 목록 (SKU, 가격, 재고) 및 CRUD를 제공합니다.</p>
        </div>
        <Button onClick={openCreate}>상품 추가</Button>
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <CardTitle>상품 목록</CardTitle>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="상품명/SKU/카테고리 검색"
          />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>상품명</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>가격</TableHead>
                  <TableHead>재고</TableHead>
                  <TableHead>카테고리</TableHead>
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
                      <TableCell>
                        <Badge variant="outline">{r.sku}</Badge>
                      </TableCell>
                      <TableCell>₩ {r.price?.toLocaleString("ko-KR") ?? "-"}</TableCell>
                      <TableCell>{r.stock_quantity ?? 0}</TableCell>
                      <TableCell className="text-muted-foreground">{r.category ?? "-"}</TableCell>
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
            <DialogTitle>{editing ? "상품 수정" : "상품 추가"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>상품명</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>SKU</Label>
              <Input value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>설명</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>가격</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>재고</Label>
                <Input
                  type="number"
                  value={form.stock_quantity}
                  onChange={(e) => setForm((f) => ({ ...f, stock_quantity: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>카테고리</Label>
              <Input
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
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
