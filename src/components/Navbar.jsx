import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import styles from './Navbar.module.css';

export default function Navbar({ onLogout }) {
  const { user } = useAuth();
  const { connected } = useSocket();

  return (
    <nav className={styles.nav}>
      <div className={styles.brand}>
        <span className={styles.brandIcon}>⬡</span>
        <span className={styles.brandName}>STEAMCTL</span>
        <span className={styles.brandSub}>/ DASHBOARD</span>
      </div>
      <div className={styles.right}>
        <div className={styles.socketStatus}>
          <span className={`${styles.dot} ${connected ? styles.dotOn : styles.dotOff}`} />
          <span className={styles.socketLabel}>{connected ? 'LIVE' : 'DISCONNECTED'}</span>
        </div>
        <div className={styles.userChip}>
          <span className={styles.userIcon}>◈</span>
          <span className={styles.userName}>{user?.username}</span>
        </div>
        <button className={styles.logout} onClick={onLogout}>SIGN OUT</button>
      </div>
    </nav>
  );
}
