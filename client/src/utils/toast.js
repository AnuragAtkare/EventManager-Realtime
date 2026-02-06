import { useState, useEffect, useCallback } from 'react';

let toastId = 0;
let globalToastSetter = null;

// External trigger
export const toast = {
  success: (message) => globalToastSetter?.({ id: ++toastId, type: 'success', message }),
  error: (message) => globalToastSetter?.({ id: ++toastId, type: 'error', message }),
  info: (message) => globalToastSetter?.({ id: ++toastId, type: 'info', message }),
};

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    globalToastSetter = (t) => setToasts((prev) => [...prev, t]);
    return () => { globalToastSetter = null; };
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const latest = toasts[toasts.length - 1];
    const timer = setTimeout(() => removeToast(latest.id), 3500);
    return () => clearTimeout(timer);
  }, [toasts, removeToast]);

  return { toasts, removeToast };
};
