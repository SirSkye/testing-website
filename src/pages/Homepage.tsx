import React from 'react';
import { HeroSection } from '../components/HeroSection';
import { OverviewSection } from '../components/OverviewSection';
import { WaitlistForm } from '../components/WaitlistForm';

interface HomePageProps {
  onJoinClick: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onJoinClick }) => {
  return (
    <main>
      <HeroSection onJoinClick={onJoinClick} />
      <OverviewSection />

      {/* STYLING HOOK: Landing page waitlist section */}
      <section id="waitlist-section" style={{ padding: '3rem 1.5rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Join the Waitlist</h2>
        <WaitlistForm />
      </section>
    </main>
  );
};