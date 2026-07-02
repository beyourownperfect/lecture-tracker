import { Sidebar } from "./components/layout/Sidebar";
import { SubjectDetail } from "./components/topics/TopicSection";
import { RevisionDashboard } from "./components/revisions/RevisionDashboard";
import { TestDashboard } from "./components/tests/TestDashboard";
import { useUIStore } from "./stores/ui-store";

export function App() {
  const view = useUIStore((s) => s.view);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      {view === "revisions" ? <RevisionDashboard />
        : view === "tests" ? <TestDashboard />
        : <SubjectDetail />}
    </div>
  );
}
