import { useState, useEffect, useRef } from 'react';
import styles from './AccountModal.module.css';

/* ── Icons ── */
const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconEye = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconEyeOff = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const IconShield = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

export default function AccountModal({ account, onSave, onClose }) {
  const isEdit = !!account;
  const firstInputRef = useRef(null);

  const [form, setForm] = useState({ username: '', password: '', sharedSecret: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (account) setForm({ username: account.username || '', password: '', sharedSecret: '' });
    // Focus first input on open
    setTimeout(() => firstInputRef.current?.focus(), 80);
  }, [account]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.username.trim()) return setError('Steam username is required');
    if (!isEdit && !form.password)  return setError('Password is required');

    const payload = { username: form.username.trim() };
    if (form.password)      payload.password = form.password;
    if (form.sharedSecret)  payload.sharedSecret = form.sharedSecret.trim();

    setSaving(true);
    try   { await onSave(payload); }
    catch (err) { setError(err.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit Account' : 'Add Account'}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}><IconUser /></div>
            <div>
              <div className={styles.title}>{isEdit ? 'Edit Account' : 'Add Account'}</div>
              <div className={styles.subtitle}>{isEdit ? `Editing · ${account.username}` : 'Connect a Steam account to start boosting'}</div>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close"><IconX /></button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>

          {/* Username */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="acc-username">
              Steam Username <span className={styles.required}>*</span>
            </label>
            <input
              ref={firstInputRef}
              id="acc-username"
              className={styles.input}
              value={form.username}
              onChange={set('username')}
              placeholder="your_steam_username"
              autoComplete="off"
              spellCheck="false"
            />
          </div>

          {/* Password */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="acc-password">
              {isEdit ? 'New Password' : 'Password'}{' '}
              {isEdit
                ? <span className={styles.optional}>(leave blank to keep)</span>
                : <span className={styles.required}>*</span>
              }
            </label>
            <div className={styles.inputWrap}>
              <input
                id="acc-password"
                className={styles.input}
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
          </div>

          {/* 2FA / Shared Secret */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="acc-2fa">
              Steam Guard 2FA Secret{' '}
              <span className={styles.optional}>— optional</span>
            </label>
            <input
              id="acc-2fa"
              className={styles.input}
              value={form.sharedSecret}
              onChange={set('sharedSecret')}
              placeholder="Base64 shared secret"
              autoComplete="off"
              spellCheck="false"
            />
            <div className={styles.hint}>
              <IconShield />
              Required only if Steam Guard Mobile Authenticator is active. Find it in your Steam app data.
            </div>
          </div>

          {/* Error */}
          {error && <p className={styles.error}>⚠ {error}</p>}

          {/* Actions */}
          <div className={styles.actions}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.btnSave} disabled={saving} id="acc-submit">
              {saving ? 'Saving…' : isEdit ? 'Update Account' : 'Add Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
