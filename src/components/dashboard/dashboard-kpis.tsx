"use client"

import * as React from "react"
import { ArrowDown, ArrowUp, Briefcase, TrendingUp, Users, Wallet } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type KpiCard = {
  title: string
  value: string
  icon: React.ElementType
  trend?: { value: string; positive: boolean }
  color: string
}

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
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-20 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-3 w-16 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const cards: KpiCard[] = [
    {
      title: "총 직원수",
      value: `${kpis.totalEmployees}명`,
      icon: Users,
      trend: { value: "+2명", positive: true },
      color: "oklch(0.588 0.180 264)",
    },
    {
      title: "진행중 프로젝트",
      value: `${kpis.activeProjects}건`,
      icon: Briefcase,
      trend: { value: "+1건", positive: true },
      color: "oklch(0.650 0.200 160)",
    },
    {
      title: "이번달 매출",
      value: `₩ ${kpis.monthRevenue.toLocaleString("ko-KR")}`,
      icon: Wallet,
      trend: kpis.monthRevenue > 0 ? { value: "활성", positive: true } : { value: "데이터 없음", positive: false },
      color: "oklch(0.700 0.175 45)",
    },
    {
      title: "신규 거래처",
      value: `${kpis.newClients}곳`,
      icon: TrendingUp,
      trend: kpis.newClients > 0 ? { value: `+${kpis.newClients}곳`, positive: true } : undefined,
      color: "oklch(0.600 0.210 310)",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card
            key={card.title}
            className="card-hover kpi-accent-bar overflow-hidden"
            style={{ "--kpi-color": card.color } as React.CSSProperties}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <div
                className="grid size-9 place-items-center rounded-lg"
                style={{ backgroundColor: `color-mix(in oklch, ${card.color} 15%, transparent)` }}
              >
                <Icon className="h-4 w-4" style={{ color: card.color }} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{card.value}</div>
              {card.trend && (
                <div className={cn("mt-1 flex items-center gap-1 text-xs font-medium", card.trend.positive ? "text-success" : "text-muted-foreground")}>
                  {card.trend.positive ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )}
                  <span>{card.trend.value}</span>
                  <span className="text-muted-foreground font-normal">전월 대비</span>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
