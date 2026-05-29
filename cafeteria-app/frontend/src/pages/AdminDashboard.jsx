import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { ordersAPI, productsAPI } from '../services/api';
import { useOrders } from '../hooks/useOrders';
import toast from 'react-hot-toast';

const STATUS_LABELS = {
  pending_payment: 'Pendiente', paid: 'Pagado', preparing: 'En Preparación',
  ready: 'Listo', delivered: 'Entregado', cancelled: 'Cancelado',
};
const STATUS_COLORS = {
  pending_payment: '#f59e0b', paid: '#10b981', preparing: '#3b82f6',
  ready: '#8b5cf6', delivered: '#6b7280', cancelled: '#ef4444',
};
const PIE_COLORS = ['#22c55e','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#6b7280'];

function ProductModal({ product, categories, onSave, onClose }) {
  const isEdit = !!product?.id;
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    category: product?.category || '',
    stock: product?.stock ?? 0,
    is_available: product?.is_available ?? true,
    is_featured: product?.is_featured ?? false,
    image_url: product?.display_image || '',
    calories: product?.calories || '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) {
      toast.error('Nombre, precio y categoría son obligatorios');
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await productsAPI.update(product.id, { ...form, allergen_ids: [] });
        toast.success('Producto actualizado');
      } else {
        await productsAPI.create({ ...form, allergen_ids: [] });
        toast.success('Producto creado');
      }
      onSave();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <div style={modalStyles.header}>
          <h2 style={{ color: 'var(--green-800)', fontSize: '1.25rem' }}>
            {isEdit ? ' Editar Producto' : ' Nuevo Producto'}
          </h2>
          <button onClick={onClose} style={modalStyles.closeBtn}></button>
        </div>

        <form onSubmit={handleSubmit} style={modalStyles.form}>
          <div style={modalStyles.grid2}>
            <div>
              <label style={modalStyles.label}>Nombre *</label>
              <input name="name" value={form.name} onChange={handleChange}
                style={modalStyles.input} placeholder="Ej: Café con Leche" required />
            </div>
            <div>
              <label style={modalStyles.label}>Precio (€) *</label>
              <input name="price" type="number" step="0.01" min="0"
                value={form.price} onChange={handleChange}
                style={modalStyles.input} placeholder="1.50" required />
            </div>
          </div>

          <div>
            <label style={modalStyles.label}>Descripción</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              style={{ ...modalStyles.input, resize: 'vertical', minHeight: 70 }}
              placeholder="Descripción del producto..." />
          </div>

          <div style={modalStyles.grid2}>
            <div>
              <label style={modalStyles.label}>Categoría *</label>
              <select name="category" value={form.category} onChange={handleChange}
                style={modalStyles.input} required>
                <option value="">Seleccionar...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={modalStyles.label}>Stock</label>
              <input name="stock" type="number" min="0"
                value={form.stock} onChange={handleChange} style={modalStyles.input} />
            </div>
          </div>

          <div style={modalStyles.grid2}>
            <div>
              <label style={modalStyles.label}>Calorías</label>
              <input name="calories" type="number" min="0"
                value={form.calories} onChange={handleChange}
                style={modalStyles.input} placeholder="250" />
            </div>
            <div>
              <label style={modalStyles.label}>URL de imagen</label>
              <input name="image_url" value={form.image_url} onChange={handleChange}
                style={modalStyles.input} placeholder="https://..." />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <label style={modalStyles.checkbox}>
              <input type="checkbox" name="is_available"
                checked={form.is_available} onChange={handleChange} />
              Disponible
            </label>
            <label style={modalStyles.checkbox}>
              <input type="checkbox" name="is_featured"
                checked={form.is_featured} onChange={handleChange} />
              Destacado
            </label>
          </div>

          <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button type="button" onClick={onClose}
              style={{ ...modalStyles.btn, background: 'white', border: '2px solid var(--gray-200)', color: 'var(--gray-700)' }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              style={{ ...modalStyles.btn, background: 'var(--green-600)', color: 'white' }}>
              {saving ? ' Guardando...' : isEdit ? ' Actualizar' : ' Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const modalStyles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
    zIndex: 500, display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '1rem',
  },
  modal: {
    background: 'white', borderRadius: 20, width: '100%',
    maxWidth: 600, maxHeight: '90vh', overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,.2)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1.5rem 1.5rem 0',
  },
  closeBtn: {
    background: 'var(--gray-100)', border: 'none', borderRadius: 8,
    width: 32, height: 32, cursor: 'pointer', fontSize: '1rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  form: { padding: '1.25rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  label: { display: 'block', fontSize: '.8rem', fontWeight: 700, color: 'var(--gray-600)', marginBottom: '.375rem', textTransform: 'uppercase', letterSpacing: '.04em' },
  input: {
    width: '100%', padding: '.7rem .875rem', border: '2px solid var(--gray-200)',
    borderRadius: 10, fontSize: '.9rem', fontFamily: 'var(--font-body)',
    background: 'white', color: 'var(--gray-900)',
  },
  checkbox: { display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer', fontWeight: 600, color: 'var(--gray-700)', fontSize: '.9rem' },
  btn: { padding: '.75rem 1.5rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '.95rem', fontFamily: 'var(--font-display)' },
};

export default function AdminDashboard() {
  const [tab, setTab]             = useState('dashboard');
  const [stats, setStats]         = useState(null);
  const [statsLoading, setSL]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const { orders, loading: ordersLoading, updateStatus } = useOrders();

  useEffect(() => {
    ordersAPI.getStats()
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setSL(false));
  }, []);

  const pieData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.orders_by_status)
      .filter(([, v]) => v > 0)
      .map(([s, count]) => ({ name: STATUS_LABELS[s], value: count }));
  }, [stats]);

  const tabs = [
    { id: 'dashboard', label: ' Dashboard' },
    { id: 'orders',    label: ' Pedidos'   },
    { id: 'products',  label: ' Productos'  },
  ];

  return (
    <>
      <Navbar />
      <main style={styles.page}>
        <div style={styles.container}>
          <h1 style={styles.title}>Panel de Administración ‍</h1>

          <div style={styles.tabs}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ ...styles.tab, ...(tab === t.id ? styles.tabActive : {}) }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Dashboard */}
          {tab === 'dashboard' && (
            statsLoading ? <LoadingSpinner /> : stats ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={styles.kpiGrid}>
                  {[
                    { label: 'Ingresos Totales',  value: `${parseFloat(stats.total_revenue || 0).toFixed(2)}€`,   icon: '', color: 'var(--green-600)' },
                    { label: 'Ingresos del Mes',   value: `${parseFloat(stats.monthly_revenue || 0).toFixed(2)}€`, icon: '', color: '#3b82f6' },
                    { label: 'Total Pedidos',       value: stats.total_orders || 0,                               icon: '', color: '#8b5cf6' },
                    { label: 'Entregados',          value: stats.orders_by_status?.delivered || 0,                icon: '', color: '#10b981' },
                  ].map(k => (
                    <div key={k.label} style={{ ...styles.kpiCard, borderTop: `4px solid ${k.color}` }}>
                      <span style={{ fontSize: '2rem' }}>{k.icon}</span>
                      <div>
                        <p style={{ fontSize: '.78rem', color: 'var(--gray-500)', fontWeight: 600, marginBottom: '.15rem' }}>{k.label}</p>
                        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.35rem', color: k.color }}>{k.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={styles.chartCard}>
                  <h3 style={styles.chartTitle}>Ingresos últimos 7 días</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={stats.daily_data || []}>
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}€`} />
                      <Tooltip formatter={v => [`${parseFloat(v).toFixed(2)}€`, 'Ingresos']} />
                      <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={3}
                        dot={{ fill: '#16a34a', r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div style={styles.chartGrid}>
                  <div style={styles.chartCard}>
                    <h3 style={styles.chartTitle}>Pedidos por estado</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                          paddingAngle={3} dataKey="value">
                          {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend iconSize={10} wrapperStyle={{ fontSize: '.8rem' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={styles.chartCard}>
                    <h3 style={styles.chartTitle}>Ingresos diarios</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={(stats.daily_data || []).slice(-5)}>
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}€`} />
                        <Tooltip formatter={v => [`${parseFloat(v).toFixed(2)}€`]} />
                        <Bar dataKey="revenue" fill="#4ade80" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ) : <p style={{ color: 'var(--gray-400)' }}>No hay datos disponibles</p>
          )}

          {/* Pedidos */}
          {tab === 'orders' && (
            ordersLoading ? <LoadingSpinner /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {orders.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>
                    <span style={{ fontSize: '3rem', display: 'block', marginBottom: '.5rem' }}></span>
                    No hay pedidos todavía
                  </div>
                )}
                {orders.map(order => (
                  <div key={order.id} style={{
                    background: 'white', borderRadius: 16, padding: '1.25rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,.06)',
                    borderLeft: `4px solid ${STATUS_COLORS[order.status] || '#ccc'}`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.75rem', marginBottom: '.75rem' }}>
                      <div>
                        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--gray-900)' }}>
                          #{String(order.id).slice(0,8).toUpperCase()}
                        </p>
                        <p style={{ fontSize: '.8rem', color: 'var(--gray-500)', marginTop: '.15rem' }}>
                          {order.user_name} · {new Date(order.created_at).toLocaleString('es-ES', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--green-700)' }}>
                          {parseFloat(order.total_amount).toFixed(2)}€
                        </p>
                        <span style={{
                          padding: '.2rem .7rem', borderRadius: 999, fontSize: '.75rem', fontWeight: 700,
                          background: (STATUS_COLORS[order.status] || '#ccc') + '20',
                          color: STATUS_COLORS[order.status] || '#ccc',
                        }}>
                          {STATUS_LABELS[order.status]}
                        </span>
                      </div>
                    </div>

                    <p style={{ fontSize: '.8rem', color: 'var(--gray-500)', marginBottom: '.875rem' }}>
                      {order.items?.map(i => `${i.quantity}× ${i.product_name}`).join(' · ')}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.375rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--gray-500)' }}>Estado:</span>
                      {['preparing','ready','delivered','cancelled'].map(s => (
                        <button key={s} onClick={() => { updateStatus(order.id, s); toast.success(`Estado: ${STATUS_LABELS[s]}`); }}
                          disabled={order.status === s}
                          style={{
                            padding: '.3rem .75rem', borderRadius: 999, border: 'none',
                            cursor: order.status === s ? 'default' : 'pointer',
                            background: order.status === s ? STATUS_COLORS[s] : STATUS_COLORS[s] + '20',
                            color: order.status === s ? 'white' : STATUS_COLORS[s],
                            fontSize: '.75rem', fontWeight: 700,
                          }}>
                          {STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Productos */}
          {tab === 'products' && (
            <ProductsManager
              onEdit={(p) => { setEditProduct(p); setShowModal(true); }}
              onNew={() => { setEditProduct(null); setShowModal(true); }}
            />
          )}
        </div>
      </main>

      {showModal && (
        <ProductModalWrapper
          product={editProduct}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

function ProductModalWrapper({ product, onClose }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const reload = useCallback(() => {
    productsAPI.getAll().then(({ data }) => setProducts(data.results || data));
  }, []);

  useEffect(() => {
    productsAPI.getCategories().then(({ data }) => setCategories(data.results || data));
  }, []);

  return (
    <ProductModal
      product={product}
      categories={categories}
      onSave={reload}
      onClose={onClose}
    />
  );
}

function ProductsManager({ onEdit, onNew }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [editStock, setEditStock] = useState({});

  const fetchProducts = useCallback(() => {
    setLoading(true);
    productsAPI.getAll()
      .then(({ data }) => setProducts(data.results || data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleStockUpdate = useCallback(async (id) => {
    const val = editStock[id];
    if (val === undefined) return;
    try {
      await productsAPI.updateStock(id, val);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: parseInt(val) } : p));
      toast.success('Stock actualizado ');
    } catch { toast.error('Error al actualizar stock'); }
  }, [editStock]);

  const handleDelete = useCallback(async (id, name) => {
    if (!window.confirm(`¿Eliminar "${name}"?`)) return;
    try {
      await productsAPI.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Producto eliminado');
    } catch { toast.error('Error al eliminar'); }
  }, []);

  const handleToggleAvailable = useCallback(async (product) => {
    try {
      await productsAPI.update(product.id, { is_available: !product.is_available, allergen_ids: [] });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_available: !p.is_available } : p));
      toast.success('Disponibilidad actualizada');
    } catch { toast.error('Error'); }
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ color: 'var(--gray-900)', fontFamily: 'var(--font-display)' }}>
          Inventario ({products.length})
        </h2>
        <button onClick={onNew} style={{
          padding: '.75rem 1.5rem', borderRadius: 12, border: 'none',
          background: 'var(--green-600)', color: 'white',
          fontFamily: 'var(--font-display)', fontWeight: 700,
          cursor: 'pointer', fontSize: '.9rem',
          boxShadow: '0 4px 12px rgba(22,163,74,.3)',
        }}>
           Nuevo Producto
        </button>
      </div>

      {/* Mobile: cards / Desktop: tabla */}
      <div style={{ display: 'none' }} className="desktop-table">
        <div style={{ overflowX: 'auto' }}>
          <table style={tStyles.table}>
            <thead>
              <tr style={{ background: 'var(--green-50)' }}>
                {['Producto','Categoría','Precio','Stock','Disponible','Acciones'].map(h => (
                  <th key={h} style={tStyles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => <ProductRow key={p.id} product={p}
                editStock={editStock} setEditStock={setEditStock}
                onStockUpdate={handleStockUpdate} onDelete={handleDelete}
                onEdit={onEdit} onToggle={handleToggleAvailable} />)}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards para todos los tamaños */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.875rem' }}>
        {products.map(p => (
          <div key={p.id} style={pStyles.card}>
            <div style={pStyles.cardTop}>
              {/* Imagen */}
              <div style={pStyles.imgBox}>
                {p.display_image
                  ? <img src={p.display_image} alt={p.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.target.style.display='none'; }} />
                  : <span style={{ fontSize: '1.5rem' }}></span>
                }
              </div>
              <div style={{ flex: 1 }}>
                <p style={pStyles.name}>{p.name}</p>
                <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginTop: '.25rem' }}>
                  <span style={pStyles.catBadge}>{p.category_name}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--green-700)', fontSize: '.95rem' }}>
                    {parseFloat(p.price).toFixed(2)}€
                  </span>
                </div>
              </div>
              {/* Toggle disponible */}
              <button onClick={() => handleToggleAvailable(p)} style={{
                padding: '.35rem .8rem', borderRadius: 999, border: 'none',
                background: p.is_available ? '#dcfce7' : '#fee2e2',
                color: p.is_available ? '#166534' : '#991b1b',
                fontWeight: 700, fontSize: '.75rem', cursor: 'pointer',
              }}>
                {p.is_available ? ' Activo' : ' Inactivo'}
              </button>
            </div>

            <div style={pStyles.cardBottom}>
              {/* Stock */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                <span style={pStyles.stockLabel}>Stock:</span>
                <input type="number" min="0"
                  value={editStock[p.id] ?? p.stock}
                  onChange={e => setEditStock(prev => ({ ...prev, [p.id]: e.target.value }))}
                  style={pStyles.stockInput} />
                <button onClick={() => handleStockUpdate(p.id)} style={pStyles.stockSaveBtn}></button>
              </div>
              {/* Acciones */}
              <div style={{ display: 'flex', gap: '.5rem' }}>
                <button onClick={() => onEdit(p)} style={pStyles.editBtn}> Editar</button>
                <button onClick={() => handleDelete(p.id, p.name)} style={pStyles.deleteBtn}> Eliminar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductRow({ product: p, editStock, setEditStock, onStockUpdate, onDelete, onEdit, onToggle }) {
  return (
    <tr style={{ borderBottom: '1px solid var(--gray-100)' }}>
      <td style={tStyles.td}><span style={{ fontWeight: 700 }}>{p.name}</span></td>
      <td style={tStyles.td}><span style={tStyles.badge}>{p.category_name}</span></td>
      <td style={{ ...tStyles.td, fontWeight: 800, color: 'var(--green-700)' }}>{parseFloat(p.price).toFixed(2)}€</td>
      <td style={tStyles.td}>
        <div style={{ display: 'flex', gap: '.4rem', alignItems: 'center' }}>
          <input type="number" min="0" value={editStock[p.id] ?? p.stock}
            onChange={e => setEditStock(prev => ({ ...prev, [p.id]: e.target.value }))}
            style={{ width: 65, padding: '.35rem .5rem', border: '2px solid var(--gray-200)', borderRadius: 8, fontWeight: 700 }} />
          <button onClick={() => onStockUpdate(p.id)}
            style={{ padding: '.35rem .6rem', background: 'var(--green-600)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}></button>
        </div>
      </td>
      <td style={tStyles.td}>
        <button onClick={() => onToggle(p)}
          style={{ padding: '.25rem .7rem', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: p.is_available ? '#dcfce7' : '#fee2e2',
            color: p.is_available ? '#166534' : '#991b1b', fontWeight: 700, fontSize: '.75rem' }}>
          {p.is_available ? 'Sí' : 'No'}
        </button>
      </td>
      <td style={tStyles.td}>
        <div style={{ display: 'flex', gap: '.4rem' }}>
          <button onClick={() => onEdit(p)}
            style={{ padding: '.35rem .7rem', background: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '.8rem' }}>
             Editar
          </button>
          <button onClick={() => onDelete(p.id, p.name)}
            style={{ padding: '.35rem .7rem', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '.8rem' }}>

          </button>
        </div>
      </td>
    </tr>
  );
}

const styles = {
  page: { padding: '1.5rem 0', minHeight: 'calc(100dvh - 64px)', background: 'var(--green-50)' },
  container: { width: '100%', maxWidth: 1200, margin: '0 auto', padding: '0 1rem' },
  title: { color: 'var(--green-800)', marginBottom: '1.25rem', fontSize: 'clamp(1.4rem, 4vw, 2.25rem)' },
  tabs: { display: 'flex', gap: '.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  tab: { padding: '.6rem 1.2rem', borderRadius: 999, border: '2px solid var(--gray-200)', background: 'white', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '.875rem', color: 'var(--gray-600)', whiteSpace: 'nowrap' },
  tabActive: { background: 'var(--green-600)', color: 'white', borderColor: 'var(--green-600)' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' },
  kpiCard: { background: 'white', borderRadius: 16, padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,.06)' },
  chartCard: { background: 'white', borderRadius: 16, padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,.06)' },
  chartTitle: { marginBottom: '1rem', color: 'var(--gray-900)', fontSize: '1rem', fontFamily: 'var(--font-display)' },
  chartGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' },
};

const tStyles = {
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '.875rem' },
  th: { padding: '.75rem 1rem', textAlign: 'left', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--green-800)', fontSize: '.78rem', textTransform: 'uppercase', letterSpacing: '.05em' },
  td: { padding: '.75rem 1rem', verticalAlign: 'middle' },
  badge: { padding: '.2rem .65rem', borderRadius: 999, background: 'var(--green-100)', color: 'var(--green-800)', fontSize: '.75rem', fontWeight: 700 },
};

const pStyles = {
  card: { background: 'white', borderRadius: 16, padding: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,.06)', display: 'flex', flexDirection: 'column', gap: '.875rem' },
  cardTop: { display: 'flex', alignItems: 'center', gap: '.875rem' },
  imgBox: { width: 52, height: 52, borderRadius: 10, background: 'var(--green-50)', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--gray-900)', fontSize: '.95rem' },
  catBadge: { padding: '.15rem .6rem', borderRadius: 999, background: 'var(--green-100)', color: 'var(--green-800)', fontSize: '.75rem', fontWeight: 700 },
  cardBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.75rem', paddingTop: '.75rem', borderTop: '1px solid var(--gray-100)' },
  stockLabel: { fontSize: '.8rem', fontWeight: 600, color: 'var(--gray-500)' },
  stockInput: { width: 70, padding: '.35rem .5rem', border: '2px solid var(--gray-200)', borderRadius: 8, fontWeight: 700, fontSize: '.9rem' },
  stockSaveBtn: { padding: '.35rem .65rem', background: 'var(--green-600)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 },
  editBtn: { padding: '.4rem .875rem', background: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '.8rem' },
  deleteBtn: { padding: '.4rem .875rem', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '.8rem' },
};