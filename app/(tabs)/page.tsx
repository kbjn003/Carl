import { SettingsIcon } from "@/components/icons";
import screen from "@/components/Screen.module.css";
import Glance from "./Glance";
import styles from "./today.module.css";

const SOURCES = ["Gmail", "Calendar", "Obsidian", "Notes", "Reminders"];

export default function TodayPage() {
  return (
    <>
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={screen.mark} aria-hidden="true">
            C
          </div>
          <span className={styles.brandName}>Carl</span>
        </div>
        <button type="button" className={screen.iconButton} aria-label="Settings" disabled>
          <SettingsIcon />
        </button>
      </header>

      <main className={styles.main}>
        <section aria-label="Your day at a glance" className={styles.glance}>
          <Glance />
          <p className={screen.carl}>Nothing to report yet. I’ll fill this in once I can see your sources.</p>
          <ul className={styles.chips} aria-label="Sources">
            {SOURCES.map((name) => (
              <li key={name} className={styles.chip}>
                <span className={styles.dot} aria-hidden="true" />
                {name}
              </li>
            ))}
            <li className={styles.synced}>Not synced yet</li>
          </ul>
        </section>

        <div className={screen.empty}>
          <p className={screen.emptyTitle}>Schedule, mail, due items and notes</p>
          <p className={screen.emptyCarl}>They’ll line up here. For now, tap Talk and tell me what’s on your mind.</p>
        </div>
      </main>
    </>
  );
}
