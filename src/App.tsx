import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ContactHeader } from './components/ContactHeader';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { FeaturesPage } from './pages/FeaturesPage';
import { WaitlistPage } from './pages/WaitlistPage';
import { ActivePage } from './types';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<ActivePage>('home');

  const handleGoToWaitlist = () => {
    setCurrentPage('waitlist');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />

      {/* Main Content Pages */}
      <div style={{ flex: 1 }}>
        {currentPage === 'home' && <HomePage onJoinClick={handleGoToWaitlist} />}
        {currentPage === 'features' && <FeaturesPage onJoinClick={handleGoToWaitlist} />}
        {currentPage === 'waitlist' && <WaitlistPage />}
      </div>

      {/* Page Footer */}
      <Footer />

      {/* Fixed Contact Header */}
      <ContactHeader />
    </div>
  );
};

export default App;