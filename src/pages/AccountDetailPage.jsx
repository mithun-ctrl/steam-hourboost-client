import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAccounts } from '../hooks/useAccounts.js';
import { useSessions } from '../hooks/useSessions.js';
import { useSocket } from '../context/SocketContext.jsx';
import Toast from '../components/Toast.jsx';
import AddGameModal from '../components/AddGameModal.jsx';
import styles from './AccountDetailPage.module.css';

/* ── Icons ── */
const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const IconPlay = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);
const IconStop = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
  </svg>
);
const IconSettings2 = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>
);
const IconExternalLink = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);
const IconShield = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconGamepad = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="12" x2="18" y2="12"/><line x1="9" y1="9" x2="9" y2="15"/>
    <rect x="2" y="6" width="20" height="12" rx="2"/>
    <circle cx="15" cy="10" r="1" fill="currentColor"/><circle cx="17" cy="12" r="1" fill="currentColor"/>
  </svg>
);

const STATUS_MAP = {
  online:     { label: 'Online',     color: 'var(--status-online)',     bg: 'rgba(16,185,129,0.1)' },
  offline:    { label: 'Offline',    color: 'var(--status-offline)',    bg: 'rgba(71,85,105,0.15)' },
  connecting: { label: 'Connecting', color: 'var(--status-connecting)', bg: 'rgba(245,158,11,0.1)' },
  error:      { label: 'Error',      color: 'var(--status-error)',      bg: 'rgba(244,63,94,0.1)' },
};

const TABS = ['Overview', 'Games', 'Settings'];

