import BottomNav from "@/components/BottomNav";
import styles from "@/components/Screen.module.css";

// Main screens: Today, Memos, Workboard, Sources. They share the bottom bar.
export default function TabsLayout({ children }: LayoutProps<"/">) {
  return (
    <div className={`${styles.shell} ${styles.withNav}`}>
      {children}
      <BottomNav />
    </div>
  );
}
