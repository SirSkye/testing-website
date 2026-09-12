import React from 'react';

export const HowItWorksSection: React.FC = () => {
  return (
    /* STYLING HOOK: Features / How It Works section */
    <section
      id="features-section"
      style={{
        padding: '3rem 1.5rem',
        maxWidth: '800px',
        margin: '0 auto',
      }}
    >
      <h2>How It Works</h2>
      {/* STYLING HOOK: Grid or list of features */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
          marginTop: '1.5rem',
        }}
      >
        {/* Feature 1 */}
        <div style={{ border: '1px solid #ddd', padding: '1.5rem', borderRadius: '4px' }}>
          <h3>1. Create or Join</h3>
          <p>Start a shared roll for an event, road trip, or everyday moments.</p>
        </div>

        {/* Feature 2 */}
        <div style={{ border: '1px solid #ddd', padding: '1.5rem', borderRadius: '4px' }}>
          <h3>2. Capture Candidly</h3>
          <p>Take spontaneous snaps without worrying about curation or filters.</p>
        </div>

        {/* Feature 3 */}
        <div style={{ border: '1px solid #ddd', padding: '1.5rem', borderRadius: '4px' }}>
          <h3>3. Relive Together</h3>
          <p>Discover shared memories revealed in a collective roll after the moment passes.</p>
        </div>
      </div>
    </section>
  );
};