import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default memo(function Welcome() {
  const navigate   = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated) navigate(isAdmin ? '/admin' : '/catalog', { replace: true });
  }, [isAuthenticated, isAdmin, navigate]);

  return (
    <main style={styles.page}>
      {/* Background decoration */}
      <div style={styles.bgBlob1} aria-hidden />
      <div style={styles.bgBlob2} aria-hidden />

      <div style={styles.content} className="animate-fade-in">
        {/* Logo */}
        <div style={styles.logoArea}>
          <span style={styles.emoji}></span>
          <h1 style={styles.title}>Cafetería</h1>
          <p style={styles.sub}>Tu cafetería IES Pío Baroja</p>
        </div>

        {/* Role cards */}
        <p style={styles.prompt}>¿Quién eres hoy?</p>
        <div style={styles.cards}>
          <button style={styles.roleCard} onClick={() => navigate('/login/student')}>
            <span style={styles.roleEmoji}></span>
            <strong style={styles.roleName}>Alumno</strong>
            <p style={styles.roleDesc}>Pide tu menú, paga y recoge sin esperas</p>
          </button>
          <button style={styles.roleCard} onClick={() => navigate('/login/admin')}>
            <span style={styles.roleEmoji}>‍</span>
            <strong style={styles.roleName}>Administrador</strong>
            <p style={styles.roleDesc}>Gestiona el menú, pedidos y estadísticas</p>
          </button>
        </div>

        <p style={styles.footer}>Cafetería IES Pío Baroja © 2026 </p>
      </div>
    </main>
  );
});

const styles = {
  page: {
    minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '2rem 1rem', position: 'relative', overflow: 'hidden',
    background: 'linear-gradient(135deg, var(--green-50) 0%, white 50%, var(--green-100) 100%)',
  },
  bgBlob1: {
    position: 'absolute', top: -100, right: -100,
    width: 400, height: 400, borderRadius: '50%',
    background: 'radial-gradient(circle, var(--green-200) 0%, transparent 70%)',
    opacity: .4,
  },
  bgBlob2: {
    position: 'absolute', bottom: -150, left: -100,
    width: 500, height: 500, borderRadius: '50%',
    background: 'radial-gradient(circle, var(--green-200) 0%, transparent 70%)',
    opacity: .3,
  },
  content: { position: 'relative', zIndex: 1, maxWidth: 480, width: '100%', textAlign: 'center' },
  logoArea: { marginBottom: '2.5rem' },
  emoji: { fontSize: '4rem', display: 'block', marginBottom: '.5rem' },
  title: { color: 'var(--green-800)', marginBottom: '.375rem' },
  sub: { color: 'var(--gray-500)', fontSize: '1rem' },
  prompt: { color: 'var(--gray-700)', fontWeight: 600, marginBottom: '1rem' },
  cards: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' },
  roleCard: {
    background: 'white', border: '2px solid var(--green-200)',
    borderRadius: 'var(--radius-xl)', padding: '1.5rem 1rem',
    cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.5rem',
    transition: 'border-color .2s, box-shadow .2s, transform .2s',
    fontFamily: 'var(--font-body)',
  },
  roleEmoji: { fontSize: '2.5rem' },
  roleName: { fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--gray-900)' },
  roleDesc: { fontSize: '.8rem', color: 'var(--gray-500)', lineHeight: 1.4 },
  footer: { fontSize: '.8rem', color: 'var(--gray-400)' },
};
