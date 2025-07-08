import { cn } from "@/lib/utils"

interface SimpleLoadingProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function SimpleLoading({ size = "md", className }: SimpleLoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn("border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin", sizeClasses[size])} />
    </div>
  )
}

export function SimplePageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-3 border-gray-300 border-t-black rounded-full animate-spin mx-auto" />
        <p className="text-gray-600">...</p>
      </div>
    </div>
  )
}

export function SimpleCardLoading() {
  return (
    <div className="space-y-4 p-6">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  )
}
