import { useEffect, useRef, useCallback } from 'react';
import { API_BASE_URL } from '../services/api';

const WS_BASE = API_BASE_URL.replace(/^http/, 'ws');
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 2000;

export default function usePaymentWebSocket(billId, token, onUpdate) {
  const wsRef = useRef(null);
  const retriesRef = useRef(0);
  const cancelledRef = useRef(false);

  const connect = useCallback(() => {
    if (!billId || !token || cancelledRef.current) return;

    const url = `${WS_BASE}/bills/${billId}/ws?token=${token}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => { retriesRef.current = 0; };

    ws.onmessage = (event) => {
      if (cancelledRef.current) return;
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'assignment_update' || msg.type === 'payment_update') {
          onUpdate(msg);
        }
      } catch {
        // ignore malformed messages
      }
    };

    ws.onerror = () => {};

    ws.onclose = () => {
      wsRef.current = null;
      if (cancelledRef.current) return;
      if (retriesRef.current < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, retriesRef.current);
        retriesRef.current += 1;
        setTimeout(() => {
          if (!cancelledRef.current) connect();
        }, delay);
      }
    };
  }, [billId, token, onUpdate]);

  useEffect(() => {
    cancelledRef.current = false;
    retriesRef.current = 0;
    connect();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && !wsRef.current && !cancelledRef.current) {
        retriesRef.current = 0;
        connect();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelledRef.current = true;
      document.removeEventListener('visibilitychange', handleVisibility);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);
}
