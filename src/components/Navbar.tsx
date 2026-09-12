import React from 'react';
import { ActivePage } from '../types';

interface NavbarProps {
  currentPage: ActivePage;
  onNavigate: (page: ActivePage) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  return (
    /* STYLING HOOK: Main Top Navigation bar */
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        borderBottom: '1px solid #eaeaea',
      }}
    >
      {/* Brand logo */}
      <button
        type="button"
        onClick={() => onNavigate('home')}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '1.25rem',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Reminisce
      </button>

      {/* Nav Links */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => onNavigate('home')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: currentPage === 'home' ? 700 : 400,
          }}
        >
          Home
        </button>

        <button
          type="button"
          onClick={() => onNavigate('features')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: currentPage === 'features' ? 700 : 400,
          }}
        >
          Features
        </button>

        <button
          type="button"
          onClick={() => onNavigate('waitlist')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: currentPage === 'waitlist' ? 700 : 400,
          }}
        >
          Waitlist
        </button>
      </div>
    </nav>
  );
};