import React, { useState, useCallback, memo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';

const Icon = memo(({ name, size = 22 }) => {
  const icons = {
    menu:     <><line x1="3" y1="6"  x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>,
    close:    <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    catalog:  <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    cart:     <><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></>,
    heart:    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>,
    history:  <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>,
    user:     <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    logout:   <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    dashboard:<><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
});

function Navbar() {
  const [open, setOpen]   = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { totalItems }    = useCart();
  const { favoritesCount }= useFavorites();
  const navigate          = useNavigate();
  const location          = useLocation();

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
    setOpen(false);
  }, [logout, navigate]);

  const close = useCallback(() => setOpen(false), []);
  const isActive = useCallback((path) => location.pathname === path, [location]);

  const studentLinks = [
    { to: '/catalog',   icon: 'catalog',  label: 'Catálogo' },
    { to: '/favorites', icon: 'heart',    label: `Favoritos ${favoritesCount > 0 ? '('+favoritesCount+')' : ''}` },
    { to: '/orders',    icon: 'history',  label: 'Mis Pedidos' },
    { to: '/profile',   icon: 'user',     label: 'Mi Perfil' },
  ];

  const adminLinks = [
    { to: '/admin',         icon: 'dashboard', label: 'Dashboard' },
    { to: '/admin/profile', icon: 'user',      label: 'Mi Perfil' },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          {/* Logo */}
          <Link to={isAdmin ? '/admin' : '/catalog'} style={styles.logo} onClick={close}>
            <span style={styles.logoIcon}></span>
            <span style={styles.logoText}>Cafetería</span>
          </Link>

          {/* Desktop nav */}
          <nav style={styles.desktopNav}>
            {links.map(l => (
              <Link key={l.to} to={l.to} style={{
                ...styles.navLink,
                ...(isActive(l.to) ? styles.navLinkActive : {})
              }}>
                <Icon name={l.icon} size={18} />
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right: cart + hamburger */}
          <div style={styles.headerRight}>
            {!isAdmin && (
              <Link to="/cart" style={styles.cartBtn}>
                <Icon name="cart" size={22} />
                {totalItems > 0 && <span style={styles.badge}>{totalItems}</span>}
              </Link>
            )}
            <button style={styles.menuBtn} onClick={() => setOpen(o => !o)} aria-label="Menú">
              <Icon name={open ? 'close' : 'menu'} size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar overlay */}
      {open && (
        <div style={styles.overlay} onClick={close}>
          <aside style={styles.sidebar} onClick={e => e.stopPropagation()}>
            {/* User info */}
            <div style={styles.sidebarUser}>
              {user?.profile?.avatar_url
                ? <img src={user.profile.avatar_url} alt="avatar" style={styles.avatar} />
                : <div style={styles.avatarPlaceholder}>{user?.first_name?.[0] || '?'}</div>
              }
              <div>
                <p style={styles.sidebarName}>{user?.full_name || user?.email}</p>
                <span style={styles.roleBadge}>{isAdmin ? 'Administrador' : 'Alumno'}</span>
              </div>
            </div>

            <hr style={styles.divider} />

            {/* Links */}
            <nav>
              {links.map(l => (
                <Link key={l.to} to={l.to} style={{
                  ...styles.sidebarLink,
                  ...(isActive(l.to) ? styles.sidebarLinkActive : {})
                }} onClick={close}>
                  <Icon name={l.icon} size={20} />
                  {l.label}
                </Link>
              ))}
            </nav>

            <hr style={styles.divider} />

            <button onClick={handleLogout} style={styles.logoutBtn}>
              <Icon name="logout" size={18} />
              Cerrar sesión
            </button>
          </aside>
        </div>
      )}
    </>
  );
}

const styles = {
  header: {
    position: 'sticky', top: 0, zIndex: 100,
    background: 'white',
    borderBottom: '1px solid var(--gray-100)',
    boxShadow: 'var(--shadow-sm)',
  },
  headerInner: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    maxWidth: 1200, margin: '0 auto', padding: '0 1rem', height: 64,
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: '.5rem',
    textDecoration: 'none', color: 'var(--green-800)',
  },
  logoIcon: { fontSize: '1.5rem' },
  logoText: { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem' },
  desktopNav: {
  display: 'none',
  },
  navLink: {
    display: 'flex', alignItems: 'center', gap: '.4rem',
    padding: '.5rem .875rem', borderRadius: 'var(--radius-md)',
    textDecoration: 'none', color: 'var(--gray-600)',
    fontSize: '.9rem', fontWeight: 500,
    transition: 'background var(--transition)',
  },
  navLinkActive: { background: 'var(--green-50)', color: 'var(--green-700)', fontWeight: 700 },
  headerRight: { display: 'flex', alignItems: 'center', gap: '.5rem' },
  cartBtn: {
    position: 'relative', display: 'flex', alignItems: 'center',
    padding: '.5rem', borderRadius: 'var(--radius-md)',
    color: 'var(--gray-700)', textDecoration: 'none',
    transition: 'background var(--transition)',
  },
  badge: {
    position: 'absolute', top: 2, right: 2,
    background: 'var(--green-600)', color: 'white',
    fontSize: '.65rem', fontWeight: 700,
    width: 18, height: 18, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  menuBtn: {
    display: 'flex', alignItems: 'center', padding: '.5rem',
    borderRadius: 'var(--radius-md)', border: 'none',
    background: 'transparent', cursor: 'pointer', color: 'var(--gray-700)',
  },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)',
    zIndex: 200, display: 'flex', justifyContent: 'flex-end',
  },
  sidebar: {
    width: 300, maxWidth: '85vw',
    background: 'white', height: '100%',
    padding: '1.5rem 1rem', overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: '1rem',
    animation: 'slideIn .2s ease',
  },
  sidebarUser: { display: 'flex', alignItems: 'center', gap: '.875rem' },
  avatar: { width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' },
  avatarPlaceholder: {
    width: 48, height: 48, borderRadius: '50%',
    background: 'var(--green-100)', color: 'var(--green-800)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem',
  },
  sidebarName: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '.95rem', color: 'var(--gray-900)' },
  roleBadge: {
    fontSize: '.75rem', fontWeight: 600, padding: '.15rem .6rem',
    borderRadius: 999, background: 'var(--green-100)', color: 'var(--green-800)',
  },
  divider: { border: 'none', borderTop: '1px solid var(--gray-100)' },
  sidebarLink: {
    display: 'flex', alignItems: 'center', gap: '.75rem',
    padding: '.75rem 1rem', borderRadius: 'var(--radius-md)',
    textDecoration: 'none', color: 'var(--gray-700)',
    fontSize: '.95rem', fontWeight: 500, marginBottom: '.25rem',
    transition: 'background var(--transition)',
  },
  sidebarLinkActive: { background: 'var(--green-50)', color: 'var(--green-700)', fontWeight: 700 },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: '.75rem',
    padding: '.75rem 1rem', borderRadius: 'var(--radius-md)',
    background: 'transparent', border: 'none', cursor: 'pointer',
    color: '#dc2626', fontSize: '.95rem', fontWeight: 600,
    width: '100%', marginTop: 'auto',
  },
};

export default memo(Navbar);
