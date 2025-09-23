import { ArrowLeft, Download, Filter, Search, Calendar, CreditCard } from 'lucide-react';
import { useApp } from './AppContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const billingHistory = [
  { date: '2024-12-30', service: 'ChatGPT Plus', amount: '$20.00', status: 'Paid', method: '•••• 5678' },
  { date: '2024-12-25', service: 'Spotify Premium', amount: '$9.99', status: 'Paid', method: '•••• 1234' },
  { date: '2024-12-20', service: 'YouTube Premium', amount: '$11.99', status: 'Paid', method: '•••• 8901' },
  { date: '2024-12-15', service: 'Netflix', amount: '$15.99', status: 'Paid', method: '•••• 4532' },
  { date: '2024-11-30', service: 'ChatGPT Plus', amount: '$20.00', status: 'Paid', method: '•••• 5678' },
  { date: '2024-11-25', service: 'Spotify Premium', amount: '$9.99', status: 'Paid', method: '•••• 1234' },
  { date: '2024-11-20', service: 'YouTube Premium', amount: '$11.99', status: 'Paid', method: '•••• 8901' },
  { date: '2024-11-15', service: 'Netflix', amount: '$15.99', status: 'Paid', method: '•••• 4532' },
  { date: '2024-10-30', service: 'ChatGPT Plus', amount: '$20.00', status: 'Paid', method: '•••• 5678' },
  { date: '2024-10-25', service: 'Spotify Premium', amount: '$9.99', status: 'Paid', method: '•••• 1234' },
];

export function BillingHistory() {
  const { goBack } = useApp();

  const totalSpent = billingHistory.reduce((total, bill) => {
    return total + parseFloat(bill.amount.replace('$', ''));
  }, 0);

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
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Billing History</h1>
            <p className="text-gray-600">View and manage your payment history</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-semibold text-gray-900">${totalSpent.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-semibold text-gray-900">$57.97</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Transactions</p>
                <p className="text-2xl font-semibold text-gray-900">{billingHistory.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Monthly</p>
                <p className="text-2xl font-semibold text-gray-900">$57.97</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transaction History</CardTitle>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search transactions..."
                  className="pl-10 w-64"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="netflix">Netflix</SelectItem>
                  <SelectItem value="youtube">YouTube Premium</SelectItem>
                  <SelectItem value="spotify">Spotify Premium</SelectItem>
                  <SelectItem value="chatgpt">ChatGPT Plus</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all-time">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-time">All Time</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingHistory.map((transaction, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {new Date(transaction.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell>{transaction.service}</TableCell>
                  <TableCell className="font-medium">{transaction.amount}</TableCell>
                  <TableCell className="text-gray-600">{transaction.method}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Annual Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Annual Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <h3 className="font-medium text-gray-900">Netflix</h3>
              <p className="text-2xl font-semibold text-red-600">$191.88</p>
              <p className="text-sm text-gray-600">12 payments</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-gray-900">Spotify</h3>
              <p className="text-2xl font-semibold text-green-600">$119.88</p>
              <p className="text-sm text-gray-600">12 payments</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <h3 className="font-medium text-gray-900">YouTube</h3>
              <p className="text-2xl font-semibold text-red-500">$143.88</p>
              <p className="text-sm text-gray-600">12 payments</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <h3 className="font-medium text-gray-900">ChatGPT</h3>
              <p className="text-2xl font-semibold text-purple-600">$240.00</p>
              <p className="text-sm text-gray-600">12 payments</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}