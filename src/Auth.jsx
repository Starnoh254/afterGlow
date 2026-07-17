import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const MOSS = "#2F4A3C";
const OCHRE = "#B8863B";
const SAND = "#DFD4B4";
const PAPER = "#F1ECDD";
const INK = "#1B1D16";

// Call this from App.jsx to get { session, loading } and re-render on login/logout.
export function useSession() {
  const [session, setSession] = useState(undefined); // undefined = still checking
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);
  return session;
}

export function SignOutButton() {
  return (
    <button
      onClick={() => supabase.auth.signOut()}
      style={{ fontSize: 12, color: "#9A9284", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
    >
      Sign out
    </button>
  );
}

export default function AuthScreen() {
  const [mode, setMode] = useState("signup"); // signup | login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setNotice("Check your email to confirm your account, then log in.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }
    setBusy(false);
  }

  return (
    <div style={{ background: PAPER, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
      <form onSubmit={submit} style={{ background: "#fff", border: `1px solid ${SAND}`, borderRadius: 16, padding: 32, width: 340 }}>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 26, color: MOSS, marginBottom: 4 }}>Afterglow</h1>
        <p style={{ fontSize: 13, color: "#6b6558", marginBottom: 20 }}>
          {mode === "signup" ? "Create an account to start cultivating." : "Welcome back."}
        </p>

        <input
          type="email" placeholder="Email" value={email} required
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${SAND}`, marginBottom: 10, fontSize: 14 }}
        />
        <input
          type="password" placeholder="Password (min 6 characters)" value={password} required minLength={6}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${SAND}`, marginBottom: 14, fontSize: 14 }}
        />

        {error && <p style={{ color: "#A6462F", fontSize: 12.5, marginBottom: 10 }}>{error}</p>}
        {notice && <p style={{ color: MOSS, fontSize: 12.5, marginBottom: 10 }}>{notice}</p>}

        <button
          type="submit" disabled={busy}
          style={{ width: "100%", padding: "10px 0", borderRadius: 999, border: "none", background: MOSS, color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", opacity: busy ? 0.6 : 1 }}
        >
          {busy ? "Please wait…" : mode === "signup" ? "Sign up" : "Log in"}
        </button>

        <button
          type="button"
          onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setError(""); setNotice(""); }}
          style={{ width: "100%", marginTop: 12, background: "none", border: "none", color: OCHRE, fontSize: 12.5, cursor: "pointer" }}
        >
          {mode === "signup" ? "Already have an account? Log in" : "New here? Sign up"}
        </button>
      </form>
    </div>
  );
}
