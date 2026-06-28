'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/axios'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Check, X } from 'lucide-react'

export default function LeaveRequestsManagement() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await api.get('/leave/all')
      setRequests(response.data.leaveRequests)
    } catch (error) {
      console.error('Error fetching leave requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (id, status, comment) => {
    try {
      await api.put(`/leave/${id}/review`, { status, comment })
      fetchRequests()
    } catch (error) {
      alert('Failed to review leave request')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div className="animate-pulse">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Leave Requests</h1>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {requests.length === 0 ? (
              <p className="text-muted-foreground">No leave requests found</p>
            ) : (
              requests.map((request) => (
                <div key={request._id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">
                        {request.employeeId?.firstName} {request.employeeId?.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{request.employeeId?.department}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground capitalize">{request.type} Leave</p>
                  <p className="text-sm text-muted-foreground">{request.days} days</p>
                  
                  {request.status === 'pending' && (
                    <div className="flex items-center space-x-2 mt-4">
                      <Button
                        size="sm"
                        onClick={() => handleReview(request._id, 'approved', 'Approved')}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReview(request._id, 'rejected', 'Rejected')}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
