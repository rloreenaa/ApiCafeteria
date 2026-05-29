import React, { useState, memo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { useOrders } from '../hooks/useOrders';

const STATUS_INFO = {
  pending_payment: { label: 'Pendiente de Pago', color: '#f59e0b', icon: '' },
  paid:            { label: 'Pagado',             color: '#10b981', icon: '' },
  preparing:       { label: 'En Preparación',     color: '#3b82f6', icon: '‍' },
  ready:           { label: 'Listo para Recoger', color: '#8b5cf6', icon: '' },
  delivered:       { label: 'Entregado',           color: '#6b7280', icon: '' },
  cancelled:       { label: 'Cancelado',           color: '#ef4444', icon: '' },
};

function OrderQR({ order }) {
  const [open, setOpen] = useState(false);
  const qrData = `CAFETERIA-ORDER\nID: ${order.id}\nTOTAL: ${parseFloat(order.total_amount).toFixed(2)}€\nESTADO: PAGADO`;

  return (
    <div style={{ marginTop: '.875rem' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: '.5rem',
        padding: '.5rem 1rem', borderRadius: 10,
        border: '2px solid var(--green-200)', background: open ? 'var(--green-50)' : 'white',
        color: 'var(--green-700)', fontWeight: 700, fontSize: '.85rem', cursor: 'pointer',
      }}>
         {open ? 'Ocultar QR' : 'Ver QR del pedido'}
      </button>

      {open && (
        <div style={{
          marginTop: '1rem', display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '.875rem',
          padding: '1.25rem', background: 'var(--green-50)',
          borderRadius: 16, border: '2px solid var(--green-100)',
          animation: 'fadeIn .2s ease',
        }}>
          <div style={{
            padding: '1rem', background: 'white', borderRadius: 12,
            border: '3px solid var(--green-200)',
            boxShadow: '0 4px 12px rgba(22,163,74,.15)',
          }}>
            <QRCodeSVG value={qrData} size={160} fgColor="#166534" bgColor="#ffffff" level="H" includeMargin />
          </div>
          <p style={{ fontSize: '.8rem', color: 'var(--green-800)', fontWeight: 600, textAlign: 'center' }}>
            Muestra este QR al recoger tu pedido
          </p>
        </div>
      )}
    </div>
  );
}

export default memo(function OrderHistory() {
  const { orders, loading, error } = useOrders();

  return (
    <>
      <Navbar />
      <main style={{ padding: '1.5rem 0', minHeight: 'calc(100dvh - 64px)', background: 'var(--green-50)' }}>
        <div style={{ width: '100%', maxWidth: 800, margin: '0 auto', padding: '0 1rem' }}>
          <h1 style={{ color: 'var(--green-800)', marginBottom: '1.5rem', fontSize: 'clamp(1.4rem, 4vw, 2rem)' }}>
            Mis Pedidos
          </h1>

          {loading && <LoadingSpinner />}
          {error && <p style={{ color: '#dc2626' }}> {error}</p>}

          {!loading && orders.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '1rem' }}></span>
              <p style={{ color: 'var(--gray-500)' }}>Aún no tienes pedidos</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map(order => {
              const s = STATUS_INFO[order.status] || {};
              const isPaid = true;
              return (
                <div key={order.id} style={{
                  background: 'white', borderRadius: 16, padding: '1.25rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,.06)',
                  borderLeft: `4px solid ${s.color || '#ccc'}`,
                  animation: 'fadeIn .3s ease',
                }}>
                  {/* Cabecera */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.75rem' }}>
                    <div>
                      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: 'var(--gray-900)' }}>
                        {s.icon} Pedido #{String(order.id).slice(0,8).toUpperCase()}
                      </p>
                      <p style={{ fontSize: '.8rem', color: 'var(--gray-500)', marginTop: '.2rem' }}>
                        {new Date(order.created_at).toLocaleString('es-ES', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                        {order.pickup_time && ` · Recogida: ${order.pickup_time}`}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--green-700)' }}>
                        {parseFloat(order.total_amount).toFixed(2)}€
                      </p>
                      <span style={{
                        padding: '.2rem .7rem', borderRadius: 999,
                        fontSize: '.75rem', fontWeight: 700,
                        background: (s.color || '#ccc') + '20',
                        color: s.color || '#ccc',
                      }}>
                        {s.label}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ marginTop: '.875rem', display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
                    {order.items?.map(i => (
                      <span key={i.id} style={{
                        padding: '.25rem .7rem', borderRadius: 999,
                        background: 'var(--green-50)', color: 'var(--green-800)',
                        fontSize: '.8rem', fontWeight: 600,
                      }}>
                        {i.quantity}× {i.product_name}
                      </span>
                    ))}
                  </div>

                  {/* QR — solo si el pedido está pagado */}
                  {isPaid && <OrderQR order={order} />}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
});