"use client"

import * as React from "react"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DashboardKPIs() {
  const [kpis, setKpis] = React.useState({
    totalEmployees: 0,
    activeProjects: 0,
    monthRevenue: 0,
    newClients: 0,
  })
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const supabase = createClient()
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)

    async function fetchKPIs() {
      const [empRes, projRes, invRes, clientRes] = await Promise.all([
        supabase.from("employees").select("id", { count: "exact", head: true }),
        supabase.from("projects").select("id", { count: "exact", head: true }).eq("status", "진행중"),
        supabase
          .from("invoices")
          .select("amount")
          .gte("issue_date", thisMonthStart)
          .lte("issue_date", thisMonthEnd)
          .in("status", ["발행", "미수", "완료"]),
        supabase
          .from("clients")
          .select("id", { count: "exact", head: true })
          .gte("created_at", thisMonthStart),
      ])

      const monthRevenue =
        (invRes.data ?? []).reduce((sum: number, r: { amount?: number }) => sum + (r.amount ?? 0), 0) ?? 0

      setKpis({
        totalEmployees: empRes.count ?? 0,
        activeProjects: projRes.count ?? 0,
        monthRevenue,
        newClients: clientRes.count ?? 0,
      })
      setLoading(false)
    }
    void fetchKPIs()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">…</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold text-muted-foreground">-</CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">총 직원수</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">{kpis.totalEmployees}명</CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">진행중 프로젝트</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">{kpis.activeProjects}건</CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">이번달 매출</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">
          ₩ {kpis.monthRevenue.toLocaleString("ko-KR")}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">신규 거래처</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">{kpis.newClients}곳</CardContent>
      </Card>
    </div>
  )
}
