import React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("notespace_token");
    if (!token) { setLoading(false); return; }
    api.get("/auth/me")
      .then(({ data }) => setUser(data))
      .catch(() => localStorage.removeItem("notespace_token"))
      .finally(() => setLoading(false));
  }, []);

  async function authenticate(mode, values) {
    const { data } = await api.post(`/auth/${mode}`, values);
    localStorage.setItem("notespace_token", data.access_token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("notespace_token");
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, authenticate, logout }}>
    {children}
  </AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
