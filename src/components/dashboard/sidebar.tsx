"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronsLeft, ChevronsRight, Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { NAV_ITEMS } from "@/components/dashboard/nav-items"

type SidebarProps = {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState(false)

  React.useEffect(() => {
    const stored = window.localStorage.getItem("erp_sidebar_collapsed")
    if (stored === "1") setCollapsed(true)
  }, [])

  React.useEffect(() => {
    window.localStorage.setItem("erp_sidebar_collapsed", collapsed ? "1" : "0")
  }, [collapsed])

  return (
    <aside
      className={cn(
        "hidden h-screen border-r bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out md:flex md:flex-col",
        collapsed ? "w-[72px]" : "w-[260px]",
        className
      )}
    >
      <div className={cn("flex h-14 items-center justify-between px-3", collapsed && "justify-center px-2")}>
        <Link href="/dashboard" className={cn("flex items-center gap-2.5", collapsed && "hidden")}>
          <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-tight">Devon ERP</div>
            <div className="text-[11px] font-medium text-muted-foreground">Enterprise Platform</div>
          </div>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed((v) => !v)}
          className={cn("ml-auto h-8 w-8 rounded-lg", collapsed && "ml-0")}
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          <span className="sr-only">사이드바 {collapsed ? "펼치기" : "접기"}</span>
        </Button>
      </div>
      <Separator />
      <nav className="flex-1 space-y-0.5 p-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                collapsed && "justify-center px-2"
              )}
              title={item.title}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
              <span className={cn("truncate", collapsed && "hidden")}>{item.title}</span>
            </Link>
          )
        })}
      </nav>
      <Separator />
      <div className={cn("p-3 text-xs text-muted-foreground/70", collapsed && "hidden")}>
        © {new Date().getFullYear()} Devon ERP
      </div>
    </aside>
  )
}
