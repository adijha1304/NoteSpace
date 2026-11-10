import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import NotesPage from "./pages/NotesPage";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="loader-mark">n</div><span>Preparing your space…</span></div>;
  return user ? children : <Navigate to="/login" replace />;
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="loader-mark">n</div><span>Preparing your space…</span></div>;
  return user ? <Navigate to="/notes" replace /> : children;
}

export default function App() {
  return <AuthProvider><Routes>
    <Route path="/login" element={<GuestOnly><AuthPage/></GuestOnly>}/>
    <Route path="/notes" element={<Protected><NotesPage/></Protected>}/>
    <Route path="*" element={<Navigate to="/notes" replace/>}/>
  </Routes></AuthProvider>;
}
