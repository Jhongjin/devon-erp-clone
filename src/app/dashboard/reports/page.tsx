import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { MonthlyRevenueChart } from "@/components/dashboard/widgets/monthly-revenue-chart"
import { ProjectStatusPie } from "@/components/dashboard/widgets/project-status-pie"

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">보고서</h1>
          <p className="text-sm text-muted-foreground">비즈니스 인사이트와 성과를 분석합니다.</p>
        </div>
        <p className="text-xs text-muted-foreground">마지막 업데이트: {new Date().toLocaleString("ko-KR")}</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">전체 개요</TabsTrigger>
          <TabsTrigger value="sales">영업 분석</TabsTrigger>
          <TabsTrigger value="projects">프로젝트</TabsTrigger>
          <TabsTrigger value="customers">고객 분석</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">총 매출</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">₩45.5억</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">총 고객</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">44</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">총 프로젝트</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">12</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">진행율</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">32%</CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>월별 매출 추이</CardTitle>
              </CardHeader>
              <CardContent className="h-[280px] min-h-[260px]">
                <MonthlyRevenueChart />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>프로젝트 상태별 분포</CardTitle>
              </CardHeader>
              <CardContent className="h-[280px] min-h-[260px]">
                <ProjectStatusPie />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>월별 매출 추이</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px] min-h-[280px]">
              <MonthlyRevenueChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>프로젝트 상태별 분포</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px] min-h-[280px]">
              <ProjectStatusPie />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>고객 분석</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              고객 유형 및 만족도 차트는 추후 연동 예정입니다.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

