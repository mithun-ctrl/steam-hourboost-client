import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccounts } from '../hooks/useAccounts.js';
import { useSessions } from '../hooks/useSessions.js';
import { useSocket } from '../context/SocketContext.jsx';
import AccountModal from '../components/AccountModal.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import Toast from '../components/Toast.jsx';
import styles from './AccountsPage.module.css';

/* ── Icons ── */
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconPlay = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);
const IconStop = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
  </svg>
);
const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const IconUsers = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconChevron = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const AVATAR_COLORS = [
  ['#38bdf8','#818cf8'], ['#10b981','#38bdf8'],
  ['#f59e0b','#f43f5e'], ['#818cf8','#f43f5e'],
  ['#06b6d4','#10b981'], ['#a78bfa','#38bdf8'],
];

const STATUS_MAP = {
  online:     { label: 'Online',     color: 'var(--status-online)',     bg: 'rgba(16,185,129,0.1)' },
  offline:    { label: 'Offline',    color: 'var(--status-offline)',    bg: 'rgba(71,85,105,0.15)' },
  connecting: { label: 'Connecting', color: 'var(--status-connecting)', bg: 'rgba(245,158,11,0.1)' },
  error:      { label: 'Error',      color: 'var(--status-error)',      bg: 'rgba(244,63,94,0.1)' },
};

