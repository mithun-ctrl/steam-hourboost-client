import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAccounts } from '../hooks/useAccounts.js';
import { useSocket } from '../context/SocketContext.jsx';
import styles from './OverviewPage.module.css';

/* ── Icons ── */
const IconGamepad = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="12" x2="18" y2="12"/><line x1="9" y1="9" x2="9" y2="15"/>
    <rect x="2" y="6" width="20" height="12" rx="2"/>
    <circle cx="15" cy="10" r="1" fill="currentColor"/><circle cx="17" cy="12" r="1" fill="currentColor"/>
  </svg>
);
const IconActivity = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);
const IconUsers = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconZap = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IconChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

function StatCard({ icon: Icon, label, value, sub, accent, delay }) {
  return (
    <div className={styles.statCard} style={{ animationDelay: delay }}>
      <div className={styles.statHeader}>
        <div className={styles.statIconWrap} style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
          <span style={{ color: accent }}><Icon /></span>
        </div>
        <span className={styles.statLabel}>{label}</span>
      </div>
      <div className={styles.statValue}>{value}</div>
      {sub && <div className={styles.statSub}>{sub}</div>}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    online:     { color: 'var(--status-online)',     label: 'Online' },
    offline:    { color: 'var(--status-offline)',    label: 'Offline' },
    connecting: { color: 'var(--status-connecting)', label: 'Connecting' },
    error:      { color: 'var(--status-error)',      label: 'Error' },
  };
  const { color, label } = map[status] || map.offline;
  return (
    <span className={styles.badge} style={{ color, background: `${color}18`, borderColor: `${color}30` }}>
      <span className={styles.badgeDot} style={{
        background: color,
        animation: status === 'online' ? 'pulseGlow 2s ease infinite' : 'none',
      }} />
      {label}
    </span>
  );
}

function getInitials(username) {
  return (username || '??').slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  ['#38bdf8','#818cf8'],
  ['#10b981','#38bdf8'],
  ['#f59e0b','#f43f5e'],
  ['#818cf8','#f43f5e'],
];

export default function OverviewPage() {
  const { accounts, loading, patchStatus } = useAccounts();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    const handler = ({ accountId, status, error: err, gameIds }) =>
      patchStatus(accountId, status, { error: err, gameIds });
    socket.on('account:status', handler);
    return () => socket.off('account:status', handler);
  }, [socket, patchStatus]);

  const onlineAccounts = accounts.filter(a => a.status === 'online');
  const gamesIdling = onlineAccounts.reduce((sum, a) => sum + (a.gameIds?.length ?? 0), 0);
  const globalStatus = onlineAccounts.length > 0 ? 'online' : 'offline';
  const SLOT_LIMIT = 5;

  const recentAccounts = accounts.slice(0, 3);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Overview</h1>
          <p className={styles.pageSubtitle}>Monitor your Steam boosting sessions at a glance</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className={styles.statsGrid}>
        <StatCard
          icon={IconGamepad}
          label="Games Idling"
          value={loading ? '—' : gamesIdling}
          sub={gamesIdling > 0 ? `Across ${onlineAccounts.length} account${onlineAccounts.length !== 1 ? 's' : ''}` : 'No active sessions'}
          accent="#38bdf8"
          delay="0ms"
        />
        <StatCard
          icon={IconActivity}
          label="Status"
          value={loading ? '—' : globalStatus === 'online' ? 'Active' : 'Idle'}
          sub={globalStatus === 'online' ? `${onlineAccounts.length} session${onlineAccounts.length !== 1 ? 's' : ''} running` : 'All sessions stopped'}
          accent={globalStatus === 'online' ? '#10b981' : '#475569'}
          delay="60ms"
        />
        <StatCard
          icon={IconUsers}
          label="Account Slots"
          value={loading ? '—' : `${accounts.length} / ${SLOT_LIMIT}`}
          sub={`${SLOT_LIMIT - accounts.length} slot${SLOT_LIMIT - accounts.length !== 1 ? 's' : ''} remaining`}
          accent="#818cf8"
          delay="120ms"
        />
        <StatCard
          icon={IconZap}
          label="Plan"
          value="Free"
          sub={<Link to="/settings" className={styles.upgradeLink}>Upgrade to Pro <IconArrow /></Link>}
          accent="#f59e0b"
          delay="180ms"
        />
      </div>

      {/* Recent Accounts */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Accounts</h2>
          <Link to="/accounts" className={styles.viewAll}>
            View all accounts <IconChevronRight />
          </Link>
        </div>

        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <span>Loading accounts…</span>
          </div>
        ) : accounts.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}><IconUsers /></span>
            <p>No accounts added yet.</p>
            <Link to="/accounts" className={styles.emptyBtn}>Add your first account</Link>
          </div>
        ) : (
          <div className={styles.accountList}>
            {recentAccounts.map((account, i) => {
              const [c1, c2] = AVATAR_COLORS[i % AVATAR_COLORS.length];
              return (
                <Link
                  key={account._id}
                  to={`/accounts/${account._id}`}
                  className={styles.accountRow}
                >
                  <div
                    className={styles.accountAvatar}
                    style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                  >
                    {getInitials(account.username)}
                  </div>
                  <div className={styles.accountInfo}>
                    <span className={styles.accountName}>{account.username}</span>
                    <span className={styles.accountMeta}>
                      {account.gameIds?.length ?? 0} game{(account.gameIds?.length ?? 0) !== 1 ? 's' : ''}
                      {account.notes ? ` · ${account.notes}` : ''}
                    </span>
                  </div>
                  <StatusBadge status={account.status || 'offline'} />
                  <IconChevronRight />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
