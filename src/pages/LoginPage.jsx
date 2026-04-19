import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') await login(username, password);
      else await register(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.grid} />
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>⬡</span>
          <span className={styles.logoText}>STEAMCTL</span>
        </div>
        <p className={styles.tagline}>Account Session Manager</p>

        <div className={styles.tabs}>
          <button className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`}
            onClick={() => setMode('login')}>SIGN IN</button>
          <button className={`${styles.tab} ${mode === 'register' ? styles.tabActive : ''}`}
            onClick={() => setMode('register')}>REGISTER</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>USERNAME</label>
            <input className={styles.input} value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="enter username" autoComplete="username" required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>PASSWORD</label>
            <input className={styles.input} type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete="current-password" required />
          </div>
          {error && <p className={styles.error}>⚠ {error}</p>}
          <button className={styles.submit} type="submit" disabled={loading}>
            {loading ? 'AUTHENTICATING...' : mode === 'login' ? 'ACCESS DASHBOARD' : 'CREATE ACCOUNT'}
          </button>
        </form>
      </div>
    </div>
  );
}
