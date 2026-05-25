import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.grid} aria-hidden>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className={styles.gridLine} />
        ))}
      </div>

      <div className={styles.content}>
        <div className={styles.badge}>
          <span className={styles.dot} />
          <span>private beta</span>
        </div>

        <h1 className={styles.headline}>
          The gap between
          <br />
          <span className={styles.accent}>who you think</span>
          <br />
          you are —
          <br />
          and who you
          <br />
          <span className={styles.strike}>actually</span> are.
        </h1>

        <p className={styles.sub}>
          One honest check-in per day. No streaks. No gamification.
          <br />
          Just you and the truth about how you spend your time.
        </p>

        <div className={styles.actions}>
          <Link href="/register" className={styles.cta}>
            Start being honest →
          </Link>
          <Link href="/login" className={styles.login}>
            I already audit
          </Link>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>01</span>
            <span>Plan vs. Actual — logged daily</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>02</span>
            <span>Your 30-day self-portrait, brutally honest</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>03</span>
            <span>One accountability partner. No audience.</span>
          </div>
        </div>

        <p className={styles.footnote}>
          9pm notification. One tap to open. Works offline.
          <br />
          <span className={styles.muted}>Add to home screen for the full experience.</span>
        </p>
      </div>
    </main>
  );
}
