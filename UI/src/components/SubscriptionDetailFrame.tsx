import { Search, Filter, Pause, X, TrendingUp, AlertTriangle, Play, MoreHorizontal } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Checkbox } from './ui/checkbox';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const subscriptions = [
  {
    id: 1,
    name: 'Netflix',
    category: 'Entertainment',
    price: 15.99,
    billing: 'Monthly',
    status: 'Active',
    lastUsed: '2 hours ago',
    usage: 'High',
    logo: 'https://images.unsplash.com/photo-1627873649417-c67f701f1949?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxOZXRmbGl4JTIwcmVkJTIwbG9nb3xlbnwxfHx8fDE3NTc3MTEzNzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    nextBilling: '2025-01-15'
  },
  {
    id: 2,
    name: 'YouTube Premium',
    category: 'Entertainment',
    price: 11.99,
    billing: 'Monthly',
    status: 'Active',
    lastUsed: '1 day ago',
    usage: 'Medium',
    logo: 'https://images.unsplash.com/photo-1705904506626-aba18263a2c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxZb3VUdWJlJTIwbG9nbyUyMHJlZHxlbnwxfHx8fDE3NTc3MTEzNzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    nextBilling: '2025-01-20'
  },
  {
    id: 3,
    name: 'Spotify Premium',
    category: 'Music',
    price: 9.99,
    billing: 'Monthly',
    status: 'Active',
    lastUsed: '3 hours ago',
    usage: 'High',
    logo: 'https://images.unsplash.com/photo-1551817958-795f9440ce4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTcG90aWZ5JTIwZ3JlZW4lMjBsb2dvfGVufDF8fHx8MTc1NzcxMTM3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    nextBilling: '2025-01-25'
  },
  {
    id: 4,
    name: 'Adobe Creative Suite',
    category: 'Productivity',
    price: 52.99,
    billing: 'Monthly',
    status: 'Paused',
    lastUsed: '45 days ago',
    usage: 'Low',
    logo: null,
    nextBilling: 'Paused'
  },
  {
    id: 5,
    name: 'LinkedIn Premium',
    category: 'Professional',
    price: 29.99,
    billing: 'Monthly',
    status: 'Zombie',
    lastUsed: '92 days ago',
    usage: 'None',
    logo: null,
    nextBilling: '2025-01-18'
  },
  {
    id: 6,
    name: 'Dropbox Pro',
    category: 'Storage',
    price: 11.99,
    billing: 'Monthly',
    status: 'Cancelled',
    lastUsed: '120 days ago',
    usage: 'None',
    logo: null,
    nextBilling: 'Cancelled'
  }
];

const spendingTrends = [
  { month: 'Jul', amount: 45.99 },
  { month: 'Aug', amount: 52.97 },
  { month: 'Sep', amount: 67.96 },
  { month: 'Oct', amount: 72.95 },
  { month: 'Nov', amount: 78.94 },
  { month: 'Dec', amount: 57.97 },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active': return 'bg-green-100 text-green-700';
    case 'Paused': return 'bg-yellow-100 text-yellow-700';
    case 'Zombie': return 'bg-red-100 text-red-700';
    case 'Cancelled': return 'bg-gray-100 text-gray-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const getUsageColor = (usage: string) => {
  switch (usage) {
    case 'High': return 'text-green-600';
    case 'Medium': return 'text-yellow-600';
    case 'Low': return 'text-orange-600';
    case 'None': return 'text-red-600';
    default: return 'text-gray-600';
  }
};

export function SubscriptionDetailFrame() {
  const activeSubscriptions = subscriptions.filter(s => s.status === 'Active').length;
  const totalCost = subscriptions.filter(s => s.status === 'Active').reduce((sum, s) => sum + s.price, 0);
  const zombieSubscriptions = subscriptions.filter(s => s.status === 'Zombie').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Subscription Management</h1>
          <p className="text-gray-600">Track, optimize, and manage all your recurring subscriptions</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            <Pause className="w-4 h-4 mr-2" />
            Pause Selected
          </Button>
          <Button variant="destructive" size="sm">
            <X className="w-4 h-4 mr-2" />
            Cancel Selected
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Active Subscriptions</p>
              <p className="text-3xl font-semibold text-green-600">{activeSubscriptions}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Monthly Cost</p>
              <p className="text-3xl font-semibold text-purple-600">${totalCost.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Zombie Services</p>
              <p className="text-3xl font-semibold text-red-600">{zombieSubscriptions}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Potential Savings</p>
              <p className="text-3xl font-semibold text-orange-600">$82.98</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Subscription List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Subscriptions</CardTitle>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input placeholder="Search subscriptions..." className="pl-10 w-64" />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="paused">Paused</TabsTrigger>
                  <TabsTrigger value="zombie">Zombie</TabsTrigger>
                  <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-4">
                  {subscriptions.map((subscription) => (
                    <div key={subscription.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                      <div className="flex items-center space-x-4">
                        <Checkbox />
                        <div className="flex-shrink-0">
                          {subscription.logo ? (
                            <ImageWithFallback
                              src={subscription.logo}
                              alt={subscription.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600">
                                {subscription.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{subscription.name}</h3>
                          <p className="text-sm text-gray-600">{subscription.category}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="font-medium text-gray-900">${subscription.price}</p>
                          <p className="text-sm text-gray-600">{subscription.billing}</p>
                        </div>
                        
                        <div className="text-right">
                          <Badge className={getStatusColor(subscription.status)}>
                            {subscription.status}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">Last: {subscription.lastUsed}</p>
                        </div>
                        
                        <div className="text-right">
                          <p className={`text-sm font-medium ${getUsageColor(subscription.usage)}`}>
                            {subscription.usage}
                          </p>
                          <p className="text-xs text-gray-500">usage</p>
                        </div>
                        
                        <div className="flex space-x-2">
                          {subscription.status === 'Active' && (
                            <Button variant="ghost" size="sm">
                              <Pause className="w-4 h-4" />
                            </Button>
                          )}
                          {subscription.status === 'Paused' && (
                            <Button variant="ghost" size="sm">
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Analytics & Recommendations */}
        <div className="space-y-6">
          {/* Spending Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Spending Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={spendingTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                    <Line type="monotone" dataKey="amount" stroke="#8B5CF6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Cancel LinkedIn Premium</p>
                    <p className="text-xs text-red-600">Unused for 92 days • Save $29.99/mo</p>
                    <Button variant="ghost" size="sm" className="mt-2 h-6 px-2 text-xs">
                      Cancel Now
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Pause className="w-4 h-4 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">Consider pausing Adobe</p>
                    <p className="text-xs text-orange-600">Low usage • Save $52.99/mo</p>
                    <Button variant="ghost" size="sm" className="mt-2 h-6 px-2 text-xs">
                      Pause
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Switch to annual billing</p>
                    <p className="text-xs text-blue-600">Netflix • Save $31.88/year</p>
                    <Button variant="ghost" size="sm" className="mt-2 h-6 px-2 text-xs">
                      Switch
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Entertainment</span>
                <span className="text-sm font-medium">$27.98</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Productivity</span>
                <span className="text-sm font-medium">$52.99</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Professional</span>
                <span className="text-sm font-medium">$29.99</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Storage</span>
                <span className="text-sm font-medium">$11.99</span>
              </div>
              <div className="border-t pt-2 mt-3">
                <div className="flex justify-between font-medium">
                  <span>Total (Active)</span>
                  <span>${totalCost.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}