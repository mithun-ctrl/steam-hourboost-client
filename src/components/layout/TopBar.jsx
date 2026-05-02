import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import styles from './TopBar.module.css';

const ROUTE_LABELS = {
  '/':         ['Dashboard', 'Overview'],
  '/accounts': ['Dashboard', 'Accounts'],
  '/settings': ['Dashboard', 'Settings'],
};

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

export default function TopBar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [root, page] = ROUTE_LABELS[pathname] || ['Dashboard', ''];
  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : '??';

  return (
    <header className={styles.topbar}>
      <div className={styles.breadcrumb}>
        <span className={styles.breadcrumbRoot}>{root}</span>
        {page && (
          <>
            <span className={styles.breadcrumbSep}>/</span>
            <span className={styles.breadcrumbPage}>{page}</span>
          </>
        )}
      </div>

      <div className={styles.right}>
        <button className={styles.iconBtn} aria-label="Notifications">
          <BellIcon />
          <span className={styles.notifDot} />
        </button>
        <div className={styles.avatar} title={user?.username}>{initials}</div>
      </div>
    </header>
  );
}
