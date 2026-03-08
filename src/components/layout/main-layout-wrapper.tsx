"use client"

import React, { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { useUser } from "@/firebase"

export function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isUserLoading } = useUser()
  const isPublicPage = pathname === "/welcome"

  // Route Guard: Redirect to welcome if not authenticated and trying to access app
  useEffect(() => {
    if (!isUserLoading && !user && !isPublicPage) {
      router.push("/welcome")
    }
  }, [user, isUserLoading, isPublicPage, router])

  if (isPublicPage) {
    return <>{children}</>
  }

  // Show loading skeleton while checking auth for private routes
  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#020617] text-white">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
          <div className="h-12 w-12 rounded-full border-4 border-t-blue-500 border-blue-500/20 animate-spin" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 animate-pulse">Securing Command Center...</p>
        </div>
      </div>
    )
  }

  // Don't render dashboard content if not logged in
  if (!user) {
    return null
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white/50 backdrop-blur-md sticky top-0 z-40">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-muted-foreground">Command Center</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-bold text-accent">LIFELINE: ACTIVE</span>
              <span className="text-[10px] text-muted-foreground">Version 1.0.4-beta</span>
            </div>
          </div>
        </header>
        <main className="p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
