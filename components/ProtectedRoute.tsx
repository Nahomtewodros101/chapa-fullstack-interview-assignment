"use client"

import type React from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string[]
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register", "/not-found", "/error", "/"]
  const isPublicRoute = publicRoutes.includes(pathname)

  useEffect(() => {
    if (!loading && !isAuthenticated && !isPublicRoute) {
      // Only redirect to login if not on a public route
      router.push("/login")
    }
  }, [loading, isAuthenticated, router, pathname, isPublicRoute])

  useEffect(() => {
    if (user && requiredRole && !requiredRole.includes(user.role)) {
      router.push("/dashboard") // Redirect to dashboard if insufficient permissions
    }
  }, [user, requiredRole, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
            <span className="text-primary-foreground font-bold text-xl">PSP</span>
          </div>
          <div className="space-y-2">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-lg font-medium">Loading your dashboard...</p>
            <p className="text-sm text-muted-foreground">Please wait while we prepare everything</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (requiredRole && user && !requiredRole.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto">
            <span className="text-red-600 dark:text-red-400 font-bold text-xl">!</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
