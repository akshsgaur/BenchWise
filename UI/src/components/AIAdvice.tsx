import { AlertCircle, Shield, CreditCard, Server, MessageSquare, ArrowRight, TrendingUp, AlertTriangle } from 'lucide-react';
import { useApp } from './AppContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const adviceItems = [
  {
    icon: AlertTriangle,
    label: 'Fraud Detection Alert',
    color: 'text-red-500',
    bgColor: 'bg-red-500',
    count: 1,
    description: 'Suspicious charge detected',
    priority: 'Critical'
  },
  {
    icon: CreditCard,
    label: 'Duplicate Charges',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500',
    count: 2,
    description: 'Double billing detected',
    priority: 'High'
  },
  {
    icon: TrendingUp,
    label: 'Subscription Optimization',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500',
    count: 5,
    description: 'Unused services found',
    priority: 'Medium'
  },
  {
    icon: Shield,
    label: 'Security Recommendations',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500',
    count: 3,
    description: 'Account security updates',
    priority: 'Medium'
  }
];

const priorityColors = {
  'Critical': 'bg-red-100 text-red-700',
  'High': 'bg-orange-100 text-orange-700',
  'Medium': 'bg-blue-100 text-blue-700'
};

export function AIAdvice() {
  const { setCurrentPage } = useApp();

  const handleViewAllAdvice = () => {
    setCurrentPage('ai-advice-frame');
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Financial Advisor</h3>
        </div>
        <Badge className="bg-purple-100 text-purple-700">
          {adviceItems.reduce((sum, item) => sum + item.count, 0)} alerts
        </Badge>
      </div>
      
      <div className="space-y-4 mb-6">
        {adviceItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 ${item.bgColor} rounded-full flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-600">{item.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={priorityColors[item.priority as keyof typeof priorityColors]} variant="secondary">
                  {item.priority}
                </Badge>
                <span className="text-sm font-medium text-gray-500">{item.count}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="space-y-3">
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-medium text-green-800">💡 Quick Tip</p>
          <p className="text-xs text-green-700 mt-1">Cancel unused Hulu subscription to save $14.99/month</p>
        </div>
        
        <Button 
          onClick={handleViewAllAdvice}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          View All AI Advice
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}