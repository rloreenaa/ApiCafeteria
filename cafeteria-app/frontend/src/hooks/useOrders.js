import { useState, useEffect, useCallback } from 'react';
import { ordersAPI } from '../services/api';

export function useOrders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await ordersAPI.getAll();
      setOrders(data.results || data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = useCallback(async (orderId, status) => {
    await ordersAPI.updateStatus(orderId, status);
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, error, refetch: fetchOrders, updateStatus };
}
