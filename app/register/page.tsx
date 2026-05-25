"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "../auth.module.css";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.title}>Check your email.</h1>
          <p className={styles.subtitle}>
            Confirm your address to start auditing.
            <br />
            <span className={styles.muted}>
              (Check spam. You know how it is.)
            </span>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>

        <h1 className={styles.title}>Be honest.</h1>
        <p className={styles.subtitle}>
          No gamification. No streaks. Just daily truth.
        </p>

        <form onSubmit={handleRegister} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="you@somewhere.com"
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="••••••••"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? "creating..." : "start my audit →"}
          </button>
        </form>

        <p className={styles.switch}>
          Already auditing?{" "}
          <Link href="/login" className={styles.switchLink}>
            sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
