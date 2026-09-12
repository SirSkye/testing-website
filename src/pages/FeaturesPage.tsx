import React from 'react';
import { HowItWorksSection } from '../components/HowItWorksSection';
import RetraceMap from '../components/RetraceMap';
import { sampleTrip } from '../utils/sampleTrip';

interface FeaturesPageProps {
  onJoinClick: () => void;
}

export const FeaturesPage: React.FC<FeaturesPageProps> = ({ onJoinClick }) => {
  return (
    /* STYLING HOOK: Dedicated features page container */
    <main style={{ padding: '3rem 1.5rem', maxWidth: '900px', margin: '0 auto', minHeight: '60vh' }}>
      {/* STYLING HOOK: Page header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>Features</h1>
        <p style={{ color: '#555', fontSize: '1.1rem' }}>
          Discover how Reminisce captures and preserves genuine moments.
        </p>
      </div>

      {/* Feature showcase / how it works block */}
      <HowItWorksSection />

      <RetraceMap trip={sampleTrip} mapboxToken={"pk.eyJ1Ijoic2lyc2t5ZSIsImEiOiJjbXR5cW9hNjkwY3dvMnhwendiczI0bGh1In0.sJVvuz1b3-AWriA6LFT2vQ"} />

      {/* STYLING HOOK: Bottom CTA section */}
      <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
        <button
          type="button"
          onClick={onJoinClick}
          style={{
            padding: '0.75rem 1.75rem',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          Join the Waitlist
        </button>
      </div>
    </main>
  );
};