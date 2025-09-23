import { TrendingUp, TrendingDown, PieChart, Download, Calculator, DollarSign, Calendar, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar } from 'recharts';

const incomeData = [
  { date: '2024-12-01', uber: 145, doordash: 89, upwork: 320, freelance: 150 },
  { date: '2024-12-02', uber: 167, doordash: 95, upwork: 0, freelance: 0 },
  { date: '2024-12-03', uber: 134, doordash: 112, upwork: 450, freelance: 200 },
  { date: '2024-12-04', uber: 156, doordash: 78, upwork: 0, freelance: 0 },
  { date: '2024-12-05', uber: 189, doordash: 134, upwork: 275, freelance: 100 },
  { date: '2024-12-06', uber: 201, doordash: 156, upwork: 0, freelance: 300 },
  { date: '2024-12-07', uber: 178, doordash: 89, upwork: 380, freelance: 0 },
];

const expenseCategories = [
  { name: 'Vehicle & Gas', value: 234, color: '#8B5CF6', percentage: 28 },
  { name: 'Food & Dining', value: 187, color: '#10B981', percentage: 22 },
  { name: 'Subscriptions', value: 98, color: '#F59E0B', percentage: 12 },
  { name: 'Insurance', value: 156, color: '#EF4444', percentage: 19 },
  { name: 'Phone & Internet', value: 89, color: '#3B82F6', percentage: 11 },
  { name: 'Other', value: 67, color: '#6B7280', percentage: 8 },
];

const platformBreakdown = [
  { platform: 'Uber', earnings: 1234, hours: 32, avgPerHour: 38.56, color: '#000000' },
  { platform: 'DoorDash', earnings: 856, hours: 28, avgPerHour: 30.57, color: '#FF3333' },
  { platform: 'Upwork', earnings: 1425, hours: 15, avgPerHour: 95.00, color: '#6FDA44' },
  { platform: 'Freelance', earnings: 750, hours: 8, avgPerHour: 93.75, color: '#8B5CF6' },
];

const cashFlowData = [
  { month: 'Jul', income: 3245, expenses: 2156, net: 1089 },
  { month: 'Aug', income: 3567, expenses: 2234, net: 1333 },
  { month: 'Sep', income: 3123, expenses: 2445, net: 678 },
  { month: 'Oct', income: 3789, expenses: 2567, net: 1222 },
  { month: 'Nov', income: 3456, expenses: 2234, net: 1222 },
  { month: 'Dec', income: 4265, expenses: 2831, net: 1434 },
];

const taxData = {
  estimatedTaxOwed: 1245,
  quarterlyPayment: 415,
  withheldToDate: 2340,
  deductions: 1567,
  effectiveRate: 18.5
};

export function CashFlowAnalysis() {
  const totalIncome = platformBreakdown.reduce((sum, platform) => sum + platform.earnings, 0);
  const totalExpenses = expenseCategories.reduce((sum, category) => sum + category.value, 0);
  const netCashFlow = totalIncome - totalExpenses;
  const totalHours = platformBreakdown.reduce((sum, platform) => sum + platform.hours, 0);
  const avgHourlyRate = totalIncome / totalHours;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Cash Flow Analysis</h1>
          <p className="text-gray-600">Track income patterns and expenses for gig work optimization</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Tax Documents
          </Button>
          <Button variant="outline" size="sm">
            <Calculator className="w-4 h-4 mr-2" />
            Tax Calculator
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Income</p>
                <p className="text-2xl font-semibold text-green-600">${totalIncome.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+12.5%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Expenses</p>
                <p className="text-2xl font-semibold text-red-600">${totalExpenses.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-600">+3.2%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Net Cash Flow</p>
                <p className="text-2xl font-semibold text-purple-600">${netCashFlow.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-purple-500 mr-1" />
                  <span className="text-sm text-purple-600">+18.7%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Hourly Rate</p>
                <p className="text-2xl font-semibold text-blue-600">${avgHourlyRate.toFixed(2)}</p>
                <div className="flex items-center mt-1">
                  <Calendar className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="text-sm text-blue-600">{totalHours}h worked</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Income Timeline */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Income Timeline (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={incomeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                      formatter={(value, name) => [`$${value}`, name.charAt(0).toUpperCase() + name.slice(1)]}
                    />
                    <Line type="monotone" dataKey="uber" stroke="#000000" strokeWidth={2} />
                    <Line type="monotone" dataKey="doordash" stroke="#FF3333" strokeWidth={2} />
                    <Line type="monotone" dataKey="upwork" stroke="#6FDA44" strokeWidth={2} />
                    <Line type="monotone" dataKey="freelance" stroke="#8B5CF6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expense Breakdown */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Expense Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Tooltip formatter={(value) => `$${value}`} />
                    <RechartsPieChart data={expenseCategories}>
                      {expenseCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </RechartsPieChart>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {expenseCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium">${category.value}</span>
                      <span className="text-xs text-gray-500 ml-2">{category.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Platform Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Platform/Client Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformBreakdown.map((platform, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{platform.platform}</h3>
                  <Badge 
                    variant="outline" 
                    className="text-xs"
                    style={{ borderColor: platform.color, color: platform.color }}
                  >
                    {platform.hours}h
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Earnings</span>
                    <span className="text-sm font-medium">${platform.earnings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Per Hour</span>
                    <span className="text-sm font-medium">${platform.avgPerHour.toFixed(2)}</span>
                  </div>
                  <Progress 
                    value={(platform.earnings / totalIncome) * 100} 
                    className="h-2"
                  />
                  <p className="text-xs text-gray-500 text-center">
                    {((platform.earnings / totalIncome) * 100).toFixed(1)}% of total income
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cash Flow Comparison & Tax Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Income vs Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Income vs Expenses (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Bar dataKey="income" fill="#10B981" name="Income" />
                  <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                  <Bar dataKey="net" fill="#8B5CF6" name="Net" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tax Withholding Calculator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Tax Withholding Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600">Estimated Tax Owed</p>
                <p className="text-xl font-semibold text-blue-800">${taxData.estimatedTaxOwed.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600">Quarterly Payment</p>
                <p className="text-xl font-semibold text-green-800">${taxData.quarterlyPayment.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Withheld to Date</span>
                <span className="text-sm font-medium">${taxData.withheldToDate.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Deductions</span>
                <span className="text-sm font-medium">${taxData.deductions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Effective Rate</span>
                <span className="text-sm font-medium">{taxData.effectiveRate}%</span>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Button className="w-full" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download 1099 Forms
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Predictive Modeling */}
      <Card>
        <CardHeader>
          <CardTitle>Predictive Cash Flow Modeling</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="30days">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="30days">30 Days</TabsTrigger>
              <TabsTrigger value="90days">90 Days</TabsTrigger>
              <TabsTrigger value="1year">1 Year</TabsTrigger>
            </TabsList>
            
            <TabsContent value="30days" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-800">Conservative Estimate</h3>
                  <p className="text-2xl font-semibold text-green-600 mt-2">$3,245</p>
                  <p className="text-sm text-green-600 mt-1">Based on lowest monthly performance</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-800">Expected Estimate</h3>
                  <p className="text-2xl font-semibold text-blue-600 mt-2">$4,267</p>
                  <p className="text-sm text-blue-600 mt-1">Based on average performance</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-medium text-purple-800">Optimistic Estimate</h3>
                  <p className="text-2xl font-semibold text-purple-600 mt-2">$5,234</p>
                  <p className="text-sm text-purple-600 mt-1">Based on peak performance trends</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}