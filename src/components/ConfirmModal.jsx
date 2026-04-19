import styles from './ConfirmModal.module.css';

export default function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className={styles.modal}>
        <div className={styles.iconWrap}>
          <span className={styles.icon}>⚠</span>
        </div>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className={styles.btnCancel} onClick={onCancel}>CANCEL</button>
          <button className={styles.btnConfirm} onClick={onConfirm}>CONFIRM DELETE</button>
        </div>
      </div>
    </div>
  );
}
