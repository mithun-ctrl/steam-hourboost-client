import AccountCard from './AccountCard.jsx';
import styles from './AccountGrid.module.css';

export default function AccountGrid({ accounts, onStart, onStop, onEdit, onDelete }) {
  if (accounts.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>⬡</div>
        <p className={styles.emptyTitle}>NO ACCOUNTS FOUND</p>
        <p className={styles.emptySub}>Add a Steam account to get started</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {accounts.map((account, i) => (
        <AccountCard
          key={account._id}
          account={account}
          style={{ animationDelay: `${i * 40}ms` }}
          onStart={() => onStart(account._id)}
          onStop={() => onStop(account._id)}
          onEdit={() => onEdit(account)}
          onDelete={() => onDelete(account)}
        />
      ))}
    </div>
  );
}
