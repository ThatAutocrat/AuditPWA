import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { format, subDays } from "date-fns";
import type { DailyLog } from "@/types";
import styles from "./portrait.module.css";

const MOOD_COLORS: Record<DailyLog["mood"], string> = {
  "on-fire": "#ff6b35",
  focused: "#b8ff3c",
  scattered: "#ffb23c",
  "just-existing": "#555555",
  dead: "#2a2a2a",
};

export default async function PortraitPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd");

  const { data: logs } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", thirtyDaysAgo)
    .order("date", { ascending: true });

  const totalLogs = logs?.length || 0;
  const completionRate = Math.round((totalLogs / 30) * 100);

  const moodCounts = (logs || []).reduce<Record<DailyLog["mood"], number>>((acc, log) => {
    const mood = log.mood as DailyLog["mood"];
    acc[mood] = (acc[mood] || 0) + 1;
    return acc;
  }, {} as Record<DailyLog["mood"], number>);

  const heatmapDays = Array.from({ length: 30 }, (_, i) => {
    const d = format(subDays(new Date(), 29 - i), "yyyy-MM-dd");
    const log = logs?.find((l) => l.date === d);
    return { date: d, log: log || null };
  });

  const stopWords = new Set(["the", "a", "i", "to", "and", "of", "it", "was", "is", "in", "my", "me", "had", "but", "so", "did", "not", "for", "on", "got", "just", "very", "too", "that", "this", "with", "have", "didn't", "couldn't", "because"]);
  const wordFreq: Record<string, number> = {};
  (logs || []).forEach((log) => {
    const words = (log.reflection as string).toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/);
    words.forEach((w: string) => {
      if (w.length > 3 && !stopWords.has(w)) {
        wordFreq[w] = (wordFreq[w] || 0) + 1;
      }
    });
  });
  const topWords = Object.entries(wordFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([word, count]) => ({ word, count }));

  const sharpDays = (logs || []).filter(
    (l) => l.mood === "focused" || l.mood === "on-fire"
  ).length;

  const dominantMood = Object.entries(moodCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] as DailyLog["mood"] | undefined;

  const noData = totalLogs === 0;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <Link href="/dashboard" className={styles.back}>← dashboard</Link>

        <div className={styles.header}>
          <h1 className={styles.title}>Your Portrait</h1>
          <p className={styles.subtitle}>last 30 days — no flattery</p>
        </div>

        {noData ? (
          <div className={styles.noData}>
            <p>No data yet.</p>
            <p className={styles.noDataSub}>
              Start logging daily. Your portrait reveals itself after a week.
            </p>
            <Link href="/log" className={styles.startLink}>
              log today →
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.statsGrid}>
              <div className={styles.statBlock}>
                <span className={styles.statNum}>{completionRate}%</span>
                <span className={styles.statLabel}>days logged</span>
                <span className={styles.statSub}>{totalLogs} of 30 days</span>
              </div>
              <div className={styles.statBlock}>
                <span className={styles.statNum}>{sharpDays}</span>
                <span className={styles.statLabel}>sharp days</span>
                <span className={styles.statSub}>focused or on fire</span>
              </div>
              <div className={styles.statBlock}>
                <span
                  className={styles.statNum}
                  style={{ color: dominantMood ? MOOD_COLORS[dominantMood] : "var(--text)" }}
                >
                  {dominantMood?.replace("-", " ") || "—"}
                </span>
                <span className={styles.statLabel}>dominant mood</span>
                <span className={styles.statSub}>most frequent</span>
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>activity heatmap</h2>
              <div className={styles.heatmap}>
                {heatmapDays.map(({ date, log }) => (
                  <div
                    key={date}
                    className={styles.heatCell}
                    title={`${date}${log ? ` — ${log.mood}` : " — no log"}`}
                    style={{
                      background: log
                        ? MOOD_COLORS[log.mood as DailyLog["mood"]]
                        : "var(--bg-3)",
                    }}
                  />
                ))}
              </div>
              <div className={styles.heatLegend}>
                {Object.entries(MOOD_COLORS).map(([mood, color]) => (
                  <div key={mood} className={styles.legendItem}>
                    <span className={styles.legendDot} style={{ background: color }} />
                    <span>{mood.replace("-", " ")}</span>
                  </div>
                ))}
                <div className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: "var(--bg-3)" }} />
                  <span>not logged</span>
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>mood breakdown</h2>
              <div className={styles.moodBreakdown}>
                {Object.entries(moodCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([mood, count]) => (
                    <div key={mood} className={styles.moodBar}>
                      <span className={styles.moodBarLabel}>{mood.replace("-", " ")}</span>
                      <div className={styles.moodBarTrack}>
                        <div
                          className={styles.moodBarFill}
                          style={{
                            width: `${(count / totalLogs) * 100}%`,
                            background: MOOD_COLORS[mood as DailyLog["mood"]],
                          }}
                        />
                      </div>
                      <span className={styles.moodBarCount}>{count}</span>
                    </div>
                  ))}
              </div>
            </div>

            {topWords.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>your excuse patterns</h2>
                <p className={styles.sectionSub}>
                  Words that keep showing up in your reflections.
                </p>
                <div className={styles.wordCloud}>
                  {topWords.map(({ word, count }) => (
                    <div key={word} className={styles.wordChip}>
                      <span className={styles.wordText}>{word}</span>
                      <span className={styles.wordCount}>×{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.honestBox}>
              <h2 className={styles.honestTitle}>the honest take</h2>
              <p className={styles.honestText}>
                {completionRate < 30
                  ? `You've only logged ${completionRate}% of days. The data can't tell you much yet — but the avoidance might already be saying something.`
                  : completionRate < 60
                  ? `You're showing up ${completionRate}% of the time. Inconsistent, but not lost. The ${30 - totalLogs} missed days are the real story.`
                  : sharpDays / totalLogs > 0.6
                  ? `${completionRate}% logged, ${Math.round((sharpDays / totalLogs) * 100)}% sharp days. You're more consistent than you probably think you are.`
                  : `You're logging consistently but mostly in the middle. "${dominantMood?.replace("-", " ")}" dominates. Worth asking what's flattening you.`}
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
