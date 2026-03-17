import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { DashboardKPIs } from "@/components/dashboard/dashboard-kpis"
import { MonthlyRevenueChart } from "@/components/dashboard/widgets/monthly-revenue-chart"
import { ProjectStatusPie } from "@/components/dashboard/widgets/project-status-pie"
import { RecentTasks } from "@/components/dashboard/widgets/recent-tasks"
import { ActivityFeed } from "@/components/dashboard/widgets/activity-feed"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">대시보드</h1>
          <p className="text-sm text-muted-foreground">프로젝트, 조직, 근태 현황을 한눈에 확인하세요.</p>
        </div>
        <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
          실시간 데모 데이터
        </Badge>
      </div>

      <DashboardKPIs />

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>월별 매출</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <MonthlyRevenueChart />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>프로젝트 상태</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ProjectStatusPie />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>최근 업무</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentTasks />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

