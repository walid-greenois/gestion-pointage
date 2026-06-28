'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/axios'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Calendar, Clock, CheckCircle, AlertTriangle, XCircle, Clock4 } from 'lucide-react'
import { format } from 'date-fns'

export default function AttendanceHistory() {
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchAttendance()
  }, [page])

  const fetchAttendance = async () => {
    try {
      const response = await api.get('/attendance/history', { params: { page, limit: 10 } })
      setAttendance(response.data.attendance)
    } catch (error) {
      console.error('Error fetching attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case 'present':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          label: 'Present'
        }
      case 'late':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: AlertTriangle,
          label: 'Late'
        }
      case 'early_departure':
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: Clock4,
          label: 'Early Out'
        }
      case 'absent':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          label: 'Absent'
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Clock,
          label: status
        }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
        <CardTitle className="flex items-center space-x-2 text-xl">
          <Calendar className="h-6 w-6 text-primary" />
          <span>Attendance History</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {attendance.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No attendance records found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {attendance.map((record) => {
                const statusConfig = getStatusConfig(record.status)
                const StatusIcon = statusConfig.icon
                
                return (
                  <div 
                    key={record._id} 
                    className="group hover:shadow-lg transition-shadow duration-200 border-2 border-gray-100 rounded-xl p-4 hover:border-primary/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${statusConfig.color}`}>
                          <StatusIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {format(new Date(record.date), 'EEEE, MMMM dd, yyyy')}
                          </p>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>In: {record.checkIn?.time || '--:--'}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>Out: {record.checkOut?.time || '--:--'}</span>
                            </span>
                          </div>
                          {record.workHours && (
                            <p className="text-xs text-gray-500 mt-1">
                              Work hours: {record.workHours.actual}h
                              {record.workHours.overtime > 0 && ` (+${record.workHours.overtime}h overtime)`}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-xs font-bold ${statusConfig.color} border`}>
                        {statusConfig.label.toUpperCase()}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
