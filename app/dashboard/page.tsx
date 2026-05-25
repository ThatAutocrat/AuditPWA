import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { format, subDays, parseISO } from "date-fns";
import type { DailyLog } from "@/types";
import styles from "./dashboard.module.css";

const MOOD_LABELS: Record<DailyLog["mood"], string> = {
  focused: "🟢 focused",
  "on-fire": "🔥 on fire",
  scattered: "🟡 scattered",
  "just-existing": "⚪ just existing",
  dead: "⚫ dead",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const today = format(new Date(), "yyyy-MM-dd");

  // Fetch last 7 logs
  const { data: logs } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(7);

  const todayLog = logs?.find((l) => l.date === today);
  const recentLogs = (logs || []).filter((l) => l.date !== today).slice(0, 5);

  // Calculate current streak
  let streak = 0;
  let checkDate = todayLog ? new Date() : subDays(new Date(), 1);
  const logDates = new Set(logs?.map((l) => l.date) || []);
  while (logDates.has(format(checkDate, "yyyy-MM-dd"))) {
    streak++;
    checkDate = subDays(checkDate, 1);
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div>
            <p className={styles.greeting}>
              {format(new Date(), "EEEE, MMMM d")}
            </p>
            <h1 className={styles.title}>Your Audit</h1>
          </div>
          <nav className={styles.nav}>
            <Link href="/portrait" className={styles.navLink}>
              portrait
            </Link>
            <form action="/api/auth/signout" method="POST">
              <button className={styles.navLink} type="submit">
                out
              </button>
            </form>
          </nav>
        </header>

        {/* Streak */}
        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{streak}</span>
            <span className={styles.statLabel}>day streak</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{logs?.length ?? 0}</span>
            <span className={styles.statLabel}>total logs</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>
              {logs && logs.length > 0
                ? Math.round(
                    (logs.filter(
                      (l) => l.mood === "focused" || l.mood === "on-fire"
                    ).length /
                      logs.length) *
                      100
                  )
                : 0}
              %
            </span>
            <span className={styles.statLabel}>sharp days</span>
          </div>
        </div>

        {/* Today's CTA */}
        {todayLog ? (
          <div className={styles.todayDone}>
            <div className={styles.todayDoneHeader}>
              <span className={styles.checkmark}>✓</span>
              <span>today&apos;s audit complete</span>
            </div>
            <p className={styles.todayMood}>{MOOD_LABELS[todayLog.mood as DailyLog["mood"]]}</p>
            <Link href="/log" className={styles.editLink}>
              edit today →
            </Link>
          </div>
        ) : (
          <Link href="/log" className={styles.todayCta}>
            <span className={styles.ctaLabel}>today&apos;s audit</span>
            <span className={styles.ctaArrow}>→</span>
            <p className={styles.ctaSub}>
              What did you plan? What actually happened?
            </p>
          </Link>
        )}

        {/* Recent logs */}
        {recentLogs.length > 0 && (
          <div className={styles.recent}>
            <h2 className={styles.sectionTitle}>recent</h2>
            <div className={styles.logList}>
              {recentLogs.map((log) => (
                <Link
                  key={log.id}
                  href={`/log?date=${log.date}`}
                  className={styles.logItem}
                >
                  <div className={styles.logDate}>
                    {format(parseISO(log.date), "EEE d")}
                  </div>
                  <div className={styles.logPreview}>
                    <p className={styles.logPlanned}>{log.planned}</p>
                    <p className={styles.logMood}>
                      {MOOD_LABELS[log.mood as DailyLog["mood"]]}
                    </p>
                  </div>
                  <span className={styles.logArrow}>→</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {logs?.length === 0 && (
          <div className={styles.empty}>
            <p>No audits yet.</p>
            <p className={styles.emptyMuted}>
              Start today. It only takes 2 minutes.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
