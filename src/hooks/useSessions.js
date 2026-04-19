import { useCallback } from 'react';
import api from '../utils/api.js';

export const useSessions = () => {
  const startSession = useCallback(async (id) => {
    const { data } = await api.post(`/sessions/${id}/start`);
    return data;
  }, []);

  const stopSession = useCallback(async (id) => {
    const { data } = await api.post(`/sessions/${id}/stop`);
    return data;
  }, []);

  const startAll = useCallback(async () => {
    const { data } = await api.post('/sessions/start-all');
    return data;
  }, []);

  const stopAll = useCallback(async () => {
    const { data } = await api.post('/sessions/stop-all');
    return data;
  }, []);

  return { startSession, stopSession, startAll, stopAll };
};
