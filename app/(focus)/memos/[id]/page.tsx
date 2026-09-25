import Link from "next/link";
import { BackIcon, MoreIcon } from "@/components/icons";
import screen from "@/components/Screen.module.css";
import styles from "./memo.module.css";

// M0: chrome only. Memo content arrives with the data layer (M1) and actions (M4).
export default function MemoPage() {
  return (
    <>
      <header className={screen.topBar}>
        <Link href="/memos" className={`${screen.iconButton} ${styles.back}`} aria-label="Back to Memos">
          <BackIcon />
        </Link>
        <h1 className={styles.title}>Memo</h1>
        <button type="button" className={screen.iconButton} aria-label="More options" disabled>
          <MoreIcon />
        </button>
      </header>

      <main className={styles.main}>
        <div className={styles.summary}>
          <div className={screen.mark} aria-hidden="true">
            C
          </div>
          <p className={styles.summaryText}>I can’t find that one. Memos show up here once there are some.</p>
        </div>
      </main>
    </>
  );
}
