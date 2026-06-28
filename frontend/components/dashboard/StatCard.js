'use client'

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  bgColor = 'bg-blue-500',
  textColor = 'text-blue-600',
  change,
  changeType = 'positive'
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className={`text-sm mt-2 ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
              {changeType === 'positive' ? '↑' : '↓'} {change} from last week
            </p>
          )}
        </div>
        <div className={`${bgColor} p-4 rounded-lg`}>
          {Icon && <Icon className="text-white" size={32} />}
        </div>
      </div>
    </div>
  )
}
