import React, { memo, useCallback } from 'react';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import toast from 'react-hot-toast';

const ProductCard = memo(function ProductCard({ product }) {
  const { addItem }                    = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const favorite                       = isFavorite(product.id);

  const handleAdd = useCallback(() => {
    if (product.stock === 0) return;
    addItem(product);
    toast.success(`${product.name} añadido`, { duration: 1500 });
  }, [product, addItem]);

  const handleFavorite = useCallback((e) => {
    e.stopPropagation();
    toggleFavorite(product);
  }, [product, toggleFavorite]);

  return (
    <article style={styles.card}>
      {/* Imagen */}
      <div style={styles.imgWrapper}>
        <img
          src={product.display_image || 'https://placehold.co/400x240/e8f5e9/166534?text='}
          alt={product.name}
          style={styles.img}
          loading="lazy"
          onError={e => {
            e.target.src = 'https://placehold.co/400x240/e8f5e9/166534?text=';
          }}
        />
        {/* Botón favorito */}
        <button
          onClick={handleFavorite}
          style={{ ...styles.favBtn, ...(favorite ? styles.favBtnActive : {}) }}
          aria-label={favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24"
            fill={favorite ? 'currentColor' : 'none'}
            stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        {/* Badges */}
        {product.stock === 0 && (
          <span style={styles.outOfStock}>Agotado</span>
        )}
        {product.is_featured && product.stock > 0 && (
          <span style={styles.featured}> Destacado</span>
        )}
      </div>

      {/* Info */}
      <div style={styles.info}>
        <p style={styles.category}>{product.category_name}</p>
        <h3 style={styles.name}>{product.name}</h3>
        {product.description && (
          <p style={styles.desc}>
            {product.description.slice(0, 55)}{product.description.length > 55 ? '...' : ''}
          </p>
        )}

        {/* Alérgenos */}
        {product.allergens?.length > 0 && (
          <div style={styles.allergens}>
            {product.allergens.slice(0, 2).map(a => (
              <span key={a.id} style={styles.allergenTag}>
                {a.icon || ''} {a.name}
              </span>
            ))}
          </div>
        )}

        {/* Precio + Añadir */}
        <div style={styles.footer}>
          <span style={styles.price}>{parseFloat(product.price).toFixed(2)}€</span>
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            style={{
              ...styles.addBtn,
              ...(product.stock === 0 ? styles.addBtnDisabled : {}),
            }}
            aria-label={`Añadir ${product.name} al carrito`}
          >
            + Añadir
          </button>
        </div>
      </div>
    </article>
  );
});

const styles = {
  card: {
    background: 'white',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--gray-100)',
    display: 'flex',
    flexDirection: 'column',
  },
  imgWrapper: {
    width: '100%',
    height: 130,
    background: 'var(--green-50)',
    flexShrink: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  favBtn: {
    position: 'absolute', top: 6, right: 6,
    background: 'white', border: 'none', borderRadius: '50%',
    width: 28, height: 28, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 1px 4px rgba(0,0,0,.15)', color: 'var(--gray-400)',
    minHeight: 'unset',
  },
  favBtnActive: { color: '#ef4444' },
  outOfStock: {
    position: 'absolute', bottom: 6, left: 6,
    background: 'rgba(0,0,0,.65)', color: 'white',
    fontSize: '.65rem', fontWeight: 700, padding: '.15rem .5rem',
    borderRadius: 99,
  },
  featured: {
    position: 'absolute', bottom: 6, left: 6,
    background: 'var(--green-600)', color: 'white',
    fontSize: '.65rem', fontWeight: 700, padding: '.15rem .5rem',
    borderRadius: 99,
  },
  info: {
    padding: '.625rem',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  category: {
    fontSize: '.62rem', fontWeight: 700, color: 'var(--green-600)',
    textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '.1rem',
  },
  name: {
    fontSize: '.85rem', fontWeight: 700, color: 'var(--gray-900)',
    marginBottom: '.15rem', lineHeight: 1.25,
  },
  desc: {
    fontSize: '.72rem', color: 'var(--gray-500)',
    marginBottom: '.3rem', lineHeight: 1.35,
  },
  allergens: {
    display: 'flex', flexWrap: 'wrap', gap: '.2rem', marginBottom: '.3rem',
  },
  allergenTag: {
    fontSize: '.6rem', padding: '.1rem .4rem',
    background: '#fef3c7', color: '#92400e',
    borderRadius: 99, fontWeight: 600,
  },
  footer: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto', paddingTop: '.35rem',
  },
  price: {
    fontFamily: 'var(--font-display)', fontWeight: 800,
    fontSize: '.9rem', color: 'var(--green-700)',
  },
  addBtn: {
    padding: '.4rem .6rem',
    background: 'var(--green-600)', color: 'white',
    border: 'none', borderRadius: 8, cursor: 'pointer',
    fontSize: '.75rem', fontWeight: 700,
    fontFamily: 'var(--font-display)', whiteSpace: 'nowrap',
    minHeight: 'unset',
  },
  addBtnDisabled: {
    background: 'var(--gray-200)', color: 'var(--gray-400)',
    cursor: 'not-allowed',
  },
};

export default ProductCard;