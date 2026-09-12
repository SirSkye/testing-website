import React from 'react';

export const OverviewSection: React.FC = () => {
  return (
    /* STYLING HOOK: Overview Section */
    <section style={{ padding: '3rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2>What is Reminisce?</h2>
      <p style={{ lineHeight: '1.6', marginTop: '1rem' }}>
        Reminisce rethinks how you preserve authentic memories. Instead of staged photos and endless
        feeds, Reminisce focuses on raw, candid fragments that tell the genuine story of your
        shared experiences.
      </p>
    </section>
  );
};