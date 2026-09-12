import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { validateWaitlistForm } from '../utils/validation';

export const WaitlistForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const validation = validateWaitlistForm({ name, email });
    if (!validation.isValid) {
      setErrorMessage(validation.error || 'Please check your inputs.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.from('waitlist').insert([
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
        },
      ]);

      if (error) {
        // PostgREST code 23505 indicates unique constraint violation (duplicate email)
        if (error.code === '23505') {
          setErrorMessage('This email is already on the waitlist!');
        } else {
          setErrorMessage(error.message || 'Failed to submit. Please try again later.');
        }
        return;
      }

      setIsSuccess(true);
      setName('');
      setEmail('');
    } catch {
      setErrorMessage('A network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    /* STYLING HOOK: Waitlist form container */
    <div style={{ maxWidth: '480px', margin: '0 auto', width: '100%' }}>
      {isSuccess ? (
        /* STYLING HOOK: Success message block */
        <div
          role="status"
          style={{
            padding: '1rem',
            border: '1px solid green',
            borderRadius: '4px',
            backgroundColor: '#e6f4ea',
            color: '#137333',
            textAlign: 'center',
          }}
        >
          <h3>You&apos;re on the list!</h3>
          <p>Thank you for joining. We&apos;ll notify you when Reminisce is ready.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          {/* STYLING HOOK: Error message alert */}
          {errorMessage && (
            <div
              role="alert"
              style={{
                marginBottom: '1rem',
                padding: '0.75rem',
                border: '1px solid red',
                borderRadius: '4px',
                backgroundColor: '#fce8e6',
                color: '#c5221f',
              }}
            >
              {errorMessage}
            </div>
          )}

          {/* STYLING HOOK: Name input group */}
          <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label htmlFor="name" style={{ fontWeight: 500 }}>
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              placeholder="Your name"
              disabled={isLoading}
              onChange={(e) => setName(e.target.value)}
              style={{ padding: '0.5rem', fontSize: '1rem' }}
              required
            />
          </div>

          {/* STYLING HOOK: Email input group */}
          <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label htmlFor="email" style={{ fontWeight: 500 }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              placeholder="you@example.com"
              disabled={isLoading}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: '0.5rem', fontSize: '1rem' }}
              required
            />
          </div>

          {/* STYLING HOOK: Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? 'Joining...' : 'Join Waitlist'}
          </button>
        </form>
      )}
    </div>
  );
};