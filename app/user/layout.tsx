import type React from "react"
import { Header } from "@/components/header"
import { ThemeProvider } from "@/components/theme-provider"

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="w-full">{children}</main>
      </div>
    </ThemeProvider>
  )
}
