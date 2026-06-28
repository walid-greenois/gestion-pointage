'use client'

import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ClientManagement from '@/components/admin/ClientManagement'

function ClientsContent() {
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
      <ClientManagement />
    </DashboardLayout>
  )
}

export default function ClientsPage() {
  return (
    <AuthProvider>
      <ClientsContent />
    </AuthProvider>
  )
}
