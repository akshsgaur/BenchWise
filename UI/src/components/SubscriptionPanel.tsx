import { ChevronRight, MoreHorizontal } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';
import { useApp } from './AppContext';

const subscriptions = [
  {
    id: 1,
    name: 'Netflix',
    description: 'Media service, streaming...',
    logo: 'https://images.unsplash.com/photo-1627873649417-c67f701f1949?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxOZXRmbGl4JTIwcmVkJTIwbG9nb3xlbnwxfHx8fDE3NTc3MTEzNzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    logoFallback: 'N',
    page: 'netflix-details' as const
  },
  {
    id: 2,
    name: 'YouTube Premium',
    description: 'Video platform, ad-free...',
    logo: 'https://images.unsplash.com/photo-1705904506626-aba18263a2c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxZb3VUdWJlJTIwbG9nbyUyMHJlZHxlbnwxfHx8fDE3NTc3MTEzNzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    logoFallback: 'Y',
    page: 'youtube-details' as const
  },
  {
    id: 3,
    name: 'Spotify Premium',
    description: 'Music streaming, ad-free...',
    logo: 'https://images.unsplash.com/photo-1551817958-795f9440ce4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTcG90aWZ5JTIwZ3JlZW4lMjBsb2dvfGVufDF8fHx8MTc1NzcxMTM3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    logoFallback: 'S',
    page: 'spotify-details' as const
  },
  {
    id: 4,
    name: 'ChatGPT Plus',
    description: 'AI assistant, advanced features...',
    logo: 'https://images.unsplash.com/photo-1679403766665-67ed6cd2df30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxDaGF0R1BUJTIwQUklMjBsb2dvfGVufDF8fHx8MTc1NzcxMTM4Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    logoFallback: 'C',
    page: 'chatgpt-details' as const
  }
];

export function SubscriptionPanel() {
  const [activeTab, setActiveTab] = useState('Subscriptions');
  const { setCurrentPage } = useApp();

  const handleSubscriptionClick = (subscription: typeof subscriptions[0]) => {
    setCurrentPage(subscription.page);
  };

  const handleViewAllClick = () => {
    setCurrentPage('subscriptions-overview');
  };

  return (
    <div className="w-80 bg-white h-full border-l border-gray-200">
      <div className="p-6">
        {/* Tab Headers */}
        <div className="flex space-x-6 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('Stats')}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === 'Stats'
                ? 'text-gray-900 border-b-2 border-purple-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Stats
          </button>
          <button
            onClick={() => setActiveTab('Subscriptions')}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === 'Subscriptions'
                ? 'text-gray-900 border-b-2 border-purple-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Subscriptions
          </button>
        </div>

        {/* Subscription Cards */}
        {activeTab === 'Subscriptions' && (
          <div className="space-y-3">
            {/* View All Button */}
            <button
              onClick={handleViewAllClick}
              className="w-full p-3 border border-purple-200 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors text-purple-700 text-sm font-medium"
            >
              View All Subscriptions
            </button>
            
            {subscriptions.map((subscription) => (
              <div
                key={subscription.id}
                onClick={() => handleSubscriptionClick(subscription)}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-md transition-all duration-200 cursor-pointer group"
              >
                <div className="flex-shrink-0 mr-3">
                  <ImageWithFallback
                    src={subscription.logo}
                    alt={subscription.name}
                    className="w-8 h-8 rounded object-cover"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {subscription.name}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">
                    {subscription.description}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Stats' && (
          <div className="text-center py-12 text-gray-500">
            <p>Stats content coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}