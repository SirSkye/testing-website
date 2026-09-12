import React from 'react';
import { WaitlistForm } from '../components/WaitlistForm';

export const WaitlistPage: React.FC = () => {
  return (
    /* STYLING HOOK: Standalone waitlist page view */
    <main style={{ padding: '4rem 1.5rem', minHeight: '60vh' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Be First in Line</h1>
        <p style={{ marginBottom: '2rem', color: '#555' }}>
          Sign up to get notified when we launch the Reminisce rolls.
        </p>
        <WaitlistForm />
      </div>
    </main>
  );
};