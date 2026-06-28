'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/axios'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'
import { Download, FileText, Calendar, Users, Filter } from 'lucide-react'

export default function ReportGenerator() {
  const [reportType, setReportType] = useState('attendance')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [department, setDepartment] = useState('')
  const [status, setStatus] = useState('')
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(null)

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/reports/departments')
      setDepartments(response.data.departments)
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }

  const handleGenerateReport = async () => {
    setLoading(true)
    try {
      const params = {}
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate
      if (employeeId) params.employeeId = employeeId
      if (department) params.department = department
      if (status) params.status = status

      const endpoint = reportType === 'attendance' ? '/reports/attendance' : '/reports/leave'
      const response = await api.get(endpoint, { params })
      setReport(response.data.report)
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadCSV = () => {
    if (!report) return

    let csvContent = ''
    
    if (reportType === 'attendance') {
      csvContent = 'Date,Employee Name,Email,Department,Position,Employee ID,Check In,Check Out,Status,Work Hours,Overtime\n'
      report.records.forEach(record => {
        csvContent += `${record.date},"${record.employee.name}","${record.employee.email}","${record.employee.department}","${record.employee.position}","${record.employee.employeeId}",${record.checkIn || 'N/A'},${record.checkOut || 'N/A'},${record.status},${record.workHours},${record.overtime}\n`
      })
    } else {
      csvContent = 'Employee Name,Email,Department,Position,Type,Start Date,End Date,Days,Reason,Status,Request Date\n'
      report.requests.forEach(request => {
        csvContent += `"${request.employee.name}","${request.employee.email}","${request.employee.department}","${request.employee.position}",${request.type},${request.startDate},${request.endDate},${request.days},"${request.reason}",${request.status},${request.createdAt}\n`
      })
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Generate Reports</h1>
        <p className="text-gray-600 mt-1">Generate attendance and leave reports</p>
      </div>

      {/* Report Type Selection */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setReportType('attendance')}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                reportType === 'attendance'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <FileText className="h-6 w-6 mx-auto mb-2" />
              <p className="font-medium">Attendance Report</p>
            </button>
            <button
              onClick={() => setReportType('leave')}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                reportType === 'leave'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Calendar className="h-6 w-6 mx-auto mb-2" />
              <p className="font-medium">Leave Report</p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                placeholder="Enter employee ID"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              />
            </div>

            {reportType === 'attendance' && (
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <select
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {reportType === 'leave' && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            )}

            <div className="flex items-end">
              <Button
                onClick={handleGenerateReport}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Results */}
      {report && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Report Results</CardTitle>
              <Button onClick={handleDownloadCSV} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {reportType === 'attendance' ? (
                <>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Records</p>
                    <p className="text-2xl font-bold text-gray-900">{report.statistics.totalRecords}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Present</p>
                    <p className="text-2xl font-bold text-green-600">{report.statistics.present}</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-gray-600">Late</p>
                    <p className="text-2xl font-bold text-yellow-600">{report.statistics.late}</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-gray-600">Absent</p>
                    <p className="text-2xl font-bold text-red-600">{report.statistics.absent}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{report.statistics.totalRequests}</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{report.statistics.pending}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-green-600">{report.statistics.approved}</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-gray-600">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">{report.statistics.rejected}</p>
                  </div>
                </>
              )}
            </div>

            {/* Records Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    {reportType === 'attendance' ? (
                      <>
                        <th className="text-left p-3">Date</th>
                        <th className="text-left p-3">Employee</th>
                        <th className="text-left p-3">Department</th>
                        <th className="text-left p-3">Check In</th>
                        <th className="text-left p-3">Check Out</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Work Hours</th>
                      </>
                    ) : (
                      <>
                        <th className="text-left p-3">Employee</th>
                        <th className="text-left p-3">Type</th>
                        <th className="text-left p-3">Start Date</th>
                        <th className="text-left p-3">End Date</th>
                        <th className="text-left p-3">Days</th>
                        <th className="text-left p-3">Status</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {reportType === 'attendance' ? (
                    report.records.map((record, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-3">{record.date}</td>
                        <td className="p-3">{record.employee.name}</td>
                        <td className="p-3">{record.employee.department}</td>
                        <td className="p-3">{record.checkIn || 'N/A'}</td>
                        <td className="p-3">{record.checkOut || 'N/A'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.status === 'present' ? 'bg-green-100 text-green-800' :
                            record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                            record.status === 'absent' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="p-3">{record.workHours}h</td>
                      </tr>
                    ))
                  ) : (
                    report.requests.map((request, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-3">{request.employee.name}</td>
                        <td className="p-3">{request.type}</td>
                        <td className="p-3">{request.startDate}</td>
                        <td className="p-3">{request.endDate}</td>
                        <td className="p-3">{request.days}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            request.status === 'approved' ? 'bg-green-100 text-green-800' :
                            request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {request.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
