"use client"

import * as React from "react"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import { CheckCircle2, MessageSquare, PlusCircle, User } from "lucide-react"

import { cn } from "@/lib/utils"

const items = [
  { icon: PlusCircle, text: "신규 프로젝트 “차세대 ERP 구축”이 생성되었습니다.", at: new Date(Date.now() - 1000 * 60 * 35) },
  { icon: User, text: "김민준 님이 프로젝트에 합류했습니다.", at: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  { icon: MessageSquare, text: "“대시보드 KPI 설계”에 코멘트가 추가되었습니다.", at: new Date(Date.now() - 1000 * 60 * 60 * 6) },
  { icon: CheckCircle2, text: "업무 “프로젝트 상태 배지”가 완료되었습니다.", at: new Date(Date.now() - 1000 * 60 * 60 * 18) },
]

export function ActivityFeed() {
  return (
    <div className="space-y-3">
      {items.map((it, idx) => {
        const Icon = it.icon
        return (
          <div key={idx} className="flex items-start gap-3">
            <div
              className={cn(
                "mt-0.5 grid size-8 place-items-center rounded-full border bg-muted/40 text-muted-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-sm">{it.text}</div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(it.at, { addSuffix: true, locale: ko })}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

