"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import type { DailyLog } from "@/types";
import styles from "./log.module.css";

const MOODS: { value: DailyLog["mood"]; label: string; color: string }[] = [
  { value: "on-fire", label: "on fire", color: "var(--mood-on-fire)" },
  { value: "focused", label: "focused", color: "var(--mood-focused)" },
  { value: "scattered", label: "scattered", color: "var(--mood-scattered)" },
  { value: "just-existing", label: "just existing", color: "var(--mood-just-existing)" },
  { value: "dead", label: "dead", color: "var(--mood-dead)" },
];

export default function LogForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");
  const date = dateParam || format(new Date(), "yyyy-MM-dd");
  const isToday = date === format(new Date(), "yyyy-MM-dd");

  const [planned, setPlanned] = useState("");
  const [actual, setActual] = useState("");
  const [reflection, setReflection] = useState("");
  const [mood, setMood] = useState<DailyLog["mood"]>("just-existing");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function fetchExisting() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", date)
        .single();

      if (data) {
        setPlanned(data.planned);
        setActual(data.actual);
        setReflection(data.reflection);
        setMood(data.mood);
        setExistingId(data.id);
      }
      setFetching(false);
    }
    fetchExisting();
  }, [date]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = { user_id: user.id, date, planned, actual, reflection, mood };

    if (existingId) {
      await supabase.from("daily_logs").update(payload).eq("id", existingId);
    } else {
      await supabase.from("daily_logs").insert(payload);
    }

    setSaved(true);
    setLoading(false);
    setTimeout(() => router.push("/dashboard"), 800);
  }

  if (fetching) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <p className={styles.loading}>loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <Link href="/dashboard" className={styles.back}>← dashboard</Link>

        <div className={styles.dateHeader}>
          <span className={styles.dateLabel}>
            {isToday ? "today" : format(new Date(date + "T00:00:00"), "EEEE, MMMM d")}
          </span>
          {existingId && <span className={styles.editBadge}>editing</span>}
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              <span className={styles.fieldNum}>01</span>
              what did you plan to do?
            </label>
            <textarea
              className={styles.textarea}
              value={planned}
              onChange={(e) => setPlanned(e.target.value)}
              placeholder="Be specific. What was on your list?"
              rows={3}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              <span className={styles.fieldNum}>02</span>
              what did you actually do?
            </label>
            <textarea
              className={styles.textarea}
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              placeholder="Be honest. No one else is reading this."
              rows={3}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              <span className={styles.fieldNum}>03</span>
              why was there a gap? (max 3 sentences)
            </label>
            <textarea
              className={styles.textarea}
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="No excuses needed. Just the truth."
              rows={3}
              required
            />
            <span className={styles.hint}>
              {reflection.split(".").filter((s) => s.trim()).length}/3 sentences
            </span>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              <span className={styles.fieldNum}>04</span>
              how would you rate today?
            </label>
            <div className={styles.moodGrid}>
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  className={`${styles.moodBtn} ${mood === m.value ? styles.moodBtnActive : ""}`}
                  onClick={() => setMood(m.value)}
                  style={mood === m.value ? { borderColor: m.color, color: m.color } : {}}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className={`${styles.submit} ${saved ? styles.submitDone : ""}`}
            disabled={loading || saved}
          >
            {saved ? "✓ saved" : loading ? "saving..." : "commit to audit →"}
          </button>
        </form>
      </div>
    </main>
  );
}
