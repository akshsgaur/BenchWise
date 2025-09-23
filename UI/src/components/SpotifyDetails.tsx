import { ArrowLeft, Calendar, CreditCard, Music, Settings, Pause, X, Download, TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart, Target } from 'lucide-react';
import { useApp } from './AppContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const billingHistory = [
  { date: '2024-12-25', amount: '$9.99', status: 'Paid' },
  { date: '2024-11-25', amount: '$9.99', status: 'Paid' },
  { date: '2024-10-25', amount: '$9.99', status: 'Paid' },
  { date: '2024-09-25', amount: '$9.99', status: 'Paid' },
];

const spendingHistory = [
  { month: 'Jul 2024', amount: 9.99, hours: 76, costPerHour: 0.13, songs: 1250 },
  { month: 'Aug 2024', amount: 9.99, hours: 82, costPerHour: 0.12, songs: 1340 },
  { month: 'Sep 2024', amount: 9.99, hours: 89, costPerHour: 0.11, songs: 1480 },
  { month: 'Oct 2024', amount: 9.99, hours: 78, costPerHour: 0.13, songs: 1290 },
  { month: 'Nov 2024', amount: 9.99, hours: 85, costPerHour: 0.12, songs: 1380 },
  { month: 'Dec 2024', amount: 9.99, hours: 76, costPerHour: 0.13, songs: 1245 },
];

const usageData = [
  { week: 'Week 1', hours: 18, songs: 295, cost: 2.50 },
  { week: 'Week 2', hours: 22, songs: 360, cost: 2.50 },
  { week: 'Week 3', hours: 19, songs: 310, cost: 2.50 },
  { week: 'Week 4', hours: 17, songs: 280, cost: 2.49 },
];

const genreData = [
  { name: 'Pop', value: 35, color: '#8B5CF6' },
  { name: 'Rock', value: 25, color: '#10B981' },
  { name: 'Hip Hop', value: 20, color: '#F59E0B' },
  { name: 'Electronic', value: 12, color: '#EF4444' },
  { name: 'Other', value: 8, color: '#6B7280' },
];

const comparisonData = [
  { service: 'Spotify Premium', monthly: 9.99, annual: 119.88, hoursPerMonth: 81 },
  { service: 'Apple Music', monthly: 10.99, annual: 131.88, hoursPerMonth: 75 },
  { service: 'YouTube Music', monthly: 9.99, annual: 119.88, hoursPerMonth: 68 },
  { service: 'Amazon Music', monthly: 8.99, annual: 107.88, hoursPerMonth: 62 },
];

export function SpotifyDetails() {
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
              src="https://images.unsplash.com/photo-1551817958-795f9440ce4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTcG90aWZ5JTIwZ3JlZW4lMjBsb2dvfGVufDF8fHx8MTc1NzcxMTM3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Spotify"
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Spotify Premium</h1>
              <p className="text-gray-600">Individual Plan • High Quality</p>
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
                  <p className="text-xl font-semibold text-gray-900">$9.99</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div>
                  <p className="text-sm text-gray-600">Next Billing</p>
                  <p className="text-xl font-semibold text-gray-900">Jan 25, 2025</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div>
                  <p className="text-sm text-gray-600">Annual Spend</p>
                  <p className="text-xl font-semibold text-gray-900">$119.88</p>
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
                    <span className="font-medium">Spotify Premium Individual</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price</span>
                    <span className="font-medium">$9.99/month</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-600">Billing Cycle</span>
                    <span className="font-medium">Monthly</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Date</span>
                    <span className="font-medium">April 25, 2022</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-medium">•••• 1234</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Music className="w-5 h-5 mr-2" />
                    Plan Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Ad-Free Music</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Offline Downloads</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">High Quality Audio</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Unlimited Skips</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Any Song, Any Time</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Spotify Connect</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Music Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Top Genre</p>
                        <p className="text-xs text-gray-600">This month</p>
                      </div>
                      <span className="text-sm font-medium">Pop</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Minutes Listened</p>
                        <p className="text-xs text-gray-600">Last 30 days</p>
                      </div>
                      <span className="text-sm font-medium">4,567 min</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Songs Discovered</p>
                        <p className="text-xs text-gray-600">This month</p>
                      </div>
                      <span className="text-sm font-medium">89 new</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Playlists Created</p>
                        <p className="text-xs text-gray-600">Total</p>
                      </div>
                      <span className="text-sm font-medium">23</span>
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
                    Listening Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Daily Average</span>
                      <span>2h 45m</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Downloaded Songs</span>
                      <span>247/10,000</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '2.5%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Monthly Goal</span>
                      <span>85% Complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '85%' }}></div>
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
                    <p className="text-xl font-semibold text-gray-900">$59.94</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Cost/Hour</p>
                    <p className="text-xl font-semibold text-gray-900">$0.12</p>
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
                      <p className="text-xl font-semibold text-green-600">-5.2%</p>
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
                    <p className="text-sm text-gray-600">Efficiency Score</p>
                    <p className="text-xl font-semibold text-green-600">9.1/10</p>
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
                      dataKey="hours" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      name="Hours Listened"
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="costPerHour" 
                      stroke="#F59E0B" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Cost per Hour ($)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Usage and Genre Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Listening Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={usageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="hours" fill="#8B5CF6" name="Hours Listened" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Genre Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={genreData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {genreData.map((entry, index) => (
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
              <CardTitle>Music Service Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {comparisonData.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{service.service}</p>
                      <p className="text-xs text-gray-600">{service.hoursPerMonth}h/month avg</p>
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
                  <p className="text-sm text-gray-600">Total Listen Time</p>
                  <p className="text-2xl font-semibold text-gray-900">486h</p>
                  <p className="text-xs text-gray-500">Last 6 months</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div>
                  <p className="text-sm text-gray-600">Songs Played</p>
                  <p className="text-2xl font-semibold text-gray-900">7,985</p>
                  <p className="text-xs text-gray-500">Last 6 months</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div>
                  <p className="text-sm text-gray-600">Peak Month</p>
                  <p className="text-2xl font-semibold text-gray-900">89h</p>
                  <p className="text-xs text-gray-500">September 2024</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage Pattern Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Listening Pattern</CardTitle>
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
                      dataKey="hours" 
                      stroke="#8B5CF6" 
                      fill="#8B5CF6"
                      fillOpacity={0.6}
                      name="Hours Listened"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Song Discovery */}
          <Card>
            <CardHeader>
              <CardTitle>Song Discovery Trends</CardTitle>
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
                      dataKey="songs" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      name="Songs Played"
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
                  Cost Optimization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800">Excellent Value</p>
                  <p className="text-xs text-green-600 mt-1">
                    Your cost per hour ($0.12) is 45% below average for premium music services.
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-800">High Usage</p>
                  <p className="text-xs text-blue-600 mt-1">
                    You listen 81 hours/month, well above the 45-hour average for premium users.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-purple-500" />
                  Listening Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm font-medium text-purple-800">Discovery Champion</p>
                  <p className="text-xs text-purple-600 mt-1">
                    You discover 89 new songs monthly, 3x above average user discovery rate.
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm font-medium text-yellow-800">Genre Diversity</p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Your 65% genre diversity score shows excellent music exploration habits.
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
                    <p className="text-sm font-medium">Perfect Plan Match</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Your high usage makes Spotify Premium the optimal choice. Stay with current plan.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Maximize Downloads</p>
                    <p className="text-xs text-gray-600 mt-1">
                      You're only using 2.5% of available downloads. Download more for offline listening.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Consider Annual Billing</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Switch to annual billing to save $11.90 per year (10% discount).
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