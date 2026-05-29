import React, { useState, useCallback, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import QRModal from '../components/QRModal';
import { useCart } from '../context/CartContext';
import { ordersAPI, paymentsAPI } from '../services/api';
import api from '../services/api';
import toast from 'react-hot-toast';

function CheckoutForm({ orderId, totalAmount, onSuccess, onCancel }) {
  const stripe   = useStripe();
  const elements = useElements();
  const [paying, setPaying]     = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);
    setStatusMsg(' Verificando datos de pago...');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        toast.error(error.message);
        setPaying(false);
        setStatusMsg('');
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        setStatusMsg(' Pago aceptado. Confirmando pedido...');
        try {
          const { data } = await api.post(`/api/payments/confirm-local/`, {
            order_id: orderId,
            payment_intent_id: paymentIntent.id,
          });
          setStatusMsg(' ¡Pedido confirmado!');
          setTimeout(() => onSuccess(data), 600);
        } catch {
          setStatusMsg(' Finalizando pedido...');
          let attempts = 0;
          const poll = setInterval(async () => {
            attempts++;
            try {
              const { data } = await paymentsAPI.getStatus(orderId);
              if (data.status === 'paid') {
                clearInterval(poll);
                setStatusMsg(' ¡Pedido confirmado!');
                setTimeout(() => onSuccess(data), 600);
              }
            } catch {}
            if (attempts > 10) {
              clearInterval(poll);
              onSuccess({ id: orderId, total_amount: totalAmount, status: 'paid', items: [] });
            }
          }, 1500);
        }
      }
    } catch (err) {
      toast.error('Error al procesar el pago');
      setPaying(false);
      setStatusMsg('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PaymentElement />

      {/* Mensaje de estado */}
      {statusMsg && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '.75rem',
          padding: '1rem', borderRadius: 12,
          background: 'var(--green-50)', border: '2px solid var(--green-200)',
        }}>
          {paying && (
            <div style={{
              width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
              border: '3px solid var(--green-200)',
              borderTopColor: 'var(--green-600)',
              animation: 'spin .8s linear infinite',
            }} />
          )}
          <span style={{ color: 'var(--green-800)', fontWeight: 600, fontSize: '.9rem' }}>
            {statusMsg}
          </span>
        </div>
      )}

      <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
        <button type="button" onClick={onCancel} disabled={paying}
          style={{ flex: 1, minWidth: 120, padding: '.875rem', borderRadius: 12,
            border: '2px solid var(--green-600)', background: 'white',
            color: 'var(--green-700)', fontWeight: 700, cursor: paying ? 'not-allowed' : 'pointer',
            fontSize: '.95rem', opacity: paying ? .5 : 1 }}>
          Cancelar
        </button>
        <button type="submit" disabled={paying}
          style={{ flex: 2, minWidth: 180, padding: '.875rem', borderRadius: 12,
            border: 'none', background: paying ? 'var(--green-700)' : 'var(--green-600)',
            color: 'white', fontWeight: 700, cursor: paying ? 'not-allowed' : 'pointer',
            fontSize: '.95rem', fontFamily: 'var(--font-display)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem' }}>
          {paying ? (
            <>
              <div style={{
                width: 16, height: 16, borderRadius: '50%',
                border: '2px solid rgba(255,255,255,.3)',
                borderTopColor: 'white',
                animation: 'spin .8s linear infinite',
              }} />
              Procesando...
            </>
          ) : ` Pagar ${parseFloat(totalAmount).toFixed(2)}€`}
        </button>
      </div>
    </form>
  );
}

