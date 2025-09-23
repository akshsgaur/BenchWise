import { Plus, RefreshCw, TrendingUp, TrendingDown, DollarSign, Target, Calendar, CreditCard, PieChart } from 'lucide-react';
import { RevenueChart } from './RevenueChart';
import { SuccessRate } from './SuccessRate';
import { AIAdvice } from './AIAdvice';
import { SubscriptionPanel } from './SubscriptionPanel';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';

const recentTransactions = [
  { id: 1, description: 'Uber Driver Payment', amount: '+$156.80', date: '2 hours ago', type: 'income' },
  { id: 2, description: 'Netflix Subscription', amount: '-$15.99', date: '1 day ago', type: 'expense' },
  { id: 3, description: 'DoorDash Delivery', amount: '+$89.40', date: '1 day ago', type: 'income' },
  { id: 4, description: 'Spotify Premium', amount: '-$9.99', date: '2 days ago', type: 'expense' },
  { id: 5, description: 'Freelance Project', amount: '+$450.00', date: '3 days ago', type: 'income' },
];

const spendingCategories = [
  { name: 'Subscriptions', amount: 57.97, percentage: 23, color: 'bg-purple-500' },
  { name: 'Food & Dining', amount: 145.30, percentage: 35, color: 'bg-blue-500' },
  { name: 'Transportation', amount: 89.50, percentage: 22, color: 'bg-green-500' },
  { name: 'Entertainment', amount: 42.80, percentage: 10, color: 'bg-orange-500' },
  { name: 'Other', amount: 25.20, percentage: 10, color: 'bg-gray-500' },
];

const cashFlowData = [
  { day: 'Today', income: 245.60, expenses: 23.50 },
  { day: 'Tomorrow', income: 180.00, expenses: 15.99 },
  { day: 'Wed', income: 320.40, expenses: 45.80 },
  { day: 'Thu', income: 156.20, expenses: 12.00 },
  { day: 'Fri', income: 278.90, expenses: 67.30 },
];

export function EnhancedDashboard() {
  const lastUpdated = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });

  const totalIncome = recentTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount.replace(/[+$,]/g, '')), 0);

  const totalExpenses = recentTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount.replace(/[-$,]/g, '')), 0);

  const savingsGoal = 2000;
  const currentSavings = 1420;
  const savingsProgress = (currentSavings / savingsGoal) * 100;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header with Quick Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Financial Dashboard</h1>
          <p className="text-gray-600">
            Last updated: {lastUpdated} • 
            <Button variant="ghost" size="sm" className="ml-2 h-auto p-0">
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh Data
            </Button>
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Income
          </Button>
          <Button variant="outline" size="sm">
            <CreditCard className="w-4 h-4 mr-2" />
            Track Expense
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Connect Another Bank
          </Button>
        </div>
      </div>

      {/* Revenue Chart */}
      <RevenueChart />

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month Income</p>
                <p className="text-2xl font-semibold text-green-600">${totalIncome.toFixed(2)}</p>
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
                <p className="text-2xl font-semibold text-red-600">${totalExpenses.toFixed(2)}</p>
                <div className="flex items-center mt-1">
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-600">+8.2%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Net Cash Flow</p>
                <p className="text-2xl font-semibold text-purple-600">
                  ${(totalIncome - totalExpenses).toFixed(2)}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-purple-500 mr-1" />
                  <span className="text-sm text-purple-600">Positive</span>
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
                <p className="text-sm text-gray-600">Savings Goal</p>
                <p className="text-2xl font-semibold text-blue-600">${currentSavings}</p>
                <div className="flex items-center mt-1">
                  <Target className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="text-sm text-blue-600">{savingsProgress.toFixed(0)}% of ${savingsGoal}</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Projection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            30-Day Cash Flow Projection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {cashFlowData.map((day, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{day.day}</p>
                <p className="text-lg font-semibold text-green-600 mt-1">+${day.income}</p>
                <p className="text-sm text-red-600">-${day.expenses}</p>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-sm font-medium text-purple-600">
                    +${(day.income - day.expenses).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-xs text-gray-600">{transaction.date}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount}
                    </p>
                    <Badge variant="outline" className={`text-xs ${
                      transaction.type === 'income' ? 'border-green-200 text-green-700' : 'border-red-200 text-red-700'
                    }`}>
                      {transaction.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Spending Categories */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Monthly Spending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {spendingCategories.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-gray-600">${category.amount}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${category.color}`}
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 w-8">{category.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Savings Goal Progress */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Savings Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="w-32 h-32 mx-auto">
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
                      stroke="#8B5CF6"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${savingsProgress * 2.51}, 251`}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-purple-600">{savingsProgress.toFixed(0)}%</p>
                      <p className="text-xs text-gray-600">Complete</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">${currentSavings}</p>
                <p className="text-sm text-gray-600">of ${savingsGoal} goal</p>
                <p className="text-xs text-gray-500 mt-2">
                  ${savingsGoal - currentSavings} remaining
                </p>
              </div>
              <Button className="w-full" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add to Savings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SuccessRate />
        <AIAdvice />
      </div>
    </div>
  );
}