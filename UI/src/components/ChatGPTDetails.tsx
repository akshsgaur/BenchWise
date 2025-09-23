import { ArrowLeft, Calendar, CreditCard, MessageSquare, Settings, Pause, X, Download, TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart, Target } from 'lucide-react';
import { useApp } from './AppContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const billingHistory = [
  { date: '2024-12-10', amount: '$20.00', status: 'Paid' },
  { date: '2024-11-10', amount: '$20.00', status: 'Paid' },
  { date: '2024-10-10', amount: '$20.00', status: 'Paid' },
  { date: '2024-09-10', amount: '$20.00', status: 'Paid' },
];

const spendingHistory = [
  { month: 'Jul 2024', amount: 20.00, messages: 850, costPerMessage: 0.024, hours: 32 },
  { month: 'Aug 2024', amount: 20.00, messages: 920, costPerMessage: 0.022, hours: 38 },
  { month: 'Sep 2024', amount: 20.00, messages: 1100, costPerMessage: 0.018, hours: 45 },
  { month: 'Oct 2024', amount: 20.00, messages: 890, costPerMessage: 0.022, hours: 35 },
  { month: 'Nov 2024', amount: 20.00, messages: 975, costPerMessage: 0.021, hours: 40 },
  { month: 'Dec 2024', amount: 20.00, messages: 950, costPerMessage: 0.021, hours: 39 },
];

const usageData = [
  { week: 'Week 1', messages: 235, hours: 9, cost: 5.00 },
  { week: 'Week 2', messages: 280, hours: 11, cost: 5.00 },
  { week: 'Week 3', messages: 245, hours: 10, cost: 5.00 },
  { week: 'Week 4', hours: 9, messages: 190, cost: 5.00 },
];

const usageTypeData = [
  { name: 'Work Projects', value: 40, color: '#8B5CF6' },
  { name: 'Learning', value: 25, color: '#10B981' },
  { name: 'Writing', value: 20, color: '#F59E0B' },
  { name: 'Research', value: 10, color: '#EF4444' },
  { name: 'Other', value: 5, color: '#6B7280' },
];

const comparisonData = [
  { service: 'ChatGPT Plus', monthly: 20.00, annual: 240.00, messagesPerMonth: 950 },
  { service: 'Claude Pro', monthly: 20.00, annual: 240.00, messagesPerMonth: 900 },
  { service: 'GitHub Copilot', monthly: 10.00, annual: 120.00, messagesPerMonth: 0 },
  { service: 'Notion AI', monthly: 8.00, annual: 96.00, messagesPerMonth: 500 },
];

