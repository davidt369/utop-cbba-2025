"use client"

import type React from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { useAuthStore } from "@/store/auth.store"
import { redirect } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
      const token = useAuthStore(state => state.token)
      const user = useAuthStore(state => state.user)
      // Wait for auth store hydration to prevent premature redirect
      const hasHydrated = useAuthStore(state => state._hasHydrated)
      if (!hasHydrated) {
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        )
      }
      if (!token && !user) redirect('/login')
    return (
      <AuthGuard>
      <div className="flex h-screen bg-background">
        {/* Desktop sidebar */}
        <DashboardSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}