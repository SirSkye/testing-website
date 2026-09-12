import React from 'react';

interface HeroSectionProps {
  onJoinClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onJoinClick }) => {
  return (
    /* STYLING HOOK: Hero section wrapper */
    <section
      style={{
        padding: '4rem 1.5rem',
        textAlign: 'center',
      }}
    >
      {/* STYLING HOOK: Hero Title */}
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Reminisce</h1>

      {/* STYLING HOOK: Hero Subtitle */}
      <p style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
        A memory roll built to capture the candid moments in between, whether you&apos;re on a solo
        trip, hanging out with friends, or hosting an event.
      </p>

      {/* STYLING HOOK: Call to Action button */}
      <button
        type="button"
        onClick={onJoinClick}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          cursor: 'pointer',
        }}
      >
        Get Early Access
      </button>
    </section>
  );
};