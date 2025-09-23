import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mar 1-7', revenue: 50000 },
  { name: 'Mar 8-14', revenue: 120000 },
  { name: 'Mar 15-21', revenue: 125000 },
  { name: 'Mar 22-28', revenue: 130000 },
  { name: 'Final wk', revenue: 180000 },
];

export function RevenueChart() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">
              You earned USD 3,000,000 this month.
            </h2>
            <p className="text-gray-600">👋 Hey Akshit!</p>
          </div>
          <div className="flex items-center space-x-2">
            <select className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700">
              <option>Last 30 days</option>
              <option>Last 60 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              tickFormatter={(value) => `${value / 1000}k`}
              domain={[0, 200000]}
            />
            <Bar 
              dataKey="revenue" 
              fill="#8B5CF6" 
              radius={[4, 4, 0, 0]}
              barSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}