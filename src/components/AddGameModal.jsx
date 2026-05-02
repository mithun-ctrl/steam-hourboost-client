import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../utils/api.js';
import styles from './AddGameModal.module.css';

/* ── Icons ── */
const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconSearch = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconGamepad = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="12" x2="18" y2="12"/><line x1="9" y1="9" x2="9" y2="15"/>
    <rect x="2" y="6" width="20" height="12" rx="2"/>
    <circle cx="15" cy="10" r="1" fill="currentColor"/>
    <circle cx="17" cy="12" r="1" fill="currentColor"/>
  </svg>
);
const IconSpinner = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
);
const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function AddGameModal({ existingGameIds = [], onAdd, onClose }) {
  const [query, setQuery]           = useState('');
  const [results, setResults]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [selected, setSelected]     = useState(null);   // { appid, name, image }
  const [dropOpen, setDropOpen]     = useState(false);
  const [error, setError]           = useState('');
  const [adding, setAdding]         = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);

  const inputRef    = useRef(null);
  const dropRef     = useRef(null);
  const controllerRef = useRef(null);

  const debouncedQuery = useDebounce(query, 300);

  // Focus input on open
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Search Steam when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      setDropOpen(false);
      setLoading(false);
      return;
    }

    // Abort previous request
    controllerRef.current?.abort();

    setLoading(true);
    setError('');

    api.get(`/games/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then(({ data }) => {
        setResults(data.items || []);
        setDropOpen(true);
        setHighlightIdx(-1);
      })
      .catch((err) => {
        if (err.name !== 'CanceledError') {
          setError('Steam search failed. Try again.');
          setResults([]);
        }
      })
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  // Keyboard nav in dropdown
  const handleKeyDown = useCallback((e) => {
    if (!dropOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIdx >= 0) pickGame(results[highlightIdx]);
    }
  }, [dropOpen, results, highlightIdx]);

  const pickGame = (game) => {
    setSelected(game);
    setQuery(game.name);
    setDropOpen(false);
    setResults([]);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setSelected(null); // clear selection when typing again
    setError('');
  };

  const handleAdd = async () => {
    if (!selected) return setError('Please select a game from the list.');
    if (existingGameIds.includes(selected.appid)) return setError(`${selected.name} is already in your list.`);

    setAdding(true);
    try {
      await onAdd(selected);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add game.');
    } finally {
      setAdding(false);
    }
  };

  const alreadyAdded = selected && existingGameIds.includes(selected.appid);

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Add Game">

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}><IconGamepad /></div>
            <div>
              <div className={styles.title}>Add Game</div>
              <div className={styles.subtitle}>Search your Steam library by game name</div>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            <IconX />
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>

          {/* Search input + dropdown */}
          <div className={styles.searchWrap} ref={dropRef}>
            <label className={styles.label} htmlFor="game-search">Game Name</label>

            <div className={`${styles.inputRow} ${dropOpen && results.length > 0 ? styles.inputRowOpen : ''}`}>
              <span className={`${styles.searchIcon} ${loading ? styles.spinning : ''}`}>
                {loading ? <IconSpinner /> : <IconSearch />}
              </span>
              <input
                ref={inputRef}
                id="game-search"
                className={styles.input}
                type="text"
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => results.length > 0 && setDropOpen(true)}
                placeholder="e.g. Counter-Strike 2"
                autoComplete="off"
                spellCheck="false"
                aria-autocomplete="list"
                aria-expanded={dropOpen}
              />
              {query && (
                <button
                  className={styles.clearBtn}
                  onClick={() => { setQuery(''); setSelected(null); setResults([]); setDropOpen(false); inputRef.current?.focus(); }}
                  aria-label="Clear search"
                >
                  <IconX />
                </button>
              )}
            </div>

            {/* Dropdown */}
            {dropOpen && results.length > 0 && (
              <div className={styles.dropdown} role="listbox">
                {results.map((game, i) => {
                  const isDuplicate = existingGameIds.includes(game.appid);
                  return (
                    <button
                      key={game.appid}
                      className={`${styles.dropItem} ${highlightIdx === i ? styles.dropItemHighlight : ''} ${isDuplicate ? styles.dropItemDuplicate : ''}`}
                      onClick={() => !isDuplicate && pickGame(game)}
                      role="option"
                      aria-selected={highlightIdx === i}
                      aria-disabled={isDuplicate}
                      tabIndex={-1}
                    >
                      <img
                        className={styles.dropImg}
                        src={game.image}
                        alt=""
                        loading="lazy"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                      <div className={styles.dropMeta}>
                        <span className={styles.dropName}>{game.name}</span>
                        <span className={styles.dropId}>App #{game.appid}</span>
                      </div>
                      {isDuplicate && <span className={styles.dupBadge}>Added</span>}
                    </button>
                  );
                })}
              </div>
            )}

            {/* No results */}
            {dropOpen && results.length === 0 && !loading && query.length >= 2 && (
              <div className={styles.dropdown}>
                <div className={styles.noResults}>
                  <IconGamepad />
                  <span>No games found for "{query}"</span>
                </div>
              </div>
            )}
          </div>

          {/* Selected game preview */}
          {selected && (
            <div className={`${styles.preview} ${alreadyAdded ? styles.previewWarn : ''}`}>
              <img
                className={styles.previewImg}
                src={selected.image}
                alt={selected.name}
                onError={e => { e.target.style.display = 'none'; }}
              />
              <div className={styles.previewInfo}>
                <span className={styles.previewName}>{selected.name}</span>
                <span className={styles.previewId}>App ID: {selected.appid}</span>
              </div>
              {alreadyAdded && <span className={styles.previewWarnText}>Already added</span>}
            </div>
          )}

          {/* Error */}
          {error && <p className={styles.error}>⚠ {error}</p>}

          {/* Limit note */}
          <p className={styles.note}>
            💡 You can idle up to <strong>32 games</strong> simultaneously per account.
          </p>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.btnCancel} onClick={onClose}>Cancel</button>
          <button
            className={styles.btnAdd}
            onClick={handleAdd}
            disabled={!selected || adding || alreadyAdded}
            id="game-add-btn"
          >
            {adding ? 'Adding…' : <><IconPlus /> Add Game</>}
          </button>
        </div>
      </div>
    </div>
  );
}
