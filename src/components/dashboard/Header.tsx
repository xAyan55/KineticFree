import React from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Menu,
  Bell,
  Plus,
  Shield,
  Activity,
  User as UserIcon,
  LogOut,
  ChevronDown,
} from "lucide-react"
import { useAuthStore } from "@/lib/auth/store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  onOpenMobileMenu: () => void
  isAdminView?: boolean
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu, isAdminView = false }) => {
  const { user, logout } = useAuthStore()
  const location = useLocation()

  // Generate breadcrumb title
  const getPageTitle = () => {
    const p = location.pathname
    if (p === "/dashboard") return "Dashboard Overview"
    if (p === "/dashboard/servers") return "Server Fleet"
    if (p === "/dashboard/servers/create") return "Deploy New Server"
    if (p.startsWith("/dashboard/servers/")) {
      const parts = p.split("/")
      const sub = parts[3]
      if (!sub) return "Server Management"
      return `Server: ${sub.charAt(0).toUpperCase() + sub.slice(1)}`
    }
    if (p === "/account") return "Account Profile"
    if (p === "/account/security") return "Security & Two-Factor"
    if (p === "/account/api") return "API Credentials"
    if (p === "/admin") return "Admin System Control"
    if (p === "/admin/users") return "User Account Management"
    if (p === "/admin/servers") return "System Fleet Operations"
    if (p === "/admin/nodes") return "Host Node Clusters"
    if (p === "/admin/allocations") return "IP & Port Allocation Grid"
    if (p === "/admin/eggs") return "Service Egg Templates"
    if (p === "/admin/audit-log") return "Global Audit Ledger"
    if (p === "/admin/settings") return "Platform Configuration"
    return "Control Panel"
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-800/80 bg-black/80 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white md:hidden"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <h1 className="text-sm font-medium tracking-tight text-white font-mono sm:text-base">
            {getPageTitle()}
          </h1>
          {isAdminView && (
            <Badge variant="warning" className="text-[10px] uppercase font-mono py-0">
              Admin Scope
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Node status indicator */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-zinc-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] text-zinc-300">Kinetic-US-01 Online</span>
        </div>

        {!isAdminView && (
          <Button
            asChild
            size="sm"
            className="h-8 text-xs bg-white text-black hover:bg-zinc-200 font-semibold px-3 gap-1.5"
          >
            <Link to="/dashboard/servers/create">
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Deploy Server</span>
            </Link>
          </Button>
        )}

        {/* Notifications */}
        <button
          className="relative rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-blue-500" />
        </button>

        {/* User Menu Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg p-1 text-zinc-300 hover:bg-zinc-900 transition-colors focus:outline-none">
              <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-white">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="h-full w-full rounded-full object-cover" />
                ) : (
                  user?.name?.charAt(0).toUpperCase() || "U"
                )}
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-zinc-400 hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-xs font-medium text-white">{user?.name}</p>
                <p className="text-[11px] text-zinc-400 font-mono truncate">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/account" className="cursor-pointer">
                <UserIcon className="mr-2 h-3.5 w-3.5 text-zinc-400" />
                <span>Account Profile</span>
              </Link>
            </DropdownMenuItem>
            {user?.role === "admin" && (
              <DropdownMenuItem asChild>
                <Link to={isAdminView ? "/dashboard" : "/admin"} className="cursor-pointer">
                  <Shield className="mr-2 h-3.5 w-3.5 text-amber-400" />
                  <span>{isAdminView ? "Back to Dashboard" : "Admin Console"}</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout()}
              className="cursor-pointer text-rose-400 focus:text-rose-400 focus:bg-rose-500/10"
            >
              <LogOut className="mr-2 h-3.5 w-3.5" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
