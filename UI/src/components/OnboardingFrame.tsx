import { Shield, ChevronRight, Banknote, CheckCircle, Lock, Eye } from 'lucide-react';
import { useApp } from './AppContext';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Badge } from './ui/badge';

const banks = [
  { name: 'Chase', logo: '🏦', popular: true },
  { name: 'Bank of America', logo: '🏦', popular: true },
  { name: 'Wells Fargo', logo: '🏦', popular: true },
  { name: 'Citi', logo: '🏦', popular: false },
  { name: 'Capital One', logo: '🏦', popular: false },
  { name: 'US Bank', logo: '🏦', popular: false },
];

export function OnboardingFrame() {
  const { setCurrentPage } = useApp();

  const handleConnectBank = () => {
    // Simulate bank connection process
    setTimeout(() => {
      setCurrentPage('enhanced-dashboard');
    }, 2000);
  };

  const handleSkipDemo = () => {
    setCurrentPage('enhanced-dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
              <Banknote className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Benchwise</h1>
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-900">
            Welcome to Smart Financial Management
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect your bank account to get personalized insights, track irregular income, 
            and optimize your subscriptions with AI-powered recommendations.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium">
              1
            </div>
            <span className="font-medium text-purple-600">Connect</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
              2
            </div>
            <span className="text-gray-500">Analyze</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
              3
            </div>
            <span className="text-gray-500">Optimize</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Security and Benefits */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold">Bank-Level Security</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm">256-bit encryption</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm">Read-only access</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm">Never store credentials</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm">FDIC member banks only</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1652503698072-175651f77634?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW5raW5nJTIwc2VjdXJpdHklMjBzaGllbGR8ZW58MXx8fHwxNzU3NzExOTIyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Banking Security"
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
                <div className="flex items-center space-x-2 mb-3">
                  <Lock className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">What we see:</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Account balances and transactions</li>
                  <li>• Recurring subscription charges</li>
                  <li>• Income patterns and frequency</li>
                </ul>
                <div className="flex items-center space-x-2 mt-4 mb-3">
                  <Eye className="w-5 h-5 text-red-600" />
                  <span className="font-medium">What we never see:</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Your login credentials</li>
                  <li>• Account or routing numbers</li>
                  <li>• Personal information</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Bank Connection */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Connect Your Bank Account</h3>
                <Button
                  onClick={handleConnectBank}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 mb-4"
                  size="lg"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Connect Securely with Plaid
                </Button>
                
                <div className="text-center mb-4">
                  <span className="text-sm text-gray-500">Popular banks</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {banks.filter(bank => bank.popular).map((bank, index) => (
                    <div
                      key={index}
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-purple-300 cursor-pointer transition-colors"
                    >
                      <span className="text-2xl mr-3">{bank.logo}</span>
                      <span className="text-sm font-medium">{bank.name}</span>
                    </div>
                  ))}
                </div>
                
                <details className="mt-4">
                  <summary className="text-sm text-purple-600 cursor-pointer">
                    View all supported banks
                  </summary>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {banks.filter(bank => !bank.popular).map((bank, index) => (
                      <div
                        key={index}
                        className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-purple-300 cursor-pointer transition-colors"
                      >
                        <span className="text-2xl mr-3">{bank.logo}</span>
                        <span className="text-sm font-medium">{bank.name}</span>
                      </div>
                    ))}
                  </div>
                </details>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <Shield className="w-3 h-3 mr-1" />
                SOC 2 Certified
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                <Lock className="w-3 h-3 mr-1" />
                PCI Compliant
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                <CheckCircle className="w-3 h-3 mr-1" />
                GDPR Ready
              </Badge>
            </div>

            {/* Skip Option */}
            <div className="text-center pt-4">
              <Button 
                variant="ghost" 
                onClick={handleSkipDemo}
                className="text-gray-600 hover:text-gray-800"
              >
                Skip for now - View demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}