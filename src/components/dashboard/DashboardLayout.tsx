import React, { useState } from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { MobileSidebar } from "./MobileSidebar"

interface DashboardLayoutProps {
  isAdminView?: boolean
  children?: React.ReactNode
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  isAdminView = false,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-black text-zinc-100 antialiased selection:bg-zinc-800 selection:text-white">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:shrink-0">
        <Sidebar isAdminView={isAdminView} />
      </div>

      {/* Mobile Drawer */}
      <MobileSidebar
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        isAdminView={isAdminView}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          isAdminView={isAdminView}
        />
        <main className="flex-1 overflow-y-auto bg-black p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  )
}
