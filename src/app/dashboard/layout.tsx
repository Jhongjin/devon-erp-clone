import type { ReactNode } from "react"

import { DashboardHeader } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Breadcrumb } from "@/components/dashboard/breadcrumb"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <DashboardHeader />
          <main className="mx-auto w-full max-w-7xl p-4 md:p-6">
            <Breadcrumb className="mb-4" />
            <div className="animate-fade-in-up">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}

