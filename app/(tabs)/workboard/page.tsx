import screen from "@/components/Screen.module.css";
import WorkboardTabs from "./WorkboardTabs";

export default function WorkboardPage() {
  return (
    <>
      <header className={screen.pageHeader}>
        <div className={screen.pageHeaderText}>
          <h1 className={screen.pageTitle}>Workboard</h1>
          <p className={screen.pageSubtitle}>Nothing leaves without your OK.</p>
        </div>
      </header>

      <WorkboardTabs />
    </>
  );
}
