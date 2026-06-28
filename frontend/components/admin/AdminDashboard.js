'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/axios'
import StatCard from '@/components/dashboard/StatCard'
import ChartCard from '@/components/dashboard/ChartCard'
import RecentActivity from '@/components/dashboard/RecentActivity'
import { Users, Clock, AlertCircle, Calendar } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/dashboard')
      setStats(response.data.stats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const statCards = [
    { title: 'Total Employees', value: stats?.totalEmployees || 0, icon: Users, bgColor: 'bg-blue-500', change: '12%', changeType: 'positive' },
    { title: 'Present Today', value: stats?.presentToday || 0, icon: Clock, bgColor: 'bg-green-500', change: '8%', changeType: 'positive' },
    { title: 'Late Today', value: stats?.lateToday || 0, icon: AlertCircle, bgColor: 'bg-yellow-500', change: '2%', changeType: 'negative' },
    { title: 'Pending Leaves', value: stats?.pendingLeaves || 0, icon: Calendar, bgColor: 'bg-purple-500', change: '5%', changeType: 'positive' }
  ]

  const attendanceChartData = [
    { name: 'Mon', value: 78 },
    { name: 'Tue', value: 85 },
    { name: 'Wed', value: 82 },
    { name: 'Thu', value: 88 },
    { name: 'Fri', value: 90 },
    { name: 'Sat', value: 45 },
    { name: 'Sun', value: 0 }
  ]

  const departmentData = [
    { name: 'Engineering', value: 45 },
    { name: 'Marketing', value: 28 },
    { name: 'Sales', value: 35 },
    { name: 'HR', value: 12 },
    { name: 'Finance', value: 18 }
  ]

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 text-sm mt-1">Welcome back! Here is your company overview.</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            bgColor={stat.bgColor}
            change={stat.change}
            changeType={stat.changeType}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Attendance Trend (Weekly)" data={attendanceChartData} type="line" dataKey="value" strokeColor="#10b981" />
        <ChartCard title="Employees by Department" data={departmentData} type="bar" dataKey="value" strokeColor="#3b82f6" />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <RecentActivity />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Attendance Rate</h3>
          <p className="text-4xl font-bold">{stats?.attendanceRate || '0'}%</p>
          <p className="text-blue-100 text-sm mt-2">Overall monthly attendance</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Avg Work Hours</h3>
          <p className="text-4xl font-bold">{stats?.avgWorkHours || '0'}h</p>
          <p className="text-green-100 text-sm mt-2">Per employee this week</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Active Users</h3>
          <p className="text-4xl font-bold">{stats?.totalEmployees || '0'}</p>
          <p className="text-purple-100 text-sm mt-2">Registered employees</p>
        </div>
      </div>
    </div>
  )
}
