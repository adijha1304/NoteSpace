import React from "react";
import { useState } from "react";
import { ArrowRight, LockKeyhole, Mail, UserRound } from "lucide-react";

export default function AuthForm({ mode, onSubmit, busy, error, onSwitch }) {
  const isSignup = mode === "register";
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const change = (event) => setValues({ ...values, [event.target.name]: event.target.value });

  function submit(event) {
    event.preventDefault();
    onSubmit(isSignup ? values : { email: values.email, password: values.password });
  }

  return <form className="auth-form" onSubmit={submit}>
    {isSignup && <label className="field"><span>Your name</span><div className="input-wrap"><UserRound size={18}/><input name="name" value={values.name} onChange={change} placeholder="Alex Morgan" minLength="2" maxLength="60" required /></div></label>}
    <label className="field"><span>Email address</span><div className="input-wrap"><Mail size={18}/><input name="email" type="email" value={values.email} onChange={change} placeholder="you@example.com" required /></div></label>
    <label className="field"><span>Password</span><div className="input-wrap"><LockKeyhole size={18}/><input name="password" type="password" value={values.password} onChange={change} placeholder="At least 8 characters" minLength="8" maxLength="128" required /></div></label>
    {error && <div className="form-error" role="alert">{error}</div>}
    <button className="primary-btn full-btn" disabled={busy}>{busy ? "Please wait…" : isSignup ? "Create account" : "Sign in"} <ArrowRight size={17}/></button>
    <p className="switch-copy">{isSignup ? "Already have an account?" : "New to NoteSpace?"} <button type="button" className="text-btn" onClick={onSwitch}>{isSignup ? "Sign in" : "Create an account"}</button></p>
  </form>;
}
