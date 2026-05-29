import React from 'react';

export default function LoadingSpinner({ fullscreen = false }) {
  const wrapper = fullscreen ? {
    position: 'fixed', inset: 0, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    background: 'var(--green-50)', zIndex: 9999,
  } : { display: 'flex', justifyContent: 'center', padding: '2rem' };

  return (
    <div style={wrapper}>
      <div style={{
        width: 44, height: 44,
        border: '4px solid var(--green-100)',
        borderTopColor: 'var(--green-600)',
        borderRadius: '50%',
        animation: 'spin .8s linear infinite',
      }} />
    </div>
  );
}
