'use client'

export default function RecentActivity({ activities = [] }) {
  const defaultActivities = [
    { id: 1, user: 'John Doe', action: 'Checked in', time: '09:15 AM', type: 'checkin' },
    { id: 2, user: 'Jane Smith', action: 'Checked out', time: '05:45 PM', type: 'checkout' },
    { id: 3, user: 'Bob Johnson', action: 'Requested leave', time: '02:30 PM', type: 'leave' },
    { id: 4, user: 'Alice Brown', action: 'Checked in', time: '08:50 AM', type: 'checkin' },
  ]

  const displayActivities = activities.length > 0 ? activities : defaultActivities

  const getTypeColor = (type) => {
    switch(type) {
      case 'checkin': return 'bg-green-100 text-green-800'
      case 'checkout': return 'bg-blue-100 text-blue-800'
      case 'leave': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {displayActivities.map((activity) => (
          <div key={activity.id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
            <div className="flex items-center space-x-4">
              <div className={`w-2 h-2 rounded-full ${activity.type === 'checkin' ? 'bg-green-500' : activity.type === 'checkout' ? 'bg-blue-500' : 'bg-yellow-500'}`}></div>
              <div>
                <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                <p className="text-xs text-gray-500">{activity.action}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(activity.type)}`}>
                {activity.type}
              </span>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
