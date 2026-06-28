'use client'

import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import LeaveRequestForm from '@/components/employee/LeaveRequestForm'
import LeaveRequestsList from '@/components/employee/LeaveRequestsList'
import LeaveRequestsManagement from '@/components/admin/LeaveRequestsManagement'

function LeaveContent() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <DashboardLayout>
      {user.role === 'admin' ? (
        <LeaveRequestsManagement />
      ) : (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Leave Requests</h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LeaveRequestForm onSuccess={() => window.location.reload()} />
            <LeaveRequestsList />
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default function LeavePage() {
  return (
    <AuthProvider>
      <LeaveContent />
    </AuthProvider>
  )
}
