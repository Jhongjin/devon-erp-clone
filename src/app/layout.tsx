import type { Metadata } from "next"
// 로컬 시스템 폰트를 사용해 외부 폰트 의존성을 제거합니다.

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "Devon ERP Dashboard",
  description: "ERP 대시보드 데모 (Next.js + Supabase)",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
