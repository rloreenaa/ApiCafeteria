import React, { useState, useCallback, memo } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export default memo(function Profile() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name:  user?.last_name || '',
    phone:      user?.profile?.phone || '',
    bio:        user?.profile?.bio || '',
    preferred_pickup_time: user?.profile?.preferred_pickup_time || '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = useCallback(e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authAPI.updateProfile(form);
      toast.success('Perfil actualizado correctamente');
    } catch {
      toast.error('Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  }, [form]);

  const fields = [
    { name: 'first_name', label: 'Nombre',           type: 'text' },
    { name: 'last_name',  label: 'Apellidos',         type: 'text' },
    { name: 'phone',      label: 'Teléfono',          type: 'tel'  },
    { name: 'bio',        label: 'Sobre mí',          type: 'text', multiline: true },
    { name: 'preferred_pickup_time', label: 'Hora habitual de recogida', type: 'time' },
  ];

  return (
    <>
      <Navbar />
      <main style={{ padding: '1.5rem 0', minHeight: 'calc(100dvh - 64px)' }}>
        <div className="container" style={{ maxWidth: 560 }}>
          <h1 style={{ color: 'var(--green-800)', marginBottom: '1.5rem' }}>Mi Perfil </h1>

          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            {user?.profile?.avatar_url
              ? <img src={user.profile.avatar_url} alt="Avatar" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--green-200)' }} />
              : <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--green-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem', color: 'var(--green-700)' }}>
                  {user?.first_name?.[0] || '?'}
                </div>
            }
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem' }}>{user?.full_name || user?.email}</p>
              <p style={{ color: 'var(--gray-500)', fontSize: '.85rem' }}>{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {fields.map(f => (
              <div key={f.name}>
                <label className="label" htmlFor={f.name}>{f.label}</label>
                {f.multiline ? (
                  <textarea id={f.name} name={f.name} value={form[f.name]} onChange={handleChange}
                    className="input" rows={3} style={{ resize: 'vertical' }} />
                ) : (
                  <input id={f.name} name={f.name} type={f.type} value={form[f.name]}
                    onChange={handleChange} className="input" />
                )}
              </div>
            ))}
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? ' Guardando...' : ' Guardar Cambios'}
            </button>
          </form>
        </div>
      </main>
    </>
  );
});
