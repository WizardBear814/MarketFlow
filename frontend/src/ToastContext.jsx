import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const bg =
    toast?.type === 'success' ? '#16a34a' : toast?.type === 'error' ? '#dc2626' : '#2563eb';

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
          }}
        >
          <div
            style={{
              padding: '12px 18px',
              borderRadius: 10,
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#fff',
              maxWidth: 320,
              background: bg,
            }}
          >
            {toast.msg}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return ctx;
}
