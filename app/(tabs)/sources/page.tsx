import screen from "@/components/Screen.module.css";
import styles from "./sources.module.css";

const SOURCES = [
  { name: "Gmail", what: "Mail worth your time" },
  { name: "Google Calendar", what: "Today’s schedule" },
  { name: "Obsidian", what: "Recent notes and open to-dos" },
  { name: "Apple Notes", what: "Notes edited today" },
  { name: "Apple Reminders", what: "What’s due" },
];

export default function SourcesPage() {
  return (
    <>
      <header className={screen.pageHeader}>
        <div className={screen.pageHeaderText}>
          <h1 className={screen.pageTitle}>Sources</h1>
          <p className={screen.pageSubtitle}>Where I look to build your day.</p>
        </div>
      </header>

      <main className={screen.main}>
        <ul className={styles.list}>
          {SOURCES.map((s) => (
            <li key={s.name} className={styles.row}>
              <div className={styles.text}>
                <span className={styles.name}>{s.name}</span>
                <span className={styles.what}>{s.what}</span>
              </div>
              <span className={styles.status}>Not connected</span>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
