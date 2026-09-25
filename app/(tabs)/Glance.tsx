"use client";

import { useSyncExternalStore } from "react";
import styles from "./today.module.css";

const TICK_MS = 15_000;

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, TICK_MS);
  return () => clearInterval(id);
}
// Snapshot is the current tick so React re-renders at most every 15s.
const getSnapshot = () => Math.floor(Date.now() / TICK_MS);
const getServerSnapshot = () => null;

function dateLine(d: Date) {
  const day = d.toLocaleDateString("en-US", { weekday: "short" });
  const month = d.toLocaleDateString("en-US", { month: "short" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return `${day} · ${month} ${d.getDate()} · ${time}`.toUpperCase();
}

function greeting(d: Date) {
  const h = d.getHours();
  if (h < 5) return "Late one. Here’s your day.";
  if (h < 12) return "Morning. Here’s your day.";
  if (h < 18) return "Afternoon. Here’s your day.";
  return "Evening. Here’s your day.";
}

/** Date line + greeting. Rendered on the client so it follows the phone's clock. */
export default function Glance() {
  const tick = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const now = tick === null ? null : new Date(tick * TICK_MS);

  return (
    <>
      <span className={styles.dateLine}>{now ? dateLine(now) : " "}</span>
      <h1 className={styles.greeting}>{now ? greeting(now) : "Here’s your day."}</h1>
    </>
  );
}
