import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  me: ()              => api.get('/api/auth/me/'),
  googleLogin: (tok)  => api.post('/api/auth/google/', { id_token: tok }),
  updateProfile: (d)  => api.patch('/api/auth/profile/update/', d),
};

export const productsAPI = {
  getAll: (params)    => api.get('/api/products/', { params }),
  getOne: (id)        => api.get(`/api/products/${id}/`),
  create: (data)      => api.post('/api/products/', data),
  update: (id, data)  => api.patch(`/api/products/${id}/`, data),
  delete: (id)        => api.delete(`/api/products/${id}/`),
  updateStock: (id, s)=> api.patch(`/api/products/${id}/update_stock/`, { stock: s }),
  getCategories: ()   => api.get('/api/products/categories/'),
};

export const ordersAPI = {
  create: (data)      => api.post('/api/orders/', data),
  getAll: (params)    => api.get('/api/orders/', { params }),
  getOne: (id)        => api.get(`/api/orders/${id}/`),
  updateStatus: (id,s)=> api.patch(`/api/orders/${id}/update_status/`, { status: s }),
  getStats: ()        => api.get('/api/orders/stats/'),
};

export const paymentsAPI = {
  createIntent: (orderId) => api.post('/api/payments/create-intent/', { order_id: orderId }),
  getStatus: (orderId)    => api.get(`/api/payments/status/${orderId}/`),
};

export default api;
