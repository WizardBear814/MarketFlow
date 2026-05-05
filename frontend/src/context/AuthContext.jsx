import { createContext, useContext, useEffect, useState } from "react";
import { getSession, login as apiLogin, logout as apiLogout, register as apiRegister } from "../api/auth.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getSession());
    setReady(true);
  }, []);

  async function login(credentials) {
    const u = await apiLogin(credentials);
    setUser(u);
    return u;
  }

  async function register(data) {
    const u = await apiRegister(data);
    return u;
  }

  function logout() {
    apiLogout();
    setUser(null);
  }

  const value = { user, ready, login, register, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