export default function Cart() {
  const { items, removeItem, updateQty, clearCart, totalPrice } = useCart();
  const navigate = useNavigate();
  const [pickupTime, setPickupTime]       = useState('');
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret]   = useState('');
  const [currentOrder, setCurrentOrder]   = useState(null);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [step, setStep] = useState('cart');
  const [loading, setLoading] = useState(false);

  const handleCheckout = useCallback(async () => {
    if (items.length === 0) { toast.error('El carrito está vacío'); return; }
    setLoading(true);
    try {
      const { data: order } = await ordersAPI.create({
        items: items.map(i => ({ product_id: i.id, quantity: i.quantity })),
        pickup_time: pickupTime || null,
      });
      setCurrentOrder(order);

      const { data: paymentData } = await paymentsAPI.createIntent(order.id);
      const stripe = await loadStripe(paymentData.publishable_key);
      setStripePromise(stripe);
      setClientSecret(paymentData.client_secret);
      setStep('payment');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al iniciar el pago');
    } finally {
      setLoading(false);
    }
  }, [items, pickupTime]);

  const handleSuccess = useCallback((order) => {
    setConfirmedOrder(order);
    clearCart();
    setStep('success');
  }, [clearCart]);

  const stripeOptions = clientSecret ? {
    clientSecret,
    appearance: { theme: 'stripe', variables: { colorPrimary: '#16a34a', borderRadius: '8px' } }
  } : null;

  if (items.length === 0 && step === 'cart') {
    return (
      <>
        <Navbar />
        <main style={styles.page}>
          <div style={styles.emptyState}>
            <span style={{ fontSize: '4rem' }}></span>
            <h2 style={{ color: 'var(--gray-700)', marginTop: '.75rem' }}>Tu carrito está vacío</h2>
            <p style={{ color: 'var(--gray-400)', marginBottom: '1.5rem' }}>Añade productos desde el catálogo</p>
            <button onClick={() => navigate('/catalog')} style={styles.backBtn}>
              Ver catálogo
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main style={styles.page}>
        <div style={styles.container}>
          <h1 style={styles.title}>Mi Carrito </h1>

          {step === 'cart' && (
            <div style={styles.layout}>
              {/* Lista de items */}
              <section style={styles.itemsList}>
                {items.map(item => (
                  <div key={item.id} style={styles.itemCard}>
                    <div style={styles.itemImg}>
                      {item.display_image
                        ? <img src={item.display_image} alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => { e.target.style.display='none'; }} />
                        : <span style={{ fontSize: '1.5rem' }}></span>
                      }
                    </div>
                    <div style={styles.itemInfo}>
                      <p style={styles.itemName}>{item.name}</p>
                      <p style={styles.itemPrice}>{parseFloat(item.price).toFixed(2)}€ c/u</p>
                    </div>
                    <div style={styles.itemControls}>
                      <button onClick={() => updateQty(item.id, item.quantity - 1)} style={styles.qtyBtn}>−</button>
                      <span style={styles.qty}>{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, item.quantity + 1)} style={styles.qtyBtn}>+</button>
                    </div>
                    <div style={styles.itemRight}>
                      <span style={styles.subtotal}>{(item.price * item.quantity).toFixed(2)}€</span>
                      <button onClick={() => removeItem(item.id)} style={styles.removeBtn}></button>
                    </div>
                  </div>
                ))}
              </section>

              {/* Resumen */}
              <aside style={styles.summary}>
                <h2 style={styles.summaryTitle}>Resumen del pedido</h2>

                {items.map(i => (
                  <div key={i.id} style={styles.summaryRow}>
                    <span style={{ color: 'var(--gray-600)', fontSize: '.875rem' }}>{i.quantity}× {i.name}</span>
                    <span style={{ fontWeight: 600, fontSize: '.875rem' }}>{(i.price * i.quantity).toFixed(2)}€</span>
                  </div>
                ))}

                <div style={styles.divider} />

                <div style={{ marginBottom: '1rem' }}>
                  <label style={styles.label} htmlFor="pickup">⏰ Hora de recogida</label>
                  <input id="pickup" type="time" value={pickupTime}
                    onChange={e => setPickupTime(e.target.value)}
                    style={styles.input} />
                </div>

                <div style={styles.totalRow}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>Total</span>
                  <strong style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--green-700)' }}>
                    {totalPrice.toFixed(2)}€
                  </strong>
                </div>

                <button onClick={handleCheckout} disabled={loading}
                  style={{ ...styles.checkoutBtn, opacity: loading ? .7 : 1 }}>
                  {loading ? ' Preparando pago...' : ' Pagar con tarjeta'}
                </button>
                <p style={styles.secureNote}> Pago seguro con Stripe</p>
              </aside>
            </div>
          )}

          {/* Formulario Stripe */}
          {step === 'payment' && clientSecret && stripeOptions && (
            <div style={styles.paymentWrapper}>
              <h2 style={{ color: 'var(--green-800)', marginBottom: '.5rem' }}> Pago seguro</h2>
              <p style={{ color: 'var(--gray-500)', fontSize: '.875rem', marginBottom: '1.5rem' }}>
                Total a pagar: <strong style={{ color: 'var(--green-700)' }}>{totalPrice.toFixed(2)}€</strong>
              </p>
              <Elements stripe={stripePromise} options={stripeOptions}>
                <CheckoutForm
                  orderId={currentOrder?.id}
                  totalAmount={totalPrice}
                  onSuccess={handleSuccess}
                  onCancel={() => setStep('cart')}
                />
              </Elements>
              <p style={styles.secureNote}>
                 Tarjeta de prueba: <strong>4242 4242 4242 4242</strong> · Fecha: 12/28 · CVC: 123
              </p>
            </div>
          )}
        </div>
      </main>

      {step === 'success' && confirmedOrder && (
        <QRModal order={confirmedOrder} onClose={() => { setStep('cart'); navigate('/orders'); }} />
      )}
    </>
  );
}

