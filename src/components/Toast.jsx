import { useEffect, useState } from 'react';
import styles from './Toast.module.css';

const ICONS = { success: '✓', error: '⚠', info: '◈' };
const DURATION = 3200;

export default function Toast({ message, type = 'info', onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(false), DURATION - 300);
    const t2 = setTimeout(onDone, DURATION);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div className={`${styles.toast} ${styles[type]} ${!visible ? styles.hide : ''}`}>
      <span className={styles.icon}>{ICONS[type]}</span>
      <span className={styles.message}>{message}</span>
    </div>
  );
}
