"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

interface User {
  id: string
  email: string
  name: string
  role: string
  balance?: number
  profilePicture?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateProfile: (data: { name?: string; profilePicture?: string }) => Promise<{ success: boolean; error?: string }>
  loading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const isAuthenticated = !!user

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register", "/not-found", "/error"]
  const isPublicRoute = publicRoutes.includes(pathname)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    // Only redirect if not loading and not on a public route
    if (!loading && !isAuthenticated && !isPublicRoute && pathname !== "/register") {
      router.push("/login")
    }
  }, [loading, isAuthenticated, isPublicRoute, router, pathname])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        localStorage.removeItem("token")
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      localStorage.removeItem("token")
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      console.log("Auth context: Starting login for", email)

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      console.log("Auth context: Login response status", response.status)

      const data = await response.json()
      console.log("Auth context: Login response data", {
        success: response.ok,
        hasToken: !!data.token,
        hasUser: !!data.user,
        error: data.error,
      })

      if (response.ok) {
        localStorage.setItem("token", data.token)
        setUser(data.user)
        console.log("Auth context: Login successful")
        return { success: true }
      } else {
        console.log("Auth context: Login failed", data.error)
        return { success: false, error: data.error || "Login failed" }
      }
    } catch (error) {
      console.error("Auth context: Network error during login", error)
      return { success: false, error: "Network error" }
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      console.log("Auth context: Starting registration for", email)

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })

      console.log("Auth context: Registration response status", response.status)

      const data = await response.json()
      console.log("Auth context: Registration response data", {
        success: response.ok,
        hasUser: !!data.user,
        error: data.error,
      })

      if (response.ok) {
        console.log("Auth context: Registration successful")
        return { success: true }
      } else {
        console.log("Auth context: Registration failed", data.error)
        return { success: false, error: data.error || "Registration failed" }
      }
    } catch (error) {
      console.error("Auth context: Network error during registration", error)
      return { success: false, error: "Network error" }
    }
  }

  const updateProfile = async (data: { name?: string; profilePicture?: string }) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        setUser(result)
        return { success: true }
      } else {
        return { success: false, error: result.error || "Update failed" }
      }
    } catch (error) {
      return { success: false, error: "Network error" }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, loading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
