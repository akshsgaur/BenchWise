import { AppProvider, useApp } from "./components/AppContext";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { RevenueChart } from "./components/RevenueChart";
import { SuccessRate } from "./components/SuccessRate";
import { AIAdvice } from "./components/AIAdvice";
import { SubscriptionPanel } from "./components/SubscriptionPanel";
import { OnboardingFrame } from "./components/OnboardingFrame";
import { EnhancedDashboard } from "./components/EnhancedDashboard";
import { AIAdviceFrame } from "./components/AIAdviceFrame";
import { SubscriptionDetailFrame } from "./components/SubscriptionDetailFrame";
import { CashFlowAnalysis } from "./components/CashFlowAnalysis";
import { ProfileSettings } from "./components/ProfileSettings";
import { SubscriptionsOverview } from "./components/SubscriptionsOverview";
import { NetflixDetails } from "./components/NetflixDetails";
import { YouTubeDetails } from "./components/YouTubeDetails";
import { SpotifyDetails } from "./components/SpotifyDetails";
import { ChatGPTDetails } from "./components/ChatGPTDetails";
import { BillingHistory } from "./components/BillingHistory";
import { PaymentMethods } from "./components/PaymentMethods";
import { SubscriptionSettings } from "./components/SubscriptionSettings";

function AppContent() {
  const { currentPage } = useApp();

  const renderMainContent = () => {
    switch (currentPage) {
      case "onboarding":
        return <OnboardingFrame />;
      case "dashboard":
        return (
          <div className="max-w-6xl mx-auto space-y-8">
            <RevenueChart />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <SuccessRate />
              <AIAdvice />
            </div>
          </div>
        );
      case "enhanced-dashboard":
        return <EnhancedDashboard />;
      case "ai-advice-frame":
        return <AIAdviceFrame />;
      case "subscription-detail":
        return <SubscriptionDetailFrame />;
      case "cash-flow-analysis":
        return <CashFlowAnalysis />;
      case "profile-settings":
        return <ProfileSettings />;
      case "subscriptions-overview":
        return <SubscriptionsOverview />;
      case "netflix-details":
        return <NetflixDetails />;
      case "youtube-details":
        return <YouTubeDetails />;
      case "spotify-details":
        return <SpotifyDetails />;
      case "chatgpt-details":
        return <ChatGPTDetails />;
      case "billing-history":
        return <BillingHistory />;
      case "payment-methods":
        return <PaymentMethods />;
      case "subscription-settings":
        return <SubscriptionSettings />;
      default:
        return (
          <div className="max-w-6xl mx-auto space-y-8">
            <RevenueChart />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <SuccessRate />
              <AIAdvice />
            </div>
          </div>
        );
    }
  };

  const showRightSidebar =
    currentPage === "dashboard" ||
    currentPage === "enhanced-dashboard";
  const showHeaderAndSidebar = currentPage !== "onboarding";

  if (currentPage === "onboarding") {
    return <OnboardingFrame />;
  }

  return (
    <div className="min-h-screen bg-[#F5F5DC] flex flex-col">
      {showHeaderAndSidebar && <Header />}
      <div className="flex flex-1 overflow-hidden">
        {showHeaderAndSidebar && <Sidebar />}
        <main className="flex-1 p-8 overflow-y-auto">
          {renderMainContent()}
        </main>
        {showRightSidebar && <SubscriptionPanel />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}