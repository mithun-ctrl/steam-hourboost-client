import { useEffect, useState } from 'react';
import styles from './Toast.module.css';

const ICONS = {
  success: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
};

const TYPE_STYLES = {
  success: { color: 'var(--success)',  border: 'rgba(16,185,129,0.3)',  bg: 'rgba(16,185,129,0.08)' },
  error:   { color: 'var(--danger)',   border: 'rgba(244,63,94,0.3)',   bg: 'rgba(244,63,94,0.08)' },
  info:    { color: 'var(--accent)',   border: 'rgba(56,189,248,0.3)',  bg: 'rgba(56,189,248,0.08)' },
};

const DURATION = 3200;

export default function Toast({ message, type = 'info', onDone }) {
  const [visible, setVisible] = useState(true);
  const ts = TYPE_STYLES[type] || TYPE_STYLES.info;

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(false), DURATION - 350);
    const t2 = setTimeout(() => onDone?.(), DURATION);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div
      className={`${styles.toast} ${visible ? styles.toastIn : styles.toastOut}`}
      style={{ borderColor: ts.border, background: `var(--bg-surface)` }}
      role="alert"
    >
      <span className={styles.icon} style={{ color: ts.color, background: ts.bg, borderColor: ts.border }}>
        {ICONS[type]}
      </span>
      <span className={styles.message}>{message}</span>
      <div className={styles.progress} style={{ background: ts.color }} />
    </div>
  );
}
