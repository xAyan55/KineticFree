import React from "react"
import { Sidebar } from "./Sidebar"
import { X } from "lucide-react"

interface MobileSidebarProps {
  open: boolean
  onClose: () => void
  isAdminView?: boolean
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({
  open,
  onClose,
  isAdminView = false,
}) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="relative flex w-full max-w-xs flex-1 flex-col bg-zinc-950">
        <button
          onClick={onClose}
          className="absolute right-3 top-4 z-50 rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </button>
        <Sidebar onClose={onClose} isAdminView={isAdminView} />
      </div>
    </div>
  )
}
