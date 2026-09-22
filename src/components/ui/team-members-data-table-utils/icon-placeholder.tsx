import * as React from "react"
import {
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  MoreHorizontal,
  User,
  Pencil,
  Trash,
  UserCog,
  Search,
  Columns,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
  Shield,
  HelpCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface IconPlaceholderProps extends React.SVGProps<SVGSVGElement> {
  lucide?: string
  tabler?: string
  hugeicons?: string
  phosphor?: string
  remixicon?: string
  className?: string
}

const iconMap: Record<string, React.ComponentType<any>> = {
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  Ellipsis: MoreHorizontal,
  User,
  Pencil,
  Trash,
  UserCog,
  Search,
  Columns,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
  Shield,
}

export function IconPlaceholder({
  lucide,
  className,
  ...props
}: IconPlaceholderProps) {
  const IconComponent = (lucide && iconMap[lucide]) || HelpCircle
  return <IconComponent className={cn("size-4", className)} {...props} />
}
