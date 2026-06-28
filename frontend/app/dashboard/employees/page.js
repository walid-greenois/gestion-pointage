'use client'

import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import EmployeeManagement from '@/components/admin/EmployeeManagement'
import QRCodeGenerator from '@/components/admin/QRCodeGenerator'

function EmployeesContent() {
  const { user } = useAuth()

  if (!user) return null

  if (user.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Access denied. Admin only.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <EmployeeManagement />
    </DashboardLayout>
  )
}

export default function EmployeesPage() {
  return (
    <AuthProvider>
      <EmployeesContent />
    </AuthProvider>
  )
}
