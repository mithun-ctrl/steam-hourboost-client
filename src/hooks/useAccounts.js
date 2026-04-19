import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api.js';

export const useAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/accounts');
      setAccounts(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const createAccount = useCallback(async (payload) => {
    const { data } = await api.post('/accounts', payload);
    setAccounts((prev) => [data, ...prev]);
    return data;
  }, []);

  const updateAccount = useCallback(async (id, payload) => {
    const { data } = await api.put(`/accounts/${id}`, payload);
    setAccounts((prev) => prev.map((a) => (a._id === id ? data : a)));
    return data;
  }, []);

  const deleteAccount = useCallback(async (id) => {
    await api.delete(`/accounts/${id}`);
    setAccounts((prev) => prev.filter((a) => a._id !== id));
  }, []);

  // Patch local status from socket events
  const patchStatus = useCallback((accountId, status, extra = {}) => {
    setAccounts((prev) =>
      prev.map((a) =>
        a._id === accountId
          ? { ...a, status, lastError: extra.error ?? a.lastError, gameIds: extra.gameIds ?? a.gameIds }
          : a
      )
    );
  }, []);

  return { accounts, loading, error, fetchAccounts, createAccount, updateAccount, deleteAccount, patchStatus };
};
