import { useEffect, useState } from 'react';
import { useAccounts } from '../hooks/useAccounts.js';
import { useSessions } from '../hooks/useSessions.js';
import { useSocket } from '../context/SocketContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import AccountGrid from '../components/AccountGrid.jsx';
import AccountModal from '../components/AccountModal.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import Toast from '../components/Toast.jsx';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const { accounts, loading, error, createAccount, updateAccount, deleteAccount, patchStatus } = useAccounts();
  const { startSession, stopSession, startAll, stopAll } = useSessions();
  const { socket } = useSocket();
  const { logout } = useAuth();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Real-time socket updates
  useEffect(() => {
    if (!socket) return;
    const handler = ({ accountId, status, error: err, gameIds }) => {
      patchStatus(accountId, status, { error: err, gameIds });
    };
    socket.on('account:status', handler);
    return () => socket.off('account:status', handler);
  }, [socket, patchStatus]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
  };

  const handleStart = async (id) => {
    try {
      patchStatus(id, 'connecting');
      await startSession(id);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to start session', 'error');
      patchStatus(id, 'error');
    }
  };

  const handleStop = async (id) => {
    try {
      await stopSession(id);
      patchStatus(id, 'offline');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to stop session', 'error');
    }
  };

  const handleBulkStart = async () => {
    setBulkLoading(true);
    try {
      await startAll();
      showToast('All sessions starting…', 'success');
    } catch { showToast('Bulk start failed', 'error'); }
    finally { setBulkLoading(false); }
  };

  const handleBulkStop = async () => {
    setBulkLoading(true);
    try {
      await stopAll();
      showToast('All sessions stopped', 'info');
    } catch { showToast('Bulk stop failed', 'error'); }
    finally { setBulkLoading(false); }
  };

  const handleSave = async (payload) => {
    try {
      if (editTarget) {
        await updateAccount(editTarget._id, payload);
        showToast('Account updated', 'success');
      } else {
        await createAccount(payload);
        showToast('Account added', 'success');
      }
      setModalOpen(false);
      setEditTarget(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Save failed', 'error');
    }
  };

  const handleEdit = (account) => {
    setEditTarget(account);
    setModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteAccount(confirmDelete._id);
      showToast('Account deleted', 'info');
    } catch { showToast('Delete failed', 'error'); }
    finally { setConfirmDelete(null); }
  };

  const filtered = accounts.filter((a) =>
    a.username.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: accounts.length,
    online: accounts.filter((a) => a.status === 'online').length,
    offline: accounts.filter((a) => a.status === 'offline').length,
    error: accounts.filter((a) => a.status === 'error').length,
  };

  return (
    <div className={styles.page}>
      <Navbar onLogout={logout} />

      <main className={styles.main}>
        {/* Stats bar */}
        <div className={styles.statsBar}>
          <StatChip label="TOTAL" value={stats.total} color="accent" />
          <StatChip label="ONLINE" value={stats.online} color="green" />
          <StatChip label="OFFLINE" value={stats.offline} color="muted" />
          <StatChip label="ERROR" value={stats.error} color="red" />
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>⌕</span>
            <input
              className={styles.search}
              placeholder="Search accounts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.actions}>
            <button className={styles.btnSecondary} onClick={handleBulkStart} disabled={bulkLoading}>
              ▶ START ALL
            </button>
            <button className={styles.btnDanger} onClick={handleBulkStop} disabled={bulkLoading}>
              ■ STOP ALL
            </button>
            <button className={styles.btnPrimary} onClick={() => { setEditTarget(null); setModalOpen(true); }}>
              + ADD ACCOUNT
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className={styles.center}>
            <Spinner />
            <span className={styles.loadingText}>LOADING ACCOUNTS</span>
          </div>
        ) : error ? (
          <div className={styles.center}>
            <p className={styles.errorText}>⚠ {error}</p>
          </div>
        ) : (
          <AccountGrid
            accounts={filtered}
            onStart={handleStart}
            onStop={handleStop}
            onEdit={handleEdit}
            onDelete={setConfirmDelete}
          />
        )}
      </main>

      {modalOpen && (
        <AccountModal
          account={editTarget}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditTarget(null); }}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title="DELETE ACCOUNT"
          message={`Permanently remove "${confirmDelete.username}"? Active session will be terminated.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}

const StatChip = ({ label, value, color }) => {
  const colors = {
    accent: 'var(--accent)',
    green: 'var(--status-online)',
    muted: 'var(--text-muted)',
    red: 'var(--danger)',
  };
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '0.5rem 1.25rem', border: `1px solid var(--border)`,
      background: 'var(--bg-card)',
    }}>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 900, color: colors[color] }}>
        {value}
      </span>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.55rem', letterSpacing: '0.15em', color: 'var(--text-muted)' }}>
        {label}
      </span>
    </div>
  );
};

const Spinner = () => (
  <div style={{
    width: 28, height: 28, border: '2px solid var(--border)',
    borderTopColor: 'var(--accent)', borderRadius: '50%',
    animation: 'spin 0.7s linear infinite', marginBottom: '0.75rem',
  }} />
);
