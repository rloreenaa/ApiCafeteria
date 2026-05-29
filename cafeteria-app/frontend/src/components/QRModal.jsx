import React, { memo } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default memo(function QRModal({ order, onClose }) {
  if (!order) return null;

  const qrData = `CAFETERIA-ORDER\nID: ${order.id}\nTOTAL: ${parseFloat(order.total_amount).toFixed(2)}€\nESTADO: PAGADO`;

  return (
    <div style={styles.overlay} role="dialog" aria-modal="true">
      <div style={styles.modal} className="animate-fade-in">
        <div style={styles.header}>
          <span style={styles.check}></span>
          <h2 style={styles.title}>¡Pago Confirmado!</h2>
          <p style={styles.sub}>Tu pedido está siendo preparado</p>
        </div>

        {/* QR generado en frontend */}
        <div style={styles.qrWrapper}>
          <div style={styles.qrBox}>
            <QRCodeSVG
              value={qrData}
              size={180}
              fgColor="#166534"
              bgColor="#ffffff"
              level="H"
              includeMargin={true}
            />
          </div>
        </div>

        {/* Detalles */}
        <div style={styles.details}>
          <div style={styles.row}>
            <span style={styles.label}>Pedido</span>
            <span style={styles.value}>#{String(order.id).slice(0,8).toUpperCase()}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Total</span>
            <span style={{ ...styles.value, color: 'var(--green-700)', fontWeight: 800, fontSize: '1.1rem' }}>
              {parseFloat(order.total_amount).toFixed(2)}€
            </span>
          </div>
          {order.pickup_time && (
            <div style={styles.row}>
              <span style={styles.label}>Recogida</span>
              <span style={styles.value}>{order.pickup_time}</span>
            </div>
          )}
          <div style={styles.row}>
            <span style={styles.label}>Estado</span>
            <span style={{ ...styles.value, color: '#10b981' }}> Pagado</span>
          </div>
        </div>

        <p style={styles.hint}>
          Muestra este QR al personal de la cafetería para recoger tu pedido
        </p>

        <button onClick={onClose} style={styles.btn}>
          Entendido
        </button>
      </div>
    </div>
  );
});

const styles = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 500,
    background: 'rgba(0,0,0,.5)',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '1rem',
  },
  modal: {
    background: 'white', borderRadius: 'var(--radius-xl)',
    padding: 'clamp(1.5rem, 5vw, 2rem)',
    maxWidth: 380, width: '100%',
    boxShadow: 'var(--shadow-lg)', textAlign: 'center',
  },
  header: { marginBottom: '1.5rem' },
  check: { fontSize: '2.5rem', display: 'block', marginBottom: '.5rem' },
  title: { fontSize: '1.4rem', color: 'var(--gray-900)', marginBottom: '.25rem' },
  sub: { color: 'var(--gray-500)', fontSize: '.9rem' },
  qrWrapper: {
    display: 'flex', justifyContent: 'center',
    marginBottom: '1.5rem',
  },
  qrBox: {
    padding: '1rem', background: 'white',
    borderRadius: 'var(--radius-md)',
    border: '3px solid var(--green-100)',
    boxShadow: '0 4px 12px rgba(22,163,74,.15)',
  },
  details: {
    background: 'var(--green-50)', borderRadius: 'var(--radius-md)',
    padding: '1rem', marginBottom: '1rem',
    display: 'flex', flexDirection: 'column', gap: '.5rem',
  },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: 'var(--gray-500)', fontSize: '.875rem' },
  value: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '.9rem', color: 'var(--gray-900)' },
  hint: { fontSize: '.8rem', color: 'var(--gray-400)', lineHeight: 1.5, marginBottom: '1rem' },
  btn: {
    width: '100%', padding: '1rem', borderRadius: 'var(--radius-md)',
    border: 'none', background: 'var(--green-600)', color: 'white',
    fontFamily: 'var(--font-display)', fontWeight: 700,
    fontSize: '1rem', cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(22,163,74,.3)',
  },
};