import { ArrowLeft, Plus, Filter, Search, CreditCard, Calendar } from 'lucide-react';
import { useApp } from './AppContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

const subscriptions = [
  {
    id: 1,
    name: 'Netflix',
    plan: 'Premium',
    price: '$15.99',
    billing: 'Monthly',
    nextBilling: '2025-01-15',
    status: 'Active',
    logo: 'https://images.unsplash.com/photo-1627873649417-c67f701f1949?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxOZXRmbGl4JTIwcmVkJTIwbG9nb3xlbnwxfHx8fDE3NTc3MTEzNzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    page: 'netflix-details' as const
  },
  {
    id: 2,
    name: 'YouTube Premium',
    plan: 'Individual',
    price: '$11.99',
    billing: 'Monthly',
    nextBilling: '2025-01-20',
    status: 'Active',
    logo: 'https://images.unsplash.com/photo-1705904506626-aba18263a2c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxZb3VUdWJlJTIwbG9nbyUyMHJlZHxlbnwxfHx8fDE3NTc3MTEzNzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    page: 'youtube-details' as const
  },
  {
    id: 3,
    name: 'Spotify Premium',
    plan: 'Individual',
    price: '$9.99',
    billing: 'Monthly',
    nextBilling: '2025-01-25',
    status: 'Active',
    logo: 'https://images.unsplash.com/photo-1551817958-795f9440ce4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTcG90aWZ5JTIwZ3JlZW4lMjBsb2dvfGVufDF8fHx8MTc1NzcxMTM3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    page: 'spotify-details' as const
  },
  {
    id: 4,
    name: 'ChatGPT Plus',
    plan: 'Plus',
    price: '$20.00',
    billing: 'Monthly',
    nextBilling: '2025-01-30',
    status: 'Active',
    logo: 'https://images.unsplash.com/photo-1679403766665-67ed6cd2df30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxDaGF0R1BUJTIwQUklMjBsb2dvfGVufDF8fHx8MTc1NzcxMTM4Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    page: 'chatgpt-details' as const
  }
];

export function SubscriptionsOverview() {
  const { goBack, setCurrentPage } = useApp();

  const totalMonthly = subscriptions.reduce((total, sub) => {
    return total + parseFloat(sub.price.replace('$', ''));
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
            <h1 className="text-2xl font-semibold text-gray-900">Subscriptions</h1>
            <p className="text-gray-600">Manage all your active subscriptions</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentPage('payment-methods')}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Payment Methods
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentPage('billing-history')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Billing History
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Subscription
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Monthly</p>
              <p className="text-2xl font-semibold text-gray-900">${totalMonthly.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Subscriptions</p>
              <p className="text-2xl font-semibold text-gray-900">{subscriptions.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Yearly Estimate</p>
              <p className="text-2xl font-semibold text-gray-900">${(totalMonthly * 12).toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Next Billing</p>
              <p className="text-2xl font-semibold text-gray-900">Jan 15</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">All Subscriptions</h2>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search subscriptions..."
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Subscriptions List */}
        <div className="space-y-4">
          {subscriptions.map((subscription) => (
            <div
              key={subscription.id}
              onClick={() => setCurrentPage(subscription.page)}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-md transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center space-x-4">
                <ImageWithFallback
                  src={subscription.logo}
                  alt={subscription.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-medium text-gray-900">{subscription.name}</h3>
                  <p className="text-sm text-gray-600">{subscription.plan} Plan</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="font-medium text-gray-900">{subscription.price}</p>
                  <p className="text-sm text-gray-600">{subscription.billing}</p>
                </div>
                
                <div className="text-right">
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    {subscription.status}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-1">Next: {subscription.nextBilling}</p>
                </div>
                
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm">
                    Manage
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}