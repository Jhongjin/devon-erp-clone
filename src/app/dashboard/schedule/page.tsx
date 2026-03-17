import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">일정관리</h1>
          <p className="text-sm text-muted-foreground">팀의 주요 일정을 월간 캘린더로 관리합니다.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>월간 캘린더</CardTitle>
        </CardHeader>
        <CardContent className="h-[540px]">
          <div className="flex h-full items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
            캘린더 UI는 추후 devon 원본 디자인과 동일하게 구현 예정입니다.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

