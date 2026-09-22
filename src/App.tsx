import React, { useEffect } from "react"
import { Routes, Route, useNavigate, useLocation } from "react-router-dom"
import { Hero } from "@/components/Hero"
import { Features } from "@/components/ui/features-8"

import { Footer } from "@/components/ui/large-name-footer"
import { AuthUI } from "@/components/ui/auth-fuse"

// Route Guards
import { ProtectedRoute } from "@/components/guards/ProtectedRoute"
import { AdminRoute } from "@/components/guards/AdminRoute"

// Layouts
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { ServerLayout } from "@/components/server/ServerLayout"

// User Dashboard Pages
import { DashboardOverview } from "@/pages/dashboard/DashboardOverview"
import { ServerList } from "@/pages/dashboard/ServerList"
import { CreateServer } from "@/pages/dashboard/CreateServer"

// Server Pages
import { ServerOverview } from "@/pages/server/ServerOverview"
import { Console } from "@/pages/server/Console"
import { FileManager } from "@/pages/server/FileManager"
import { FileEditor } from "@/pages/server/FileEditor"
import { Databases } from "@/pages/server/Databases"
import { Backups } from "@/pages/server/Backups"
import { Schedules } from "@/pages/server/Schedules"
import { Network } from "@/pages/server/Network"
import { Startup } from "@/pages/server/Startup"
import { ServerSettings } from "@/pages/server/ServerSettings"

// Account Pages
import { AccountProfile } from "@/pages/account/AccountProfile"
import { AccountSecurity } from "@/pages/account/AccountSecurity"
import { AccountApi } from "@/pages/account/AccountApi"

// Admin Pages
import { AdminOverview } from "@/pages/admin/AdminOverview"
import { AdminUsers } from "@/pages/admin/AdminUsers"
import { AdminServers } from "@/pages/admin/AdminServers"
import { AdminNodes } from "@/pages/admin/AdminNodes"
import { AdminAllocations } from "@/pages/admin/AdminAllocations"
import { AdminEggs } from "@/pages/admin/AdminEggs"
import { AdminAuditLog } from "@/pages/admin/AdminAuditLog"
import { AdminSettingsPage } from "@/pages/admin/AdminSettings"

// Error Pages
import { NotFound } from "@/pages/NotFound"

// Public Landing Page Component
function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-black text-white dark flex flex-col">
      {/* Top Hero landing page */}
      <Hero onOpenDashboard={() => navigate("/login")} />

      {/* Features Section */}
      <div id="features" className="relative z-20 border-t border-white/10 bg-black">
        <Features />
      </div>



      {/* Large Name Footer */}
      <Footer brandName="KineticHost" watermarkText="KineticHost" />
    </div>
  )
}

export function App() {
  const navigate = useNavigate()
  const location = useLocation()

  // Handle backward compatibility for hash navigation (#login, #dashboard)
  useEffect(() => {
    if (window.location.hash === "#login" || window.location.hash === "#dashboard") {
      navigate("/login", { replace: true })
    }
  }, [navigate])

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthUI defaultMode="signin" onBack={() => navigate("/")} />} />
      <Route path="/register" element={<AuthUI defaultMode="signup" onBack={() => navigate("/")} />} />

      {/* User Dashboard & Server Management (Protected) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardOverview />} />
        <Route path="servers" element={<ServerList />} />
        <Route path="servers/create" element={<CreateServer />} />

        {/* Server Nested Routes */}
        <Route path="servers/:id" element={<ServerLayout />}>
          <Route index element={<ServerOverview />} />
          <Route path="console" element={<Console />} />
          <Route path="files" element={<FileManager />} />
          <Route path="files/edit" element={<FileEditor />} />
          <Route path="databases" element={<Databases />} />
          <Route path="backups" element={<Backups />} />
          <Route path="schedules" element={<Schedules />} />
          <Route path="network" element={<Network />} />
          <Route path="startup" element={<Startup />} />
          <Route path="settings" element={<ServerSettings />} />
        </Route>
      </Route>

      {/* Account Settings (Protected) */}
      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AccountProfile />} />
        <Route path="security" element={<AccountSecurity />} />
        <Route path="api" element={<AccountApi />} />
      </Route>

      {/* Administration Control Center (Admin Protected) */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path="servers" element={<AdminServers />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="nodes" element={<AdminNodes />} />
        <Route path="allocations" element={<AdminAllocations />} />
        <Route path="eggs" element={<AdminEggs />} />
        <Route path="audit-log" element={<AdminAuditLog />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
