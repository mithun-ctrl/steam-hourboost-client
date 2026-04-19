import styles from './AccountCard.module.css';

const STATUS_CONFIG = {
  online:     { label: 'ONLINE',      color: 'var(--status-online)',     glow: 'rgba(0,255,157,0.35)' },
  offline:    { label: 'OFFLINE',     color: 'var(--status-offline)',    glow: 'transparent' },
  connecting: { label: 'CONNECTING',  color: 'var(--status-connecting)', glow: 'rgba(255,170,0,0.35)' },
  error:      { label: 'ERROR',       color: 'var(--status-error)',      glow: 'rgba(255,60,90,0.35)' },
};

export default function AccountCard({ account, onStart, onStop, onEdit, onDelete, style }) {
  const { username, status, gameIds = [], lastError, notes } = account;
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.offline;
  const isActive = status === 'online' || status === 'connecting';

  return (
    <div className={styles.card} style={style}>
      <div className={styles.topBar}>
        {/* Status indicator */}
        <div className={styles.statusRow}>
          <span
            className={`${styles.dot} ${status === 'online' ? styles.dotPulse : ''}`}
            style={{ background: cfg.color, boxShadow: `0 0 7px ${cfg.glow}` }}
          />
          <span className={styles.statusLabel} style={{ color: cfg.color }}>
            {cfg.label}
          </span>
        </div>
        <div className={styles.cardActions}>
          <button className={styles.iconBtn} title="Edit" onClick={onEdit}>✎</button>
          <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} title="Delete" onClick={onDelete}>✕</button>
        </div>
      </div>

      <div className={styles.usernameRow}>
        <span className={styles.accountIcon}>◈</span>
        <span className={styles.username}>{username}</span>
      </div>

      {notes && <p className={styles.notes}>{notes}</p>}

      {gameIds.length > 0 && (
        <div className={styles.games}>
          <span className={styles.gamesLabel}>GAMES</span>
          <div className={styles.gamesList}>
            {gameIds.map((id) => (
              <span key={id} className={styles.gameChip}>#{id}</span>
            ))}
          </div>
        </div>
      )}

      {status === 'error' && lastError && (
        <p className={styles.errorMsg}>⚠ {lastError}</p>
      )}

      <div className={styles.btnRow}>
        {!isActive ? (
          <button
            className={styles.btnStart}
            onClick={onStart}
            disabled={status === 'connecting'}
          >
            {status === 'connecting' ? '● CONNECTING…' : '▶ START'}
          </button>
        ) : (
          <button className={styles.btnStop} onClick={onStop}>
            ■ STOP
          </button>
        )}
      </div>
    </div>
  );
}
