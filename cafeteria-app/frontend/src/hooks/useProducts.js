import { useState, useEffect, useCallback } from 'react';
import { productsAPI } from '../services/api';

export function useProducts(filters = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const filtersKey = JSON.stringify(filters);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await productsAPI.getAll(JSON.parse(filtersKey));
      setProducts(data.results || data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, [filtersKey]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}