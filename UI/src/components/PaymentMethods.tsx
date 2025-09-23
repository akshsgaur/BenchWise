import { ArrowLeft, Plus, CreditCard, Shield, Trash2, Edit, Star } from 'lucide-react';
import { useApp } from './AppContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const paymentMethods = [
  {
    id: 1,
    type: 'Visa',
    last4: '4532',
    expiryMonth: '12',
    expiryYear: '2027',
    isDefault: true,
    services: ['Netflix']
  },
  {
    id: 2,
    type: 'Mastercard',
    last4: '8901',
    expiryMonth: '08',
    expiryYear: '2026',
    isDefault: false,
    services: ['YouTube Premium']
  },
  {
    id: 3,
    type: 'Visa',
    last4: '1234',
    expiryMonth: '03',
    expiryYear: '2028',
    isDefault: false,
    services: ['Spotify Premium']
  },
  {
    id: 4,
    type: 'American Express',
    last4: '5678',
    expiryMonth: '11',
    expiryYear: '2025',
    isDefault: false,
    services: ['ChatGPT Plus']
  }
];

const getCardIcon = (type: string) => {
  const cardTypes: { [key: string]: string } = {
    'Visa': '💳',
    'Mastercard': '💳',
    'American Express': '💳',
    'Discover': '💳'
  };
  return cardTypes[type] || '💳';
};

const getCardColor = (type: string) => {
  const colors: { [key: string]: string } = {
    'Visa': 'bg-blue-500',
    'Mastercard': 'bg-red-500',
    'American Express': 'bg-green-500',
    'Discover': 'bg-orange-500'
  };
  return colors[type] || 'bg-gray-500';
};

export function PaymentMethods() {
  const { goBack } = useApp();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
            <h1 className="text-2xl font-semibold text-gray-900">Payment Methods</h1>
            <p className="text-gray-600">Manage your payment cards and billing information</p>
          </div>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Payment Method
        </Button>
      </div>

      {/* Security Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-800">Your payment information is secure</p>
              <p className="text-xs text-blue-600">All payment data is encrypted and stored securely with our payment processor.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {paymentMethods.map((method) => (
          <Card key={method.id} className="relative">
            <CardContent className="p-6">
              {/* Card Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-6 ${getCardColor(method.type)} rounded flex items-center justify-center`}>
                    <span className="text-white text-xs font-medium">
                      {method.type === 'American Express' ? 'AMEX' : method.type.slice(0, 4)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">•••• •••• •••• {method.last4}</p>
                    <p className="text-sm text-gray-600">{method.type}</p>
                  </div>
                </div>
                {method.isDefault && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <Star className="w-3 h-3 mr-1" />
                    Default
                  </Badge>
                )}
              </div>

              {/* Card Details */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Expires:</span>
                  <span className="font-medium">{method.expiryMonth}/{method.expiryYear}</span>
                </div>
                
                <div>
                  <span className="text-sm text-gray-600">Used for:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {method.services.map((service, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  {!method.isDefault && (
                    <Button variant="ghost" size="sm">
                      <Star className="w-4 h-4 mr-1" />
                      Set Default
                    </Button>
                  )}
                </div>
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New Card */}
      <Card className="border-dashed border-2 border-gray-300 hover:border-purple-400 transition-colors cursor-pointer">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Add New Payment Method</h3>
            <p className="text-sm text-gray-600 mb-4">
              Add a new credit or debit card to manage your subscriptions
            </p>
            <Button variant="outline">
              <CreditCard className="w-4 h-4 mr-2" />
              Add Card
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Payment Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Security Features</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  256-bit SSL encryption
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  PCI DSS compliant
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Fraud monitoring
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Two-factor authentication
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Billing Alerts</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Payment confirmations
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Failed payment alerts
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Expiration reminders
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Spending summaries
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}