export default function AccountDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accounts, updateAccount, patchStatus } = useAccounts();
  const { startSession, stopSession } = useSessions();
  const { socket } = useSocket();

  const [activeTab, setActiveTab] = useState('Overview');
  const [toast, setToast] = useState(null);
  const [addGameOpen, setAddGameOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // ── Game name cache (localStorage) ──────────────────────────────────────
  const CACHE_KEY = 'steamGameNames';
  const getNameCache = () => { try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); } catch { return {}; } };
  const cacheGameName = (appid, name) => { const c = getNameCache(); c[appid] = name; localStorage.setItem(CACHE_KEY, JSON.stringify(c)); };
  const getGameName   = (appid) => getNameCache()[appid] || null;
  // ────────────────────────────────────────────────────────────────────────

  const account = accounts.find(a => a._id === id);

  useEffect(() => {
    if (account) setNotes(account.notes || '');
  }, [account]);

  useEffect(() => {
    if (!socket) return;
    const handler = ({ accountId, status, error: err, gameIds }) =>
      patchStatus(accountId, status, { error: err, gameIds });
    socket.on('account:status', handler);
    return () => socket.off('account:status', handler);
  }, [socket, patchStatus]);

  const showToast = (message, type = 'info') =>
    setToast({ message, type, id: Date.now() });

  const handleStart = async () => {
    try { patchStatus(id, 'connecting'); await startSession(id); }
    catch (err) { showToast(err.response?.data?.message || 'Failed to start', 'error'); patchStatus(id, 'error'); }
  };

  const handleStop = async () => {
    try { await stopSession(id); patchStatus(id, 'offline'); }
    catch (err) { showToast(err.response?.data?.message || 'Failed to stop', 'error'); }
  };

  const handleAddGame = async ({ appid, name }) => {
    const updated = [...(account.gameIds || []), appid];
    await updateAccount(id, { gameIds: updated });
    cacheGameName(appid, name);
    showToast(`${name} added`, 'success');
  };

  const handleRemoveGame = async (gid) => {
    const updated = (account.gameIds || []).filter(g => g !== gid);
    try {
      await updateAccount(id, { gameIds: updated });
      showToast('Game removed', 'info');
    } catch { showToast('Failed to remove game', 'error'); }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try { await updateAccount(id, { notes }); showToast('Notes saved', 'success'); }
    catch { showToast('Failed to save notes', 'error'); }
    finally { setSavingNotes(false); }
  };

  if (!account) {
    return (
      <div className={styles.notFound}>
        <p>Account not found.</p>
        <Link to="/accounts" className={styles.backLink}><IconArrowLeft /> Back to accounts</Link>
      </div>
    );
  }

  const cfg = STATUS_MAP[account.status] || STATUS_MAP.offline;
  const isActive = account.status === 'online' || account.status === 'connecting';
  const initials = (account.username || '?').slice(0, 2).toUpperCase();

  return (
    <div className={styles.page}>
      {/* Back nav */}
      <Link to="/accounts" className={styles.backLink}>
        <IconArrowLeft /> Back to Accounts
      </Link>

      {/* Account hero */}
      <div className={styles.hero}>
        <div className={styles.heroAvatar}>{initials}</div>
        <div className={styles.heroMeta}>
          <h1 className={styles.heroName}>{account.username}</h1>
          <span
            className={styles.heroBadge}
            style={{ color: cfg.color, background: cfg.bg, borderColor: `${cfg.color}30` }}
          >
            <span
              className={styles.heroBadgeDot}
              style={{
                background: cfg.color,
                animation: account.status === 'online' ? 'dotPulse 2s ease infinite' : 'none',
              }}
            />
            {cfg.label}
          </span>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <span className={styles.heroStatVal}>{account.gameIds?.length ?? 0}</span>
            <span className={styles.heroStatLabel}>Games</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabBar}>
        {TABS.map(tab => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* === Overview Tab === */}
      {activeTab === 'Overview' && (
        <div className={styles.tabContent}>
          <div className={styles.cardsRow}>
            {/* Idle Control */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>Idle Control</span>
              </div>
              <div className={styles.idleControl}>
                <div className={styles.idleButtons}>
                  {!isActive ? (
                    <button
                      className={styles.btnStart}
                      onClick={handleStart}
                      disabled={account.status === 'connecting'}
                    >
                      <IconPlay />
                      {account.status === 'connecting' ? 'Connecting…' : 'Start Idle'}
                    </button>
                  ) : (
                    <button className={styles.btnStop} onClick={handleStop}>
                      <IconStop /> Stop Idle
                    </button>
                  )}
                  <button className={styles.btnConfig}>
                    <IconSettings2 /> Config
                  </button>
                </div>
                {account.status === 'error' && account.lastError && (
                  <p className={styles.errorMsg}>⚠ {account.lastError}</p>
                )}
                <div className={styles.guardNote}>
                  <IconShield />
                  <span>
                    If Steam Guard is enabled, ensure your <strong>Shared Secret</strong> is configured to avoid login interruptions.
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>Quick Links</span>
              </div>
              <a
                href={`https://steamcommunity.com/id/${account.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.steamLink}
              >
                <span>View profile on Steam</span>
                <IconExternalLink />
              </a>
              <a
                href="https://steamdb.info"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.steamLink}
              >
                <span>Find Game IDs on SteamDB</span>
                <IconExternalLink />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* === Games Tab === */}
      {activeTab === 'Games' && (
        <div className={styles.tabContent}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>
                <IconGamepad /> Added Games
              </span>
              <span className={styles.cardBadge}>{account.gameIds?.length ?? 0} / 32</span>
            </div>

            <p className={styles.gamesNote}>
              Idle up to 32 games simultaneously. Search and add games from the Steam library.
            </p>

            {/* Add game button */}
            <button
              className={styles.btnAdd}
              onClick={() => setAddGameOpen(true)}
              disabled={(account.gameIds?.length ?? 0) >= 32}
            >
              <IconPlus /> Add Game
            </button>

            {/* Game list */}
            {(!account.gameIds || account.gameIds.length === 0) ? (
              <div className={styles.gamesEmpty}>
                <IconGamepad />
                <p>No games added yet. Click "Add Game" to search your Steam library.</p>
              </div>
            ) : (
              <div className={styles.gamesList}>
                {account.gameIds.map(gid => {
                  const gameName = getGameName(gid);
                  return (
                    <div key={gid} className={styles.gameRow}>
                      <div className={styles.gameInfo}>
                        <span className={styles.gameAppId}>{gameName || `App #${gid}`}</span>
                        <a
                          href={`https://store.steampowered.com/app/${gid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.gameStoreLink}
                        >
                          View on Steam <IconExternalLink />
                        </a>
                      </div>
                      <button
                        className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                        onClick={() => handleRemoveGame(gid)}
                        title="Remove game"
                      >
                        <IconTrash />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* === Settings Tab === */}
      {activeTab === 'Settings' && (
        <div className={styles.tabContent}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Account Notes</span>
            </div>
            <textarea
              className={`${styles.input} ${styles.textarea}`}
              placeholder="Add notes about this account…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
            />
            <div className={styles.settingsActions}>
              <button
                className={styles.btnSave}
                onClick={handleSaveNotes}
                disabled={savingNotes}
              >
                {savingNotes ? 'Saving…' : 'Save Notes'}
              </button>
            </div>
          </div>

          <div className={`${styles.card} ${styles.dangerZone}`}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitleDanger}>Danger Zone</span>
            </div>
            <p className={styles.dangerText}>
              This will permanently delete the account and stop any active session.
            </p>
            <button
              className={styles.btnDelete}
              onClick={() => navigate('/accounts')}
            >
              <IconTrash /> Delete Account
            </button>
          </div>
        </div>
      )}

      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onDone={() => setToast(null)} />}

      {addGameOpen && (
        <AddGameModal
          existingGameIds={account.gameIds || []}
          onAdd={handleAddGame}
          onClose={() => setAddGameOpen(false)}
        />
      )}
    </div>
  );
}
