import React, { useEffect } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuthStore } from "@/lib/auth/store"

export const ProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user, isLoading, isInitialized, checkSession } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    if (!isInitialized) {
      checkSession()
    }
  }, [isInitialized, checkSession])

  if (!isInitialized && isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          <p className="text-xs text-zinc-500 font-mono tracking-wider uppercase">Loading Session...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children ? <>{children}</> : <Outlet />
}
