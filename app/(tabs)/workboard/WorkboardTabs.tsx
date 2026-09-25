"use client";

import { useState } from "react";
import screen from "@/components/Screen.module.css";

const TABS = [
  { id: "needs", label: "Needs you", empty: "Nothing waiting on you. Enjoy it while it lasts." },
  { id: "approved", label: "Approved", empty: "Nothing approved yet." },
  { id: "done", label: "Done", empty: "Nothing done yet." },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function WorkboardTabs() {
  const [active, setActive] = useState<TabId>("needs");
  const current = TABS.find((t) => t.id === active)!;

  return (
    <>
      <div role="tablist" aria-label="Workboard view" className={screen.segmented}>
        {TABS.map((t) => (
          <button
            key={t.id}
            id={`wb-tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={active === t.id}
            aria-controls="wb-panel"
            className={screen.segment}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main id="wb-panel" role="tabpanel" aria-labelledby={`wb-tab-${active}`} className={screen.main}>
        <div className={screen.empty}>
          <p className={screen.emptyTitle}>Tasks, drafts, invoices, expenses</p>
          <p className={screen.emptyCarl}>{current.empty}</p>
        </div>
      </main>
    </>
  );
}
