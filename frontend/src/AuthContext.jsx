import { createContext, useContext, useMemo, useState } from 'react';
import { clearAuth, getUser, saveAuth, getToken } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUser());

  const value = useMemo(
    () => ({
      user,
      login: (token, u) => {
        saveAuth(token, u);
        setUser(u);
      },
      logout: () => {
        clearAuth();
        setUser(null);
      },
      refreshFromStorage: () => setUser(getUser()),
      updateLocalUser: (nextUser) => {
        saveAuth(getToken(), nextUser);
        setUser(nextUser);
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
