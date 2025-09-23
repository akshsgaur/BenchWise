import { 
  AlertTriangle, 
  Shield, 
  CreditCard, 
  TrendingUp, 
  MessageSquare, 
  CheckCircle, 
  X, 
  Clock, 
  DollarSign,
  Target,
  PieChart,
  Calendar,
  Calculator,
  Send,
  Brain,
  Zap,
  FileText,
  Phone,
  Car,
  Building2,
  Eye,
  EyeOff,
  Star,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';

const criticalAlerts = [
  {
    id: 1,
    icon: AlertTriangle,
    title: 'Fraud Detection',
    description: 'Suspicious charge detected: $299 from unknown merchant "TECH-SERVICES-LLC"',
    amount: '$299.00',
    time: '2 minutes ago',
    status: 'critical',
    actionRequired: true
  },
  {
    id: 2,
    icon: Shield,
    title: 'Security Warning',
    description: 'New device logged into your account from Chicago, IL',
    time: '15 minutes ago',
    status: 'critical',
    actionRequired: true
  },
  {
    id: 3,
    icon: CreditCard,
    title: 'Account Issue',
    description: 'Wells Fargo connection expired - refresh needed for accurate data',
    time: '1 hour ago',
    status: 'critical',
    actionRequired: true
  }
];

const highPriorityAlerts = [
  {
    id: 4,
    icon: TrendingUp,
    title: 'Overdraft Prevention',
    description: 'Low balance warning - projected negative in 3 days based on upcoming bills',
    amount: '-$45.67',
    time: '30 minutes ago',
    status: 'high',
    actionRequired: true
  },
  {
    id: 5,
    icon: CreditCard,
    title: 'Duplicate Charges',
    description: 'Double charge detected: Netflix billed twice this month ($15.99 each)',
    amount: '$15.99',
    time: '2 hours ago',
    status: 'high',
    actionRequired: true
  },
  {
    id: 6,
    icon: DollarSign,
    title: 'Price Changes',
    description: 'Spotify Premium increased to $12.99/month (+$2.00 from previous)',
    amount: '+$2.00',
    time: '1 day ago',
    status: 'high',
    actionRequired: false
  }
];

const mediumPriorityAlerts = [
  {
    id: 7,
    icon: Target,
    title: 'Subscription Optimization',
    description: 'Cancel Hulu? Unused for 45 days - Save $14.99/month',
    savings: '$14.99/mo',
    time: '2 days ago',
    status: 'medium',
    actionRequired: false
  },
  {
    id: 8,
    icon: Calendar,
    title: 'Better Rates',
    description: 'Switch to annual billing on Adobe Creative Suite - Save $47/year',
    savings: '$47/year',
    time: '3 days ago',
    status: 'medium',
    actionRequired: false
  }
];

const spendingInsights = [
  {
    metric: 'Monthly Increase',
    value: '+23%',
    description: 'Your spending increased vs last month',
    trend: 'up',
    details: 'Primarily driven by increased food delivery and subscription additions'
  },
  {
    metric: 'Food Delivery',
    value: '+340%',
    description: 'Food delivery spending up significantly',
    trend: 'up',
    details: 'Mostly on weekends - consider meal prep to reduce costs'
  },
  {
    metric: 'Subscription Overage',
    value: '+$89',
    description: 'Subscription spending over budget',
    trend: 'up',
    details: 'Added 3 new services this month: Disney+, LinkedIn Premium, Canva Pro'
  }
];

const zombieSubscriptions = [
  {
    service: 'Paramount+',
    lastUsed: '67 days ago',
    monthlyFee: '$9.99',
    totalWasted: '$19.98',
    category: 'Entertainment'
  },
  {
    service: 'LinkedIn Premium',
    lastUsed: '89 days ago',
    monthlyFee: '$29.99',
    totalWasted: '$89.97',
    category: 'Professional'
  },
  {
    service: 'Gym Membership',
    lastUsed: '156 days ago',
    monthlyFee: '$39.99',
    totalWasted: '$199.95',
    category: 'Health & Fitness'
  }
];

const actionItems = [
  { 
    id: 1, 
    task: 'Cancel unused Paramount+ subscription', 
    savings: '$9.99/month', 
    difficulty: 'Easy', 
    timeEstimate: '2 minutes',
    completed: false 
  },
  { 
    id: 2, 
    task: 'Review Wells Fargo checking fees', 
    savings: '$12/month', 
    difficulty: 'Medium', 
    timeEstimate: '15 minutes',
    completed: false 
  },
  { 
    id: 3, 
    task: 'Upload gas receipts for tax deduction', 
    savings: '$45 tax savings', 
    difficulty: 'Easy', 
    timeEstimate: '5 minutes',
    completed: true 
  },
  { 
    id: 4, 
    task: 'Set up automatic transfer to emergency fund', 
    savings: 'Financial security', 
    difficulty: 'Easy', 
    timeEstimate: '10 minutes',
    completed: false 
  }
];

const quickWins = [
  { action: 'Switch phone plan to prepaid', savings: '$25/month', impact: 'High' },
  { action: 'Use cashback credit card for gas', savings: '2% back (~$15/month)', impact: 'Medium' },
  { action: 'Cancel premium LinkedIn', savings: '$29.99/month', impact: 'High' },
  { action: 'Bundle streaming services', savings: '$8/month', impact: 'Medium' }
];

const chatHistory = [
  {
    id: 1,
    type: 'user',
    message: 'Should I lease or buy a car for gig work?',
    timestamp: '2 hours ago'
  },
  {
    id: 2,
    type: 'ai',
    message: 'For gig work, I recommend buying a reliable used car (2-4 years old). Here\'s why: Lower total cost, no mileage restrictions, you can deduct depreciation, and you build equity. Leasing has mileage limits that gig workers often exceed.',
    timestamp: '2 hours ago'
  },
  {
    id: 3,
    type: 'user',
    message: 'How much should I save for taxes?',
    timestamp: '1 day ago'
  },
  {
    id: 4,
    type: 'ai',
    message: 'Based on your $4,200 monthly gig income, set aside 25-30% for taxes ($1,050-$1,260). This covers federal income tax, self-employment tax, and state taxes. I recommend opening a separate savings account for this.',
    timestamp: '1 day ago'
  }
];

const presetQuestions = [
  'How much should I save for taxes?',
  'What subscriptions can I cancel?',
  'Am I spending too much on food?',
  'Best credit card for my spending?',
  'Should I get a business bank account?',
  'How to track business expenses?'
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'critical': return 'border-red-500 bg-red-50';
    case 'high': return 'border-orange-500 bg-orange-50';
    case 'medium': return 'border-blue-500 bg-blue-50';
    default: return 'border-gray-200 bg-gray-50';
  }
};

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'critical': return 'bg-red-100 text-red-700';
    case 'high': return 'bg-orange-100 text-orange-700';
    case 'medium': return 'bg-blue-100 text-blue-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

