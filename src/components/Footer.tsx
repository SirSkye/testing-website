import React from 'react';

export const Footer: React.FC = () => {
  return (
    /* STYLING HOOK: Footer container (padded bottom to prevent fixed contact bar overlap) */
    <footer
      style={{
        padding: '2rem 1.5rem 5rem 1.5rem',
        textAlign: 'center',
        borderTop: '1px solid #eaeaea',
        marginTop: '3rem',
      }}
    >
      <p>Reminisce &mdash; Capture the candid moments in between.</p>
    </footer>
  );
};