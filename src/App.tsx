import { useState } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';
import { Landing } from '@/pages/Landing';
import { AuthPage } from '@/pages/AuthPage';
import { OwnerDashboard } from '@/pages/OwnerDashboard';
import { BeneficiaryDashboard } from '@/pages/BeneficiaryDashboard';
import { AdminDashboard } from '@/pages/AdminDashboard';

type Page = 'landing' | 'login' | 'register';

function AppContent() {
  const { session, activeRole } = useApp();
  const [page, setPage] = useState<Page>('landing');

  if (!session) {
    if (page === 'login') return <AuthPage mode="login" onNavigate={(p) => setPage(p)} />;
    if (page === 'register') return <AuthPage mode="register" onNavigate={(p) => setPage(p)} />;
    return <Landing onNavigate={(p) => setPage(p)} />;
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />
      <main>
        {activeRole === 'owner' && <OwnerDashboard />}
        {activeRole === 'beneficiary' && <BeneficiaryDashboard />}
        {activeRole === 'admin' && <AdminDashboard />}
      </main>
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