export function AIAdviceFrame() {
  const totalSavingsOpportunity = zombieSubscriptions.reduce((sum, sub) => sum + parseFloat(sub.monthlyFee.replace('$', '')), 0);
  const completedActions = actionItems.filter(item => item.completed).length;
  const completionRate = (completedActions / actionItems.length) * 100;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">AI Financial Advisor</h1>
            <p className="text-gray-600">Personalized insights and recommendations for your financial health</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Potential Monthly Savings</p>
            <p className="text-2xl font-semibold text-green-600">${totalSavingsOpportunity.toFixed(2)}</p>
          </div>
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="alerts">Priority Alerts</TabsTrigger>
          <TabsTrigger value="spending">Spending Analysis</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="tax">Tax & Health</TabsTrigger>
          <TabsTrigger value="actions">Action Items</TabsTrigger>
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
        </TabsList>

        {/* Priority Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          {/* Critical Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-red-700">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Critical Alerts
                <Badge className="ml-2 bg-red-100 text-red-700">{criticalAlerts.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {criticalAlerts.map((alert) => {
                const Icon = alert.icon;
                return (
                  <div key={alert.id} className={`p-4 border-l-4 rounded-lg ${getStatusColor(alert.status)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <Icon className="w-5 h-5 text-red-600 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{alert.title}</h4>
                          <p className="text-sm text-gray-700 mt-1">{alert.description}</p>
                          <p className="text-xs text-gray-500 mt-2">{alert.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {alert.amount && (
                          <span className="text-lg font-semibold text-red-600">{alert.amount}</span>
                        )}
                        <div className="flex space-x-2">
                          {alert.actionRequired ? (
                            <>
                              <Button size="sm" className="bg-red-600 hover:bg-red-700">
                                Fix Now
                              </Button>
                              <Button variant="outline" size="sm">
                                Learn More
                              </Button>
                            </>
                          ) : (
                            <Button variant="outline" size="sm">
                              Dismiss
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* High Priority Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-orange-700">
                <TrendingUp className="w-5 h-5 mr-2" />
                High Priority
                <Badge className="ml-2 bg-orange-100 text-orange-700">{highPriorityAlerts.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {highPriorityAlerts.map((alert) => {
                const Icon = alert.icon;
                return (
                  <div key={alert.id} className={`p-4 border-l-4 rounded-lg ${getStatusColor(alert.status)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <Icon className="w-5 h-5 text-orange-600 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{alert.title}</h4>
                          <p className="text-sm text-gray-700 mt-1">{alert.description}</p>
                          <p className="text-xs text-gray-500 mt-2">{alert.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {alert.amount && (
                          <span className="text-lg font-semibold text-orange-600">{alert.amount}</span>
                        )}
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="border-orange-500 text-orange-700">
                            Review
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Medium Priority Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-blue-700">
                <Target className="w-5 h-5 mr-2" />
                Optimization Opportunities
                <Badge className="ml-2 bg-blue-100 text-blue-700">{mediumPriorityAlerts.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mediumPriorityAlerts.map((alert) => {
                const Icon = alert.icon;
                return (
                  <div key={alert.id} className={`p-4 border-l-4 rounded-lg ${getStatusColor(alert.status)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <Icon className="w-5 h-5 text-blue-600 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{alert.title}</h4>
                          <p className="text-sm text-gray-700 mt-1">{alert.description}</p>
                          <p className="text-xs text-gray-500 mt-2">{alert.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {alert.savings && (
                          <span className="text-lg font-semibold text-green-600">{alert.savings}</span>
                        )}
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Save Money
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Spending Analysis Tab */}
        <TabsContent value="spending" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Insights Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {spendingInsights.map((insight, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{insight.metric}</h4>
                      <span className={`text-lg font-semibold ${
                        insight.trend === 'up' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {insight.value}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{insight.description}</p>
                    <p className="text-xs text-gray-600">{insight.details}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Monthly Spend Optimization */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Spend Optimization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600">Potential Monthly Savings</p>
                  <p className="text-3xl font-semibold text-green-700">$127</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cancel unused gym membership</span>
                    <span className="font-medium text-green-600">$39.99</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Switch 3 subscriptions to annual</span>
                    <span className="font-medium text-green-600">$47.00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Reduce food delivery frequency</span>
                    <span className="font-medium text-green-600">$40.00</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Subscription Intelligence Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Zombie Subscription Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {zombieSubscriptions.map((subscription, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <EyeOff className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{subscription.service}</h4>
                        <p className="text-sm text-gray-600">Last used {subscription.lastUsed}</p>
                        <Badge variant="outline" className="mt-1">{subscription.category}</Badge>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-1">
                      <p className="font-medium text-red-600">{subscription.monthlyFee}/month</p>
                      <p className="text-sm text-gray-600">Wasted: {subscription.totalWasted}</p>
                      <Button size="sm" className="bg-red-600 hover:bg-red-700">
                        Cancel & Save
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Smart Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800">Bundle Opportunity</h4>
                  <p className="text-sm text-blue-700 mt-1">Bundle Spotify + Hulu for $3/month savings</p>
                  <Button variant="outline" size="sm" className="mt-3">Learn More</Button>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800">Downgrade Suggestion</h4>
                  <p className="text-sm text-green-700 mt-1">Your Adobe usage suggests basic plan sufficient</p>
                  <Button variant="outline" size="sm" className="mt-3">Review Usage</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cash Flow Predictions Tab */}
        <TabsContent value="cashflow" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  AI-Powered Forecasting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800">Next Month Prediction</h4>
                  <p className="text-2xl font-semibold text-blue-900 mt-1">$2,400</p>
                  <p className="text-sm text-blue-700">Based on your gig patterns and seasonality</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Rent due in 5 days</span>
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Sufficient balance
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Recommended emergency fund</span>
                    <span className="font-medium">$1,200 (currently $800)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Earning Pattern Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Income Volatility</span>
                      <span>Moderate</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Best earning days:</p>
                    <div className="flex space-x-2">
                      <Badge>Friday</Badge>
                      <Badge>Saturday</Badge>
                      <Badge>Sunday</Badge>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Seasonal trends:</p>
                    <p className="text-xs text-gray-600">December-January: +15% increase in delivery demand</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tax & Financial Health Tab */}
        <TabsContent value="tax" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="w-5 h-5 mr-2" />
                  Tax Optimization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800">Quarterly Tax Reminder</h4>
                  <p className="text-lg font-semibold text-yellow-900 mt-1">Set aside $340</p>
                  <p className="text-sm text-yellow-700">For Q1 2025 estimated taxes</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Business expense tracking</span>
                    <Badge className="bg-orange-100 text-orange-700">Missing $234</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Business checking account</span>
                    <Button variant="outline" size="sm">Setup</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Health Score</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#10B981"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${78 * 2.51}, 251`}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-semibold text-green-600">78</p>
                        <p className="text-xs text-gray-600">Good</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Credit utilization</span>
                    <span className="text-green-600">15% ✓</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Payment history</span>
                    <span className="text-green-600">Excellent ✓</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Emergency fund</span>
                    <span className="text-yellow-600">Partial ⚠</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Action Items Tab */}
        <TabsContent value="actions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    This Week's To-Do
                  </CardTitle>
                  <Badge className="bg-blue-100 text-blue-700">
                    {completedActions}/{actionItems.length} completed
                  </Badge>
                </div>
                <Progress value={completionRate} className="h-2" />
              </CardHeader>
              <CardContent className="space-y-4">
                {actionItems.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3">
                    <Checkbox 
                      checked={item.completed}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {item.task}
                      </p>
                      <div className="flex items-center space-x-3 mt-1">
                        <Badge variant="outline" className="text-xs">{item.difficulty}</Badge>
                        <span className="text-xs text-gray-500">{item.timeEstimate}</span>
                        <span className="text-xs font-medium text-green-600">{item.savings}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Quick Wins
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quickWins.map((win, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{win.action}</p>
                      <p className="text-xs text-gray-600">Impact: {win.impact}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">{win.savings}</p>
                      <Button size="sm" variant="outline">Do It</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Chat Tab */}
        <TabsContent value="chat" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Chat with AI Financial Advisor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 h-96 overflow-y-auto mb-4">
                  {chatHistory.map((message) => (
                    <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-sm p-3 rounded-lg ${
                        message.type === 'user' 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm">{message.message}</p>
                        <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-purple-200' : 'text-gray-500'}`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <Input 
                    placeholder="Ask me anything about your finances..." 
                    className="flex-1"
                  />
                  <Button>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {presetQuestions.map((question, index) => (
                  <Button 
                    key={index}
                    variant="outline" 
                    className="w-full text-left justify-start h-auto p-3"
                    size="sm"
                  >
                    <span className="text-xs">{question}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}