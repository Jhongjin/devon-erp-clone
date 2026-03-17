import type { LucideIcon } from "lucide-react"
import { BadgeCheck, Briefcase, Building2, CalendarClock, ClipboardList, LayoutDashboard, Package, Receipt, Users } from "lucide-react"

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { title: "대시보드", href: "/dashboard", icon: LayoutDashboard },
  { title: "프로젝트", href: "/dashboard/projects", icon: Briefcase },
  { title: "직원관리", href: "/dashboard/employees", icon: Users },
  { title: "부서관리", href: "/dashboard/departments", icon: Building2 },
  { title: "업무관리", href: "/dashboard/tasks", icon: ClipboardList },
  { title: "근태관리", href: "/dashboard/attendance", icon: CalendarClock },
  { title: "일정관리", href: "/dashboard/schedule", icon: CalendarClock },
  { title: "고객관리", href: "/dashboard/clients", icon: BadgeCheck },
  { title: "상품관리", href: "/dashboard/products", icon: Package },
  { title: "청구서", href: "/dashboard/invoices", icon: Receipt },
  { title: "보고서", href: "/dashboard/reports", icon: LayoutDashboard },
]

