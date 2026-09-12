import React from 'react';

export const ContactHeader: React.FC = () => {
  return (
    <header
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        backgroundColor: 'var(--color-primary)',
        borderTop: 'var(--border-thin)',
        color: 'var(--color-text-primary)',
        padding: '0.75rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
        fontSize: '0.9rem',
      }}
    >
      <div>
        <span>Get in touch: </span>
        <a
          href="mailto:contact@reminisce.app"
          style={{
            color: 'var(--color-text-primary)',
            fontWeight: 700,
            marginLeft: '0.5rem',
            textDecoration: 'none',
            borderBottom: '1px solid var(--color-accent)',
          }}
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