import { useAuth } from '../context/AuthContext.jsx';
import styles from './SettingsPage.module.css';

const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconZap = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const PLAN_FEATURES = {
  free: ['3 Steam account', 'Up to 32 games per account', 'Basic session control', 'VAC Safety'],
  pro: ['10 accounts', 'Up to 32 games per account', 'Priority session control', 'Advanced scheduling', 'Email alerts', 'VAC Safety'],
  ultimate: ['Unlimited accounts', 'Up to 32 games per account', 'Priority session control', 'Advanced scheduling', 'Email alerts','VAC Safety', 'API access'],
};

export default function SettingsPage() {
  const { user } = useAuth();
  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : '??';

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Settings</h1>
        <p className={styles.pageSubtitle}>Manage your account and subscription</p>
      </div>

      {/* Profile Section */}
      <section className={styles.section}>
        <div className={styles.sectionLabel}>
          <IconUser /> Profile
        </div>
        <div className={styles.card}>
          <div className={styles.profileRow}>
            <div className={styles.profileAvatar}>{initials}</div>
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>{user?.username || 'User'}</span>
              <span className={styles.profileMeta}>Free Plan · Member since 2025</span>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Username</label>
              <input
                className={styles.input}
                value={user?.username || ''}
                readOnly
                placeholder="username"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Email</label>
              <input
                className={styles.input}
                value=""
                readOnly
                placeholder="Not configured"
              />
            </div>
          </div>

          <div className={styles.cardFooter}>
            <button className={styles.btnSecondary} disabled>Update Profile</button>
          </div>
        </div>
      </section>

      {/* Subscription Section */}
      <section className={styles.section}>
        <div className={styles.sectionLabel}>
          <IconZap /> Subscription
        </div>
        <div className={styles.plansGrid}>
          {/* Free plan */}
          <div className={`${styles.planCard} ${styles.planCardActive}`}>
            <div className={styles.planHeader}>
              <div>
                <div className={styles.planName}>Free</div>
                <div className={styles.planPrice}>₹0 <span>/month</span></div>
              </div>
              <span className={styles.currentBadge}>Current plan</span>
            </div>
            <ul className={styles.featureList}>
              {PLAN_FEATURES.free.map(f => (
                <li key={f} className={styles.featureItem}>
                  <span className={styles.featureCheck}><IconCheck /></span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro plan */}
          <div className={`${styles.planCard} ${styles.planCardPro}`}>
            <div className={styles.planGradientBorder} />
            <div className={styles.planHeader}>
              <div>
                <div className={styles.planName}>
                  Pro
                  <span className={styles.proBadge}>Popular</span>
                </div>
                <div className={styles.planPrice}>₹99 <span>/month</span></div>
              </div>
            </div>
            <ul className={styles.featureList}>
              {PLAN_FEATURES.pro.map(f => (
                <li key={f} className={styles.featureItem}>
                  <span className={`${styles.featureCheck} ${styles.featureCheckAccent}`}><IconCheck /></span>
                  {f}
                </li>
              ))}
            </ul>
            <button className={styles.btnUpgrade}>Upgrade</button>
          </div>
          <div className={`${styles.planCard} ${styles.planCardPro}`}>
            <div className={styles.planGradientBorder} />
            <div className={styles.planHeader}>
              <div>
                <div className={styles.planName}>
                  Ultimate
                  {/* <span className={styles.proBadge}>Popular</span> */}
                </div>
                <div className={styles.planPrice}>₹199 <span>/month</span></div>
              </div>
            </div>
            <ul className={styles.featureList}>
              {PLAN_FEATURES.ultimate.map(f => (
                <li key={f} className={styles.featureItem}>
                  <span className={`${styles.featureCheck} ${styles.featureCheckAccent}`}><IconCheck /></span>
                  {f}
                </li>
              ))}
            </ul>
            <button className={styles.btnUpgrade}>Upgrade</button>
          </div>
        </div>
      </section>
    </div>
  );
}
