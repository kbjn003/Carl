"use client";

import { useState } from "react";
import screen from "@/components/Screen.module.css";

const FILTERS = ["All", "Needs you", "Sorted", "Filtered"] as const;
export type MemoFilter = (typeof FILTERS)[number];

export default function MemoFilters() {
  const [active, setActive] = useState<MemoFilter>("All");

  return (
    <div role="group" aria-label="Filter" className={screen.pills}>
      {FILTERS.map((f) => (
        <button
          key={f}
          type="button"
          className={screen.pill}
          aria-pressed={active === f}
          onClick={() => setActive(f)}
        >
          {f}
        </button>
      ))}
    </div>
  );
}
