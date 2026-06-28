'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/axios'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Search, Plus, Edit, Trash2 } from 'lucide-react'
import EmployeeModal from './EmployeeModal'

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  useEffect(() => {
    fetchEmployees()
  }, [search])

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees', { params: { search } })
      setEmployees(response.data.employees)
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this employee?')) return
    
    try {
      await api.delete(`/employees/${id}`)
      fetchEmployees()
    } catch (error) {
      alert('Failed to delete employee')
    }
  }

  const handleAddEmployee = () => {
    setSelectedEmployee(null)
    setShowModal(true)
  }

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee)
    setShowModal(true)
  }

  const handleModalSuccess = () => {
    fetchEmployees()
    setShowModal(false)
    setSelectedEmployee(null)
  }

  if (loading) {
    return <div className="animate-pulse">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Employees</h1>
        <Button onClick={handleAddEmployee}>
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="space-y-3">
            {employees.length === 0 ? (
              <p className="text-muted-foreground">No employees found</p>
            ) : (
              employees.map((employee) => (
                <div key={employee._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{employee.firstName} {employee.lastName}</p>
                    <p className="text-sm text-muted-foreground">{employee.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {employee.department} • {employee.position}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditEmployee(employee)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(employee._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <EmployeeModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedEmployee(null)
        }}
        employee={selectedEmployee}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}
