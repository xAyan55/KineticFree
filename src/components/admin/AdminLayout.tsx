import React from "react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"

export const AdminLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <DashboardLayout isAdminView={true}>{children}</DashboardLayout>
}
