"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { MemosIcon, MicIcon, SourcesIcon, TodayIcon, WorkboardIcon } from "./icons";
import styles from "./BottomNav.module.css";

type Tab = { href: string; label: string; Icon: ComponentType };

const LEFT: Tab[] = [
  { href: "/", label: "Today", Icon: TodayIcon },
  { href: "/memos", label: "Memos", Icon: MemosIcon },
];
const RIGHT: Tab[] = [
  { href: "/workboard", label: "Workboard", Icon: WorkboardIcon },
  { href: "/sources", label: "Sources", Icon: SourcesIcon },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/** `waiting` is the Workboard badge count: items waiting on the user. Hidden at 0. */
export default function BottomNav({ waiting = 0 }: { waiting?: number }) {
  const pathname = usePathname();

  const tab = ({ href, label, Icon }: Tab) => {
    const active = isActive(pathname, href);
    return (
      <Link key={href} href={href} className={styles.tab} aria-current={active ? "page" : undefined}>
        <Icon />
        <span>{label}</span>
        {href === "/workboard" && waiting > 0 && (
          <span className={styles.badge} aria-label={`${waiting} waiting`}>
            {waiting}
          </span>
        )}
      </Link>
    );
  };

  return (
    <nav aria-label="Primary" className={styles.nav}>
      {LEFT.map(tab)}
      <div className={styles.talk}>
        <Link href="/record" className={styles.talkButton} aria-label="Talk to Carl, record a voice memo">
          <MicIcon />
        </Link>
        <span className={styles.talkLabel} aria-hidden="true">
          Talk
        </span>
      </div>
      {RIGHT.map(tab)}
    </nav>
  );
}
