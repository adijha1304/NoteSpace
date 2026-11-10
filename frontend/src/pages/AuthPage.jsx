import React from "react";
import { useState } from "react";
import { NotebookPen, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthForm from "../components/AuthForm";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { authenticate } = useAuth();
  const navigate = useNavigate();

  async function submit(values) {
    setBusy(true); setError("");
    try { await authenticate(mode, values); navigate("/notes"); }
    catch (err) { setError(err.response?.data?.detail || "Could not connect. Check that the API is running."); }
    finally { setBusy(false); }
  }

  return <main className="auth-shell">
    <section className="auth-visual">
      <div className="brand brand-light"><span className="brand-mark"><NotebookPen size={21}/></span> notespace</div>
      <div className="visual-copy"><span className="eyebrow"><Sparkles size={14}/> A little space for big ideas</span><h1>Make room for<br/><em>your thoughts.</em></h1><p>Capture the little things, untangle the big ones, and keep everything that matters close.</p></div>
      <div className="visual-foot"><span>✳</span> A calmer way to collect your thoughts.</div>
      <div className="decor decor-one"></div><div className="decor decor-two"></div>
    </section>
    <section className="auth-panel">
      <div className="auth-mobile-brand brand"><span className="brand-mark"><NotebookPen size={20}/></span> notespace</div>
      <div className="auth-card">
        <span className="eyebrow muted-eyebrow">{mode === "register" ? "GET STARTED" : "WELCOME BACK"}</span>
        <h2>{mode === "register" ? "Create your space." : "Good to see you."}</h2>
        <p className="auth-subtitle">{mode === "register" ? "A fresh page is just a few details away." : "Pick up right where your thoughts left off."}</p>
        <AuthForm mode={mode} onSubmit={submit} busy={busy} error={error} onSwitch={() => {setMode(mode === "login" ? "register" : "login");setError("");}}/>
      </div>
      <p className="auth-legal">By continuing, you agree to keep your notes yours.</p>
    </section>
  </main>;
}
