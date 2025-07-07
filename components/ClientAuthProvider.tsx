"use client"

import type React from "react"
import { useEffect, useState } from "react"

interface ClientAuthWrapperProps {
  children: React.ReactNode
}

export default function ClientAuthWrapper({ children }: ClientAuthWrapperProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-xl">PSP</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">Payment Service Provider</h1>
          <div className="animate-pulse">
            <div className="h-2 bg-primary/20 rounded w-32 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