export function ChatGPTDetails() {
  const { goBack } = useApp();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center space-x-3">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1677442136019-21780ecad995?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxDaGF0R1BUJTIwbG9nbyUyMGdyZWVufGVufDF8fHx8MTc1NzcxMTM4Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="ChatGPT Plus"
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">ChatGPT Plus</h1>
              <p className="text-gray-600">Plus Plan • GPT-4 Access</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Pause className="w-4 h-4 mr-2" />
            Pause
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button variant="destructive" size="sm">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>

      {/* Enhanced Analytics Dashboard */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="spending">Spend Analytics</TabsTrigger>
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Status and Quick Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge className="mt-1 bg-green-100 text-green-700">Active</Badge>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div>
                  <p className="text-sm text-gray-600">Monthly Cost</p>
                  <p className="text-xl font-semibold text-gray-900">$20.00</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div>
                  <p className="text-sm text-gray-600">Next Billing</p>
                  <p className="text-xl font-semibold text-gray-900">Jan 10, 2025</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div>
                  <p className="text-sm text-gray-600">Annual Spend</p>
                  <p className="text-xl font-semibold text-gray-900">$240.00</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Subscription Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Subscription Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan</span>
                    <span className="font-medium">ChatGPT Plus</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price</span>
                    <span className="font-medium">$20.00/month</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-600">Billing Cycle</span>
                    <span className="font-medium">Monthly</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Date</span>
                    <span className="font-medium">February 10, 2023</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-medium">•••• 5678</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Plan Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">GPT-4 Access</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Faster Response</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Priority Access</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Plugin Access</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">DALL-E 3</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Code Interpreter</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Usage Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Primary Use</p>
                        <p className="text-xs text-gray-600">Most frequent</p>
                      </div>
                      <span className="text-sm font-medium">Work Projects</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Messages Sent</p>
                        <p className="text-xs text-gray-600">Last 30 days</p>
                      </div>
                      <span className="text-sm font-medium">950</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Time Saved</p>
                        <p className="text-xs text-gray-600">Estimated</p>
                      </div>
                      <span className="text-sm font-medium">67 hours</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Conversations</p>
                        <p className="text-xs text-gray-600">This month</p>
                      </div>
                      <span className="text-sm font-medium">142</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Billing History */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Billing History
                    </div>
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {billingHistory.map((bill, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{bill.amount}</p>
                          <p className="text-xs text-gray-600">{bill.date}</p>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          {bill.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Download className="w-5 h-5 mr-2" />
                    Usage Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Daily Messages</span>
                      <span>31.7 avg</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>GPT-4 Usage</span>
                      <span>78% of messages</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Plugin Usage</span>
                      <span>22% of sessions</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '22%' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="spending" className="space-y-6">
          {/* Spending Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">6-Month Total</p>
                    <p className="text-xl font-semibold text-gray-900">$120.00</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Cost/Message</p>
                    <p className="text-xl font-semibold text-gray-900">$0.021</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">vs Last Year</p>
                    <div className="flex items-center space-x-1">
                      <p className="text-xl font-semibold text-green-600">-12%</p>
                      <TrendingDown className="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                  <TrendingDown className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">ROI Score</p>
                    <p className="text-xl font-semibold text-green-600">9.4/10</p>
                  </div>
                  <Target className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Spending Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle>6-Month Spending & Usage Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={spendingHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#8B5CF6" 
                      strokeWidth={3}
                      name="Monthly Cost ($)"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="messages" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      name="Messages Sent"
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="costPerMessage" 
                      stroke="#F59E0B" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Cost per Message ($)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Usage and Usage Type Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Message Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={usageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="messages" fill="#8B5CF6" name="Messages Sent" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={usageTypeData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {usageTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Service Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>AI Service Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {comparisonData.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{service.service}</p>
                      <p className="text-xs text-gray-600">{service.messagesPerMonth > 0 ? `${service.messagesPerMonth} messages/mo` : 'Coding focused'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${service.monthly}/mo</p>
                      <p className="text-xs text-gray-600">${service.annual}/year</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          {/* Usage Analytics Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div>
                  <p className="text-sm text-gray-600">Total Messages</p>
                  <p className="text-2xl font-semibold text-gray-900">5,685</p>
                  <p className="text-xs text-gray-500">Last 6 months</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div>
                  <p className="text-sm text-gray-600">Conversations</p>
                  <p className="text-2xl font-semibold text-gray-900">847</p>
                  <p className="text-xs text-gray-500">Last 6 months</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div>
                  <p className="text-sm text-gray-600">Peak Month</p>
                  <p className="text-2xl font-semibold text-gray-900">1,100</p>
                  <p className="text-xs text-gray-500">September 2024</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage Pattern Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Message Pattern</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={spendingHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="messages" 
                      stroke="#8B5CF6" 
                      fill="#8B5CF6"
                      fillOpacity={0.6}
                      name="Messages Sent"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Time Efficiency */}
          <Card>
            <CardHeader>
              <CardTitle>Productivity Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={spendingHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="hours" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      name="Hours Saved"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* AI Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                  ROI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800">Excellent ROI</p>
                  <p className="text-xs text-green-600 mt-1">
                    You save ~67 hours monthly (worth $2,010 at $30/hour), paying only $20.
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-800">High Efficiency</p>
                  <p className="text-xs text-blue-600 mt-1">
                    Cost per message ($0.021) decreasing as usage increases, showing great value.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-purple-500" />
                  Usage Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm font-medium text-purple-800">Work-Focused</p>
                  <p className="text-xs text-purple-600 mt-1">
                    65% of usage for work/learning, showing professional productivity benefits.
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm font-medium text-yellow-800">Consistent Growth</p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Usage trending upward with 1,100 messages in peak month (Sep 2024).
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>AI Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Perfect Value Match</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Your high usage (950+ messages) and productivity gains justify the $20 cost.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Explore More Features</p>
                    <p className="text-xs text-gray-600 mt-1">
                      You use plugins only 22% of the time. Explore DALL-E and advanced plugins.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Track Time Savings</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Consider tracking specific time saved per task to quantify productivity gains.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}