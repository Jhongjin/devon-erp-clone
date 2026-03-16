"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronsLeft, ChevronsRight } from "lucide-react"

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
        "hidden h-screen border-r bg-sidebar text-sidebar-foreground md:flex md:flex-col",
        collapsed ? "w-[72px]" : "w-[260px]",
        className
      )}
    >
      <div className={cn("flex h-14 items-center justify-between px-3", collapsed && "justify-center px-2")}>
        <Link href="/dashboard" className={cn("flex items-center gap-2", collapsed && "hidden")}>
          <div className="grid size-8 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            D
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Devon ERP</div>
            <div className="text-xs text-muted-foreground">Dashboard</div>
          </div>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed((v) => !v)}
          className={cn("ml-auto", collapsed && "ml-0")}
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          <span className="sr-only">사이드바 {collapsed ? "펼치기" : "접기"}</span>
        </Button>
      </div>
      <Separator />
      <nav className="flex-1 space-y-1 p-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                collapsed && "justify-center px-2"
              )}
              title={item.title}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className={cn("truncate", collapsed && "hidden")}>{item.title}</span>
            </Link>
          )
        })}
      </nav>
      <div className={cn("p-3 text-xs text-muted-foreground", collapsed && "hidden")}>
        © {new Date().getFullYear()} Devon ERP
      </div>
    </aside>
  )
}

