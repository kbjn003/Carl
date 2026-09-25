import { SearchIcon } from "@/components/icons";
import screen from "@/components/Screen.module.css";
import MemoFilters from "./MemoFilters";

export default function MemosPage() {
  return (
    <>
      <header className={screen.pageHeader}>
        <div className={screen.pageHeaderText}>
          <h1 className={screen.pageTitle}>Memos</h1>
          <p className={screen.pageSubtitle}>Everything you said, already sorted.</p>
        </div>
        <button type="button" className={screen.iconButton} aria-label="Search memos" disabled>
          <SearchIcon />
        </button>
      </header>

      <MemoFilters />

      <main className={screen.main}>
        <div className={screen.empty}>
          <p className={screen.emptyTitle}>No memos yet</p>
          <p className={screen.emptyCarl}>Tap Talk and ramble. I’ll sort it out here.</p>
        </div>
      </main>
    </>
  );
}
