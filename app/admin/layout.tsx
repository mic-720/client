import type React from "react"
import { Header } from "@/components/header"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="min-h-screen">{children}</main>
    </div>
  )
}