const styles = {
  page: { padding: '1.5rem 0', minHeight: 'calc(100dvh - 64px)', background: 'var(--green-50)' },
  container: { width: '100%', maxWidth: 1100, margin: '0 auto', padding: '0 1rem' },
  title: { color: 'var(--green-800)', marginBottom: '1.5rem', fontSize: 'clamp(1.5rem, 4vw, 2.25rem)' },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1.5rem',
    '@media(min-width:768px)': { gridTemplateColumns: '1fr 360px' },
  },
  itemsList: { display: 'flex', flexDirection: 'column', gap: '.875rem' },
  itemCard: {
    background: 'white', borderRadius: 16, padding: '1rem',
    display: 'flex', alignItems: 'center', gap: '1rem',
    boxShadow: '0 2px 8px rgba(0,0,0,.06)', flexWrap: 'wrap',
  },
  itemImg: {
    width: 56, height: 56, borderRadius: 10,
    background: 'var(--green-50)', flexShrink: 0,
    overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  itemInfo: { flex: 1, minWidth: 100 },
  itemName: { fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--gray-900)', fontSize: '.95rem' },
  itemPrice: { fontSize: '.8rem', color: 'var(--gray-500)', marginTop: '.15rem' },
  itemControls: { display: 'flex', alignItems: 'center', gap: '.375rem' },
  qtyBtn: {
    width: 32, height: 32, border: '2px solid var(--green-200)',
    borderRadius: 8, background: 'white', cursor: 'pointer',
    fontWeight: 700, fontSize: '1rem', color: 'var(--green-700)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  qty: { width: 28, textAlign: 'center', fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: '1rem' },
  itemRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '.25rem', marginLeft: 'auto' },
  subtotal: { fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--green-700)', fontSize: '1rem' },
  removeBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: '.2rem' },
  summary: {
    background: 'white', borderRadius: 20, padding: '1.5rem',
    boxShadow: '0 4px 16px rgba(0,0,0,.08)',
    position: 'sticky', top: 80, alignSelf: 'start',
  },
  summaryTitle: { fontSize: '1.1rem', fontFamily: 'var(--font-display)', marginBottom: '1rem', color: 'var(--gray-900)' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem' },
  divider: { borderTop: '2px solid var(--green-100)', margin: '1rem 0' },
  label: { display: 'block', fontSize: '.875rem', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '.375rem' },
  input: {
    width: '100%', padding: '.75rem 1rem', border: '2px solid var(--gray-200)',
    borderRadius: 10, fontSize: '.95rem', fontFamily: 'var(--font-body)',
  },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', marginBottom: '1.25rem' },
  checkoutBtn: {
    width: '100%', padding: '1rem', borderRadius: 12, border: 'none',
    background: 'var(--green-600)', color: 'white',
    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem',
    cursor: 'pointer', boxShadow: '0 4px 14px rgba(22,163,74,.3)',
  },
  secureNote: { textAlign: 'center', fontSize: '.75rem', color: 'var(--gray-400)', marginTop: '.75rem', lineHeight: 1.5 },
  paymentWrapper: {
    maxWidth: 520, margin: '0 auto',
    background: 'white', borderRadius: 20, padding: 'clamp(1.25rem, 4vw, 2rem)',
    boxShadow: '0 4px 20px rgba(0,0,0,.1)',
  },
  emptyState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '4rem 1rem', textAlign: 'center',
  },
  backBtn: {
    padding: '.875rem 2rem', borderRadius: 12, border: 'none',
    background: 'var(--green-600)', color: 'white',
    fontFamily: 'var(--font-display)', fontWeight: 700, cursor: 'pointer',
  },
};