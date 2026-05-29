import React, { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import api from '../services/api';
import axios from 'axios';

export default function Login() {
  const { role }    = useParams();
  const navigate    = useNavigate();
  const { login }   = useAuth();
  const [loading, setLoading] = useState(false);

  const isAdmin = role === 'admin';
  const title   = isAdmin ? 'Panel de Administración' : 'Acceso de Alumno';
  const emoji   = isAdmin ? '‍' : '';

  const handleDemoLogin = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/demo-login/', { role });
      login(data.access, data.user);
      toast.success(`¡Bienvenido, ${data.user.first_name}!`);
      navigate(data.user.profile?.role === 'admin' ? '/admin' : '/catalog', { replace: true });
    } catch (err) {
      toast.error('Error al iniciar sesión');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [role, login, navigate]);

  const handleGoogleSuccess = useCallback(async (tokenResponse) => {
    setLoading(true);
    try {
      const userInfo = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
      );
      const { data } = await api.post('/api/auth/google/', {
        email: userInfo.data.email,
        given_name: userInfo.data.given_name,
        family_name: userInfo.data.family_name,
        picture: userInfo.data.picture,
      });
      login(data.access, data.user);
      toast.success(`¡Bienvenido, ${data.user.first_name}!`);
      navigate(data.user.profile?.role === 'admin' ? '/admin' : '/catalog', { replace: true });
    } catch (err) {
      toast.error('Error al iniciar sesión con Google');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [login, navigate]);

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error('Error con Google OAuth'),
  });

  return (
    <main style={styles.page}>
      <div style={styles.bgBlob} aria-hidden />
      <div style={styles.card} className="animate-fade-in">
        <button onClick={() => navigate('/')} style={styles.back}> Volver</button>

        <div style={styles.header}>
          <span style={styles.emoji}>{emoji}</span>
          <h1 style={styles.title}>{title}</h1>
          <p style={styles.sub}>Acceso de demostración o con Google</p>
        </div>

        {loading ? <LoadingSpinner /> : (
          <>
            <button onClick={handleDemoLogin} style={styles.demoBtn}>
              {isAdmin ? '‍' : ''} Entrar como {isAdmin ? 'Administrador' : 'Alumno'}
            </button>

            <div style={styles.divider}>
              <span>o</span>
            </div>

            <button onClick={() => googleLogin()} style={styles.googleBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar con Google
            </button>

            <p style={styles.note}>
              Puedes entrar con demo o con tu cuenta Google
            </p>
          </>
        )}
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: '100dvh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '1.5rem 1rem',
    background: 'var(--green-50)', position: 'relative', overflow: 'hidden',
  },
  bgBlob: {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%,-50%)',
    width: 600, height: 600, borderRadius: '50%',
    background: 'radial-gradient(circle, var(--green-100) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative', zIndex: 1, background: 'white',
    borderRadius: 'var(--radius-xl)',
    padding: 'clamp(1.5rem, 5vw, 2.5rem)',
    maxWidth: 420, width: '100%', boxShadow: 'var(--shadow-lg)',
  },
  back: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--gray-500)', fontSize: '.875rem',
    fontWeight: 600, marginBottom: '1.5rem', padding: 0,
  },
  header: { textAlign: 'center', marginBottom: '2rem' },
  emoji: { fontSize: '3rem', display: 'block', marginBottom: '.75rem' },
  title: { fontSize: '1.5rem', color: 'var(--gray-900)', marginBottom: '.375rem' },
  sub: { color: 'var(--gray-500)', fontSize: '.9rem' },
  demoBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '.75rem', width: '100%', padding: '1rem',
    borderRadius: 'var(--radius-md)', border: 'none',
    background: 'var(--green-600)', color: 'white',
    fontFamily: 'var(--font-display)', fontWeight: 700,
    fontSize: '1rem', cursor: 'pointer', marginBottom: '1rem',
    boxShadow: '0 4px 14px rgba(22,163,74,.3)',
  },
  divider: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    color: 'var(--gray-300)', fontSize: '.8rem', marginBottom: '1rem',
  },
  googleBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '.75rem', width: '100%', padding: '.875rem',
    borderRadius: 'var(--radius-md)', border: '2px solid var(--gray-200)',
    background: 'white', fontFamily: 'var(--font-display)',
    fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
    color: 'var(--gray-800)', marginBottom: '1.25rem',
  },
  note: {
    fontSize: '.8rem', color: 'var(--gray-400)',
    textAlign: 'center', lineHeight: 1.5,
  },
};