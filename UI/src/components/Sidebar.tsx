import { 
  CreditCard, 
  DollarSign, 
  Wallet, 
  Repeat, 
  Calendar,
  Users,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { useState } from 'react';
import { useApp } from './AppContext';

const menuItems = {
  payments: [
    { icon: CreditCard, label: 'Dashboard', active: false, page: 'enhanced-dashboard' as const },
    { icon: DollarSign, label: 'Cash Flow', active: false, page: 'cash-flow-analysis' as const },
    { icon: MessageSquare, label: 'AI Advisor', active: false, page: 'ai-advice-frame' as const },
    { icon: Repeat, label: 'Subscriptions', active: true, page: 'subscription-detail' as const },
    { icon: Calendar, label: 'Payment plans', active: false, page: 'enhanced-dashboard' as const },
  ],
  commerce: [
    { icon: Users, label: 'Referrals', active: false, page: 'enhanced-dashboard' as const },
    { icon: FileText, label: 'Audit logs', active: false, page: 'billing-history' as const },
    { icon: Settings, label: 'Settings', active: false, page: 'profile-settings' as const },
  ]
};

export function Sidebar() {
  const [paymentsExpanded, setPaymentsExpanded] = useState(true);
  const [commerceExpanded, setCommerceExpanded] = useState(false);
  const { setCurrentPage, currentPage } = useApp();

  return (
    <aside className="w-70 bg-white border-r border-gray-200 h-full">
      <div className="p-6">
        {/* Payments Section */}
        <div className="mb-6">
          <button
            onClick={() => setPaymentsExpanded(!paymentsExpanded)}
            className="flex items-center justify-between w-full text-left mb-2"
          >
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              PAYMENTS
            </span>
            {paymentsExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>
          
          {paymentsExpanded && (
            <nav className="space-y-1">
              {menuItems.payments.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.page;
                return (
                  <button
                    key={item.label}
                    onClick={() => setCurrentPage(item.page)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-green-50 text-green-700 border-r-2 border-green-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          )}
        </div>

        {/* Commerce Section */}
        <div>
          <button
            onClick={() => setCommerceExpanded(!commerceExpanded)}
            className="flex items-center justify-between w-full text-left mb-2"
          >
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              COMMERCE
            </span>
            {commerceExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>
          
          {commerceExpanded && (
            <nav className="space-y-1">
              {menuItems.commerce.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.page;
                return (
                  <button
                    key={item.label}
                    onClick={() => setCurrentPage(item.page)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-green-50 text-green-700 border-r-2 border-green-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          )}
        </div>
      </div>
    </aside>
  );
}