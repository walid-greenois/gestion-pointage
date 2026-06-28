'use client'

import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import AttendanceHistory from '@/components/employee/AttendanceHistory'

function AttendanceContent() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Attendance History</h1>
        <AttendanceHistory />
      </div>
    </DashboardLayout>
  )
}

export default function AttendancePage() {
  return (
    <AuthProvider>
      <AttendanceContent />
    </AuthProvider>
  )
}
