import React from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Server,
  PlusCircle,
  User,
  Shield,
  KeyRound,
  LogOut,
  ExternalLink,
  ChevronRight,
  Database,
  Layers,
  Network,
  Cpu,
  FileCode,
  Sliders,
  History,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/auth/store"
import { Badge } from "@/components/ui/badge"

interface SidebarProps {
  onClose?: () => void
  isAdminView?: boolean
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose, isAdminView = false }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const userNav = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
    { label: "My Servers", href: "/dashboard/servers", icon: Server },
    { label: "Deploy Server", href: "/dashboard/servers/create", icon: PlusCircle },
  ]

  const accountNav = [
    { label: "Profile", href: "/account", icon: User },
    { label: "Security & 2FA", href: "/account/security", icon: Shield },
    { label: "API Credentials", href: "/account/api", icon: KeyRound },
  ]

  const adminNav = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard, exact: true },
    { label: "Servers", href: "/admin/servers", icon: Server },
    { label: "User Accounts", href: "/admin/users", icon: Users },
    { label: "Host Nodes", href: "/admin/nodes", icon: Cpu },
    { label: "Allocations & IPs", href: "/admin/allocations", icon: Network },
    { label: "Service Eggs", href: "/admin/eggs", icon: Layers },
    { label: "Audit Records", href: "/admin/audit-log", icon: History },
    { label: "Platform Settings", href: "/admin/settings", icon: Sliders },
  ]

  const isLinkActive = (href: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === href
    }
    return location.pathname === href || (href !== "/dashboard" && href !== "/admin" && location.pathname.startsWith(href))
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl text-zinc-300 select-none">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-5 border-b border-zinc-800/80">
        <Link to="/dashboard" onClick={onClose} className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center p-1.5 transition-transform group-hover:scale-105">
            <img src="/images/logo.png" alt="KineticHost" className="h-full w-full object-contain" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm tracking-tight text-white font-mono">KINETIC</span>
              <span className="text-xs px-1.5 py-0.2 bg-zinc-900 border border-zinc-700/60 rounded text-zinc-400 font-mono">HOST</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">Control Engine v2.4</span>
          </div>
        </Link>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
        {/* User Navigation or Admin Navigation */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
              {isAdminView ? "Admin Management" : "Server Operations"}
            </span>
            {isAdminView && (
              <Badge variant="zinc" className="text-[9px] py-0 px-1.5">ROOT</Badge>
            )}
          </div>
          <nav className="space-y-1">
            {(isAdminView ? adminNav : userNav).map((item) => {
              const active = isLinkActive(item.href, item.exact)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group relative",
                    active
                      ? "bg-zinc-800/90 text-white font-semibold shadow-inner border border-zinc-700/60"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60"
                  )}
                >
                  <Icon className={cn("h-4 w-4 transition-colors", active ? "text-white" : "text-zinc-500 group-hover:text-zinc-300")} />
                  <span>{item.label}</span>
                  {active && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Account Settings */}
        {!isAdminView && (
          <div>
            <div className="px-3 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
                Account & Security
              </span>
            </div>
            <nav className="space-y-1">
              {accountNav.map((item) => {
                const active = isLinkActive(item.href)
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group relative",
                      active
                        ? "bg-zinc-800/90 text-white font-semibold shadow-inner border border-zinc-700/60"
                        : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 transition-colors", active ? "text-white" : "text-zinc-500 group-hover:text-zinc-300")} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        )}

        {/* Mode Switcher for Admins */}
        {user?.role === "admin" && (
          <div className="pt-2">
            <div className="px-3 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
                Privilege Scope
              </span>
            </div>
            {isAdminView ? (
              <Link
                to="/dashboard"
                onClick={onClose}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-900/80 border border-zinc-800 hover:bg-zinc-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4 text-zinc-400" />
                  <span>Exit Admin Mode</span>
                </div>
                <ChevronRight className="h-3 w-3 text-zinc-500" />
              </Link>
            ) : (
              <Link
                to="/admin"
                onClick={onClose}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-amber-400" />
                  <span>Admin Control Center</span>
                </div>
                <Badge variant="warning" className="text-[9px] py-0 px-1">OPS</Badge>
              </Link>
            )}
          </div>
        )}

        {/* External Links */}
        <div className="pt-2">
          <div className="px-3 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
              Quick Links
            </span>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5 text-zinc-500" />
              KineticFree Landing
            </span>
          </a>
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/60">
        <div className="flex items-center justify-between gap-3 p-2 rounded-lg bg-zinc-900/70 border border-zinc-800/80">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="h-full w-full rounded-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase() || "U"
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-white truncate max-w-[90px]">{user?.name || "Anonymous"}</span>
                {user?.role === "admin" && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-white text-black font-mono font-bold">ADMIN</span>
                )}
              </div>
              <span className="text-[10px] text-zinc-400 truncate max-w-[110px] font-mono">{user?.email || "user@kinetic.host"}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="h-7 w-7 rounded flex items-center justify-center text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
