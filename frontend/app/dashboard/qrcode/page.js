'use client'

import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import QRCodeGenerator from '@/components/admin/QRCodeGenerator'

function QRCodeContent() {
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
      <QRCodeGenerator />
    </DashboardLayout>
  )
}

export default function QRCodePage() {
  return (
    <AuthProvider>
      <QRCodeContent />
    </AuthProvider>
  )
}
