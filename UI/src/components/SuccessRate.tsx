export function SuccessRate() {
  const successRate = 98;
  const circumference = 2 * Math.PI * 54; // radius of 54
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (successRate / 100) * circumference;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Success rate</h3>
      
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 mb-6">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="#E5E7EB"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="#10B981"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300 ease-in-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">{successRate}%</span>
            <span className="text-xs text-gray-500">Successful</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-8 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">1</div>
              <div className="text-gray-500">Unsuccessful</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">150</div>
              <div className="text-gray-500">Successful</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}