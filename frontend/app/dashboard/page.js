'use client'

import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import AdminDashboard from '@/components/admin/AdminDashboard'
import CheckInOut from '@/components/employee/CheckInOut'
import AttendanceHistory from '@/components/employee/AttendanceHistory'

function DashboardContent() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <DashboardLayout>
      {user.role === 'admin' ? (
        <AdminDashboard />
      ) : (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CheckInOut />
            <AttendanceHistory />
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default function DashboardPage() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  )
}
