import { FormEvent, ReactNode, useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { supabase } from "../lib/supabase";
import { firebaseAuth, googleProvider } from "../lib/firebase";
import { getRedirectResult, signInWithPopup, signInWithRedirect, type AuthError } from "firebase/auth";
import { signInWithFirebase } from "../api/clink";
import "./auth.css";

export function AuthGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Awaited<ReturnType<NonNullable<typeof supabase>["auth"]["getSession"]>>["data"]["session"]>(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const client = supabase;
    if (!firebaseAuth || !googleProvider || !client) return;
    getRedirectResult(firebaseAuth).then(async (result) => {
      if (!result) return;
      setBusy(true); setError(null);
      const workspaceSession = await signInWithFirebase(await result.user.getIdToken(true));
      const { error: sessionError } = await client.auth.setSession(workspaceSession);
      if (sessionError) setError(sessionError.message);
      setBusy(false);
    }).catch((oauthError: unknown) => {
      setError(oauthError instanceof Error ? oauthError.message : "Google sign-in could not be completed.");
      setBusy(false);
    });
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true); setError(null);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    const result = mode === "signin"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    if (result.error) setError(result.error.message);
    else if (mode === "signup" && !result.data.session) setError("Check your email to confirm the new account, then sign in.");
    setBusy(false);
  }

  async function continueWithGoogle() {
    if (!supabase) return;
    setBusy(true); setError(null);
    if (!firebaseAuth || !googleProvider) { setError("Google Sign-In is not configured."); setBusy(false); return; }
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const session = await signInWithFirebase(await result.user.getIdToken(true));
      const { error: sessionError } = await supabase.auth.setSession(session);
      if (sessionError) { setError(sessionError.message); setBusy(false); }
    } catch (oauthError: unknown) {
      const code = (oauthError as AuthError | undefined)?.code || "";
      if (code === "auth/popup-blocked" || code === "auth/popup-closed-by-user") {
        try { await signInWithRedirect(firebaseAuth, googleProvider); return; }
        catch { setError("Google sign-in could not open. Please allow pop-ups and try again."); }
      } else if (code === "auth/unauthorized-domain") {
        setError("This C-Link domain is not authorized for Google sign-in yet.");
      } else {
        setError(oauthError instanceof Error ? oauthError.message : "Google Sign-In failed.");
      }
      setBusy(false);
    }
  }

  if (loading) return <AuthShell><div className="auth-loading">Preparing secure workspace…</div></AuthShell>;
  if (!supabase) return <AuthShell><h1>Authentication is not configured</h1><p>Set the Supabase public URL and anon key before opening the owner workspace.</p></AuthShell>;
  if (session) return <>{children}</>;

  return <AuthShell><div className="auth-mark"><ShieldCheck size={22} /></div><p className="auth-eyebrow">C-LINK OWNER ACCESS</p><h1>{mode === "signin" ? "Sign in to your workspace" : "Create your workspace access"}</h1><p className="auth-subtitle">Your commitments stay private. Recipient share links remain accessible without an owner login.</p><button className="google-button" disabled={busy} onClick={continueWithGoogle}><GoogleMark />Continue with Google</button><div className="auth-divider"><span>or continue with email</span></div><form onSubmit={submit} className="auth-form"><label>Email<input name="email" type="email" autoComplete="email" required placeholder="you@business.com" /></label><label>Password<input name="password" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} minLength={6} required placeholder="At least 6 characters" /></label>{error && <p className="auth-error">{error}</p>}<button className="primary-button" disabled={busy}>{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</button></form><button className="auth-switch" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}>{mode === "signin" ? "Need an account? Create one" : "Already have an account? Sign in"}</button></AuthShell>;
}

function GoogleMark() { return <svg className="google-mark" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.35 12.27c0-.72-.06-1.41-.18-2.07H12v3.92h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.2 2.91-7.24Z"/><path fill="#34A853" d="M12 21.7c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.55 0-4.71-1.72-5.49-4.04H3.26v2.53A9.74 9.74 0 0 0 12 21.7Z"/><path fill="#FBBC05" d="M6.51 13.77a5.85 5.85 0 0 1 0-3.54V7.7H3.26a9.75 9.75 0 0 0 0 8.6l3.25-2.53Z"/><path fill="#EA4335" d="M12 6.19c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.24 14.63 2.3 12 2.3a9.74 9.74 0 0 0-8.74 5.4l3.25 2.53C7.29 7.91 9.45 6.19 12 6.19Z"/></svg>; }

function AuthShell({ children }: { children: ReactNode }) { return <main className="auth-shell"><section className="auth-card"><div className="auth-brand"><span className="auth-brand-mark">C</span><strong>C-Link</strong><span>Private business workspace</span></div>{children}</section></main>; }
