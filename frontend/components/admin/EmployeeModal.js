'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/axios'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'
import { X } from 'lucide-react'

export default function EmployeeModal({ isOpen, onClose, employee, onSuccess }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    employeeId: '',
    department: '',
    position: '',
    workSchedule: {
      startTime: '09:00',
      endTime: '17:00'
    }
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        email: employee.email || '',
        password: '',
        phone: employee.phone || '',
        employeeId: employee.employeeId || '',
        department: employee.department || '',
        position: employee.position || '',
        workSchedule: employee.workSchedule || {
          startTime: '09:00',
          endTime: '17:00'
        }
      })
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        employeeId: '',
        department: '',
        position: '',
        workSchedule: {
          startTime: '09:00',
          endTime: '17:00'
        }
      })
    }
  }, [employee, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const dataToSubmit = { ...formData }
      
      // Ne pas envoyer le mot de passe s'il est vide lors de la modification
      if (employee && !dataToSubmit.password) {
        delete dataToSubmit.password
      }

      if (employee) {
        await api.put(`/employees/${employee._id}`, dataToSubmit)
      } else {
        await api.post('/employees', dataToSubmit)
      }
      
      onSuccess()
      onClose()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save employee')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{employee ? 'Edit Employee' : 'Add New Employee'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID *</Label>
                <Input
                  id="employeeId"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Password {!employee && '*'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={employee ? 'Leave blank to keep current' : ''}
                  required={!employee}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">Work Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.workSchedule.startTime}
                  onChange={(e) => setFormData({
                    ...formData,
                    workSchedule: { ...formData.workSchedule, startTime: e.target.value }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">Work End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.workSchedule.endTime}
                  onChange={(e) => setFormData({
                    ...formData,
                    workSchedule: { ...formData.workSchedule, endTime: e.target.value }
                  })}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : (employee ? 'Update Employee' : 'Add Employee')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
