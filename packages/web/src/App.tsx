import { useEffect } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { SubjectDetail } from "./components/topics/TopicSection";
import { RevisionDashboard } from "./components/revisions/RevisionDashboard";
import { TestDashboard } from "./components/tests/TestDashboard";
import { useUIStore } from "./stores/ui-store";
import { useSubjects } from "./hooks/use-subjects";

function AutoSelectFirstSubject() {
  const { data: subjects = [] } = useSubjects();
  const selectedSubjectId = useUIStore((s) => s.selectedSubjectId);
  const selectSubject = useUIStore((s) => s.selectSubject);
  const view = useUIStore((s) => s.view);

  useEffect(() => {
    if (view === "subjects" && !selectedSubjectId && subjects.length > 0) {
      selectSubject(subjects[0].id);
    }
  }, [view, selectedSubjectId, subjects, selectSubject]);

  return null;
}

export function App() {
  const view = useUIStore((s) => s.view);

  return (
    <div className="flex h-screen bg-background">
      <AutoSelectFirstSubject />
      <Sidebar />
      {view === "revisions" ? <RevisionDashboard />
        : view === "tests" ? <TestDashboard />
        : <SubjectDetail />}
    </div>
  );
}
