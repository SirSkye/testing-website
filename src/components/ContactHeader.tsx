import React from 'react';

export const ContactHeader: React.FC = () => {
  return (
    /* STYLING HOOK: Fixed banner/bar pinned to screen or page end */
    <header
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        backgroundColor: '#111',
        color: '#fff',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
      }}
      aria-label="Contact information"
    >
      <div>
        {/* STYLING HOOK: Contact label */}
        <span style={{ fontWeight: 600 }}>Get in touch: </span>
        {/* STYLING HOOK: Contact links */}
        <a
          href="mailto:contact@reminisce.app"
          style={{ color: '#fff', textDecoration: 'underline', marginRight: '1rem' }}
        >
          contact@reminisce.app
        </a>
      </div>
      <div>
        <span>Reminisce &copy; {new Date().getFullYear()}</span>
      </div>
    </header>
  );
};