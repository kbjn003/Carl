import styles from "@/components/Screen.module.css";

// Record and Memo detail hide the bottom bar.
export default function FocusLayout({ children }: LayoutProps<"/">) {
  return <div className={styles.shell}>{children}</div>;
}
