import Link from "next/link";
import { CameraIcon, CheckIcon, CloseIcon, LockIcon, PauseIcon } from "@/components/icons";
import screen from "@/components/Screen.module.css";
import styles from "./record.module.css";

// M0: layout only. Recording, waveform and live transcript arrive in M2.
const BARS = Array.from({ length: 36 }, (_, i) => i);

export default function RecordPage() {
  return (
    <>
      <header className={screen.topBar}>
        <Link href="/" className={screen.iconButton} aria-label="Discard memo">
          <CloseIcon />
        </Link>
        <div className={styles.statusPill}>
          <span className={styles.statusDot} aria-hidden="true" />
          <span>Not recording</span>
        </div>
        <div className={styles.spacer} aria-hidden="true" />
      </header>

      <main className={styles.main}>
        <div className={styles.timerBlock}>
          <div className={styles.timer} role="timer" aria-label="Recording length">
            0:00
          </div>
          <p className={styles.hint}>Ramble freely. I’ll tidy up.</p>
        </div>

        <div className={styles.wave} aria-hidden="true">
          {BARS.map((i) => (
            <div key={i} className={styles.bar} />
          ))}
        </div>

        <section aria-label="Live transcript" className={styles.transcript}>
          <p className={styles.transcriptEmpty}>Recording isn’t wired up yet. Your words will show up here as you talk.</p>
        </section>
      </main>

      <div className={styles.controls}>
        <div className={styles.control}>
          <button type="button" className={styles.roundButton} aria-label="Pause" disabled>
            <PauseIcon />
          </button>
          <span className={styles.controlLabel}>Pause</span>
        </div>
        <div className={`${styles.control} ${styles.controlMain}`}>
          <button type="button" className={styles.doneButton} aria-label="Done, hand to Carl" disabled>
            <CheckIcon />
          </button>
          <span className={styles.doneLabel}>Hand to Carl</span>
        </div>
        <div className={styles.control}>
          <button type="button" className={styles.roundButton} aria-label="Attach a photo, like a receipt" disabled>
            <CameraIcon />
          </button>
          <span className={styles.controlLabel}>Add receipt</span>
        </div>
      </div>

      <p className={styles.footnote}>
        <LockIcon />
        <span>Once you hand it over, you can close the app.</span>
      </p>
    </>
  );
}
