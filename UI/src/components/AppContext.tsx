import React, { createContext, useContext, useState } from 'react';

type Page = 
  | 'onboarding'
  | 'dashboard'
  | 'enhanced-dashboard'
  | 'ai-advice-frame'
  | 'subscription-detail'
  | 'cash-flow-analysis'
  | 'profile-settings'
  | 'subscriptions-overview'
  | 'netflix-details'
  | 'youtube-details'
  | 'spotify-details'
  | 'chatgpt-details'
  | 'billing-history'
  | 'payment-methods'
  | 'subscription-settings';

interface AppContextType {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  navigationHistory: Page[];
  goBack: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPageState] = useState<Page>('onboarding');
  const [navigationHistory, setNavigationHistory] = useState<Page[]>(['onboarding']);

  const setCurrentPage = (page: Page) => {
    setCurrentPageState(page);
    setNavigationHistory(prev => [...prev, page]);
  };

  const goBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = navigationHistory.slice(0, -1);
      setNavigationHistory(newHistory);
      setCurrentPageState(newHistory[newHistory.length - 1]);
    }
  };

  return (
    <AppContext.Provider value={{
      currentPage,
      setCurrentPage,
      navigationHistory,
      goBack
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}