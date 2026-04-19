import { useState, useEffect } from 'react';
import styles from './AccountModal.module.css';

export default function AccountModal({ account, onSave, onClose }) {
  const isEdit = !!account;

  const [form, setForm] = useState({
    username: '',
    password: '',
    sharedSecret: '',
    gameIds: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (account) {
      setForm({
        username: account.username || '',
        password: '',          // never pre-fill password
        sharedSecret: '',      // never pre-fill secret
        gameIds: (account.gameIds || []).join(', '),
        notes: account.notes || '',
      });
    }
  }, [account]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const parseGameIds = (raw) =>
    raw
      .split(/[\s,]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const gameIds = parseGameIds(form.gameIds);

    if (!form.username.trim()) return setError('Username is required');
    if (!isEdit && !form.password) return setError('Password is required');

    const payload = {
      username: form.username.trim(),
      gameIds,
      notes: form.notes.trim(),
    };
    if (form.password) payload.password = form.password;
    if (form.sharedSecret) payload.sharedSecret = form.sharedSecret;

    setSaving(true);
    try {
      await onSave(payload);
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.title}>
            <span className={styles.titleIcon}>◈</span>
            {isEdit ? 'EDIT ACCOUNT' : 'ADD ACCOUNT'}
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Field label="STEAM USERNAME" required>
            <input className={styles.input} value={form.username}
              onChange={set('username')} placeholder="steam_username" autoComplete="off" />
          </Field>

          <Field label={isEdit ? 'NEW PASSWORD (leave blank to keep)' : 'PASSWORD'} required={!isEdit}>
            <input className={styles.input} type="password" value={form.password}
              onChange={set('password')} placeholder="••••••••" autoComplete="new-password" />
          </Field>

          <Field label="SHARED SECRET (optional — for 2FA)">
            <input className={styles.input} value={form.sharedSecret}
              onChange={set('sharedSecret')} placeholder="base64 shared secret"
              autoComplete="off" />
            <span className={styles.hint}>Required if your account has Steam Guard Mobile Authenticator</span>
          </Field>

          <Field label="GAME IDs (comma or space separated)">
            <input className={styles.input} value={form.gameIds}
              onChange={set('gameIds')} placeholder="730, 440, 570" />
            <span className={styles.hint}>Find App IDs on SteamDB or store URLs</span>
          </Field>

          <Field label="NOTES (optional)">
            <textarea className={`${styles.input} ${styles.textarea}`}
              value={form.notes} onChange={set('notes')}
              placeholder="Personal notes about this account..." rows={2} />
          </Field>

          {error && <p className={styles.error}>⚠ {error}</p>}

          <div className={styles.actions}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>
              CANCEL
            </button>
            <button type="submit" className={styles.btnSave} disabled={saving}>
              {saving ? 'SAVING…' : isEdit ? 'UPDATE' : 'ADD ACCOUNT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const Field = ({ label, required, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
    <label style={{
      fontFamily: 'var(--font-display)', fontSize: '0.58rem',
      letterSpacing: '0.15em', color: 'var(--text-muted)',
    }}>
      {label}{required && <span style={{ color: 'var(--accent)', marginLeft: 3 }}>*</span>}
    </label>
    {children}
  </div>
);
