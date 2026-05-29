import React, { memo } from 'react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import { useFavorites } from '../context/FavoritesContext';

export default memo(function Favorites() {
  const { favorites } = useFavorites();

  return (
    <>
      <Navbar />
      <main style={{ padding: '1.5rem 0' }}>
        <div className="container">
          <h1 style={{ color: 'var(--green-800)', marginBottom: '1.5rem' }}>
            Mis Favoritos  <span style={{ fontSize: '1rem', color: 'var(--gray-400)', fontWeight: 400 }}>({favorites.length})</span>
          </h1>

          {favorites.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '1rem' }}></span>
              <p style={{ color: 'var(--gray-500)' }}>
                Aún no tienes favoritos.<br />
                Toca el corazón en cualquier producto para guardarlo aquí.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
              {favorites.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </main>
    </>
  );
});
