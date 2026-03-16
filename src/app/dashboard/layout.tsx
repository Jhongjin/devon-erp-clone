import type { ReactNode } from "react"

import { DashboardHeader } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <DashboardHeader />
          <main className="mx-auto w-full max-w-7xl p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}