export default function AccountsPage() {
  const { accounts, loading, error, createAccount, updateAccount, deleteAccount, patchStatus } = useAccounts();
  const { startSession, stopSession, startAll, stopAll } = useSessions();
  const { socket } = useSocket();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    if (!socket) return;
    const handler = ({ accountId, status, error: err, gameIds }) =>
      patchStatus(accountId, status, { error: err, gameIds });
    socket.on('account:status', handler);
    return () => socket.off('account:status', handler);
  }, [socket, patchStatus]);

  const showToast = (message, type = 'info') =>
    setToast({ message, type, id: Date.now() });

  const handleStart = async (id) => {
    try { patchStatus(id, 'connecting'); await startSession(id); }
    catch (err) { showToast(err.response?.data?.message || 'Failed to start session', 'error'); patchStatus(id, 'error'); }
  };

  const handleStop = async (id) => {
    try { await stopSession(id); patchStatus(id, 'offline'); }
    catch (err) { showToast(err.response?.data?.message || 'Failed to stop session', 'error'); }
  };

  const handleBulkStart = async () => {
    setBulkLoading(true);
    try { await startAll(); showToast('All sessions starting…', 'success'); }
    catch { showToast('Bulk start failed', 'error'); }
    finally { setBulkLoading(false); }
  };

  const handleBulkStop = async () => {
    setBulkLoading(true);
    try { await stopAll(); showToast('All sessions stopped', 'info'); }
    catch { showToast('Bulk stop failed', 'error'); }
    finally { setBulkLoading(false); }
  };

  const handleSave = async (payload) => {
    try {
      if (editTarget) { await updateAccount(editTarget._id, payload); showToast('Account updated', 'success'); }
      else { await createAccount(payload); showToast('Account added', 'success'); }
      setModalOpen(false); setEditTarget(null);
    } catch (err) { showToast(err.response?.data?.message || 'Save failed', 'error'); }
  };

  const handleDeleteConfirm = async () => {
    try { await deleteAccount(confirmDelete._id); showToast('Account deleted', 'info'); }
    catch { showToast('Delete failed', 'error'); }
    finally { setConfirmDelete(null); }
  };

  const filtered = accounts.filter(a =>
    a.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Accounts</h1>
          <p className={styles.pageSubtitle}>{accounts.length} account{accounts.length !== 1 ? 's' : ''} connected</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnSecondary} onClick={handleBulkStart} disabled={bulkLoading}>
            <IconPlay /> Start All
          </button>
          <button className={styles.btnDanger} onClick={handleBulkStop} disabled={bulkLoading}>
            <IconStop /> Stop All
          </button>
          <button className={styles.btnPrimary} onClick={() => { setEditTarget(null); setModalOpen(true); }}>
            <IconPlus /> Add Account
          </button>
        </div>
      </div>

      {/* Search */}
      <div className={styles.searchWrap}>
        <span className={styles.searchIcon}><IconSearch /></span>
        <input
          className={styles.searchInput}
          placeholder="Search accounts by username…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className={styles.center}>
          <div className={styles.spinner} />
          <span className={styles.loadingText}>Loading accounts…</span>
        </div>
      ) : error ? (
        <div className={styles.center}>
          <p className={styles.errorText}>⚠ {error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}><IconUsers /></div>
          <p className={styles.emptyTitle}>{search ? 'No accounts match your search' : 'No accounts yet'}</p>
          <p className={styles.emptySub}>{search ? 'Try a different search term' : 'Add your first Steam account to start boosting'}</p>
          {!search && (
            <button className={styles.btnPrimary} onClick={() => setModalOpen(true)}>
              <IconPlus /> Add Account
            </button>
          )}
        </div>
      ) : (
        <div className={styles.accountsGrid}>
          {filtered.map((account, i) => {
            const [c1, c2] = AVATAR_COLORS[i % AVATAR_COLORS.length];
            const cfg = STATUS_MAP[account.status] || STATUS_MAP.offline;
            const isActive = account.status === 'online' || account.status === 'connecting';
            return (
              <div key={account._id} className={styles.accountCard} style={{ animationDelay: `${i * 40}ms` }}>
                {/* Card header */}
                <div className={styles.cardTop}>
                  <div className={styles.cardAvatar} style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                    {(account.username || '?').slice(0, 2).toUpperCase()}
                  </div>
                  <div className={styles.cardMeta}>
                    <span className={styles.cardUsername}>{account.username}</span>
                    <span className={styles.cardSteamId}>
                      {account.gameIds?.length ?? 0} game{(account.gameIds?.length ?? 0) !== 1 ? 's' : ''} configured
                    </span>
                  </div>
                  <span
                    className={styles.statusBadge}
                    style={{ color: cfg.color, background: cfg.bg, borderColor: `${cfg.color}30` }}
                  >
                    <span
                      className={styles.statusDot}
                      style={{
                        background: cfg.color,
                        animation: account.status === 'online' ? 'dotPulse 2s ease infinite' : 'none',
                      }}
                    />
                    {cfg.label}
                  </span>
                </div>

                {/* Notes */}
                {account.notes && (
                  <p className={styles.cardNotes}>{account.notes}</p>
                )}

                {/* Error */}
                {account.status === 'error' && account.lastError && (
                  <p className={styles.cardError}>⚠ {account.lastError}</p>
                )}

                {/* Actions */}
                <div className={styles.cardActions}>
                  <div className={styles.cardActionLeft}>
                    {!isActive ? (
                      <button
                        className={styles.btnStart}
                        onClick={() => handleStart(account._id)}
                        disabled={account.status === 'connecting'}
                      >
                        <IconPlay />
                        {account.status === 'connecting' ? 'Connecting…' : 'Start'}
                      </button>
                    ) : (
                      <button className={styles.btnStop} onClick={() => handleStop(account._id)}>
                        <IconStop /> Stop
                      </button>
                    )}
                    <Link to={`/accounts/${account._id}`} className={styles.btnView}>
                      View <IconChevron />
                    </Link>
                  </div>
                  <div className={styles.cardActionRight}>
                    <button className={styles.iconBtn} title="Edit" onClick={() => { setEditTarget(account); setModalOpen(true); }}>
                      <IconEdit />
                    </button>
                    <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} title="Delete" onClick={() => setConfirmDelete(account)}>
                      <IconTrash />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <AccountModal
          account={editTarget}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditTarget(null); }}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Delete Account"
          message={`Permanently remove "${confirmDelete.username}"? Any active session will be terminated.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}
