"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

import { cn } from "@/lib/utils"

const pathLabels: Record<string, string> = {
  dashboard: "대시보드",
  projects: "프로젝트",
  employees: "직원관리",
  departments: "부서관리",
  tasks: "업무관리",
  attendance: "근태관리",
  schedule: "일정관리",
  clients: "고객관리",
  products: "상품관리",
  invoices: "청구서",
  reports: "보고서",
}

export function Breadcrumb({ className }: { className?: string }) {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length <= 1) return null

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1.5 text-sm", className)}>
      <Link
        href="/dashboard"
        className="flex items-center text-muted-foreground transition-colors hover:text-foreground"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {segments.slice(1).map((seg, i) => {
        const href = "/" + segments.slice(0, i + 2).join("/")
        const label = pathLabels[seg] ?? seg
        const isLast = i === segments.length - 2
        return (
          <React.Fragment key={href}>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link href={href} className="text-muted-foreground transition-colors hover:text-foreground">
                {label}
              </Link>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
