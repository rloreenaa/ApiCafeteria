import React, { useState, useMemo, useCallback, memo } from 'react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useProducts } from '../hooks/useProducts';

export default memo(function Catalog() {
  const [activeCategory, setActiveCategory] = useState('');
  const [search, setSearch] = useState('');

  const { products, loading, error } = useProducts(
    activeCategory && activeCategory !== 'alergenos'
      ? { available: true, category: activeCategory }
      : { available: true }
  );

  const filtered = useMemo(() => {
    let result = products;
    if (activeCategory === 'alergenos') {
      result = result.filter(p => !p.allergens || p.allergens.length === 0);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, search, activeCategory]);

  const handleCategory = useCallback((slug) => {
    setActiveCategory(prev => prev === slug ? '' : slug);
    setSearch('');
  }, []);

  const categories = [
    { slug: 'bebidas',    name: 'Bebidas',       icon: '' },
    { slug: 'bocadillos', name: 'Bocadillos',    icon: '' },
    { slug: 'saludable',  name: 'Saludable',     icon: '' },
    { slug: 'alergenos',  name: 'Sin Alérgenos', icon: '' },
  ];

  return (
    <>
      <Navbar />
      <main style={styles.page}>
        <div className="container">
          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>Menú de hoy </h1>
              <p style={{ color: 'var(--gray-500)' }}>{filtered.length} productos disponibles</p>
            </div>
            <input
              type="search"
              placeholder="Buscar producto..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input"
              style={styles.searchInput}
              aria-label="Buscar producto"
            />
          </div>

          <div style={styles.filters} role="group" aria-label="Filtrar por categoría">
            <button
              onClick={() => { setActiveCategory(''); setSearch(''); }}
              style={{ ...styles.filterBtn, ...(activeCategory === '' ? styles.filterActive : {}) }}
            >
              Todos
            </button>
            {categories.map(cat => (
              <button
                key={cat.slug}
                onClick={() => handleCategory(cat.slug)}
                style={{ ...styles.filterBtn, ...(activeCategory === cat.slug ? styles.filterActive : {}) }}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div style={styles.error}> {error}</div>
          ) : filtered.length === 0 ? (
            <div style={styles.empty}>
              <span style={{ fontSize: '3rem' }}></span>
              <p>No se encontraron productos</p>
            </div>
          ) : (
            <div className="products-grid">
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </main>
    </>
  );
});

const styles = {
  page: { padding: '1.5rem 0', minHeight: 'calc(100dvh - 64px)' },
  header: { display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' },
  title: { color: 'var(--green-800)' },
  searchInput: { maxWidth: '100%' },
  filters: { display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginBottom: '1.5rem' },
  filterBtn: {
    padding: '.5rem 1rem', borderRadius: 999, border: '2px solid var(--green-200)',
    background: 'white', cursor: 'pointer',
    fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '.85rem',
    color: 'var(--gray-600)', transition: 'all .2s', whiteSpace: 'nowrap',
  },
  filterActive: { background: 'var(--green-600)', color: 'white', borderColor: 'var(--green-600)' },
  error: { textAlign: 'center', padding: '2rem', color: '#dc2626' },
  empty: {
    textAlign: 'center', padding: '3rem', color: 'var(--gray-400)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.5rem',
  },
};