import { useSubjects } from "../../hooks/use-subjects";
import { useUIStore } from "../../stores/ui-store";
import { ThemeToggle } from "../ui/theme-toggle";
import { cn } from "../../lib/utils";
import { formatDuration } from "../ui/progress";
import type { Subject } from "../../types";
import { CalendarCheck, ClipboardList, BookOpen } from "lucide-react";
import { WeeklyAISummary } from "./WeeklyAISummary";
import { StudySnapshot } from "./StudySnapshot";

export function Sidebar() {
  const { data: subjects = [] } = useSubjects();
  const { selectedSubjectId, selectSubject, view, setView } = useUIStore();

  const totalLectures = subjects.reduce((sum, s) => sum + (s.totalLectures || 0), 0);
  const completedLectures = subjects.reduce((sum, s) => sum + (s.completedLectures || 0), 0);
  const overallProgress = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;
  const totalDuration = subjects.reduce((sum, s) => sum + (s.totalDuration || 0), 0);

  return (
    <aside className="w-[320px] shrink-0 border-r border-border bg-surface flex flex-col">
      <div className="px-6 pt-6 pb-3 flex items-start justify-between">
        <div>
          <h1 className="text-base font-semibold text-text-primary tracking-tight leading-tight">
            GATE CSE
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Lecture Tracker
          </p>
        </div>
        <ThemeToggle />
      </div>

      <div className="px-4 pb-2">
        <button
          onClick={() => setView("subjects")}
          className={cn(
            "w-full text-left rounded-lg px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-ring/50 outline-none",
            view === "subjects"
              ? "bg-accent-light text-primary ring-1 ring-primary/20"
              : "hover:bg-muted text-text-secondary",
          )}
        >
          <BookOpen className="w-4 h-4" />
          Subjects
        </button>
        <button
          onClick={() => setView("revisions")}
          className={cn(
            "w-full text-left rounded-lg px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-ring/50 outline-none",
            view === "revisions"
              ? "bg-accent-light text-primary ring-1 ring-primary/20"
              : "hover:bg-muted text-text-secondary",
          )}
        >
          <CalendarCheck className="w-4 h-4" />
          Revision Tracker
        </button>
        <button
          onClick={() => setView("tests")}
          className={cn(
            "w-full text-left rounded-lg px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-ring/50 outline-none",
            view === "tests"
              ? "bg-accent-light text-primary ring-1 ring-primary/20"
              : "hover:bg-muted text-text-secondary",
          )}
        >
          <ClipboardList className="w-4 h-4" />
          Test Tracker
        </button>
      </div>

      {view === "subjects" && totalLectures > 0 && (
        <div className="px-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-text-secondary">Overall Progress</span>
            <span className="text-xs text-text-secondary tabular-nums">{overallProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-text-secondary">
              {completedLectures}/{totalLectures} lectures
            </span>
            {totalDuration > 0 && (
              <span className="text-xs text-text-secondary">
                {formatDuration(totalDuration)}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-4 scrollbar-thin">
        <div className="mb-3 pb-3 border-b border-border">
          <WeeklyAISummary />
          <StudySnapshot />
        </div>
        {subjects.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-text-secondary mb-2">No subjects loaded</p>
            <p className="text-xs text-text-secondary/50">Subjects should appear after server startup. If this persists, check the database connection.</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                isSelected={selectedSubjectId === subject.id}
                onSelect={() => selectSubject(subject.id)}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

function SubjectCard({
  subject,
  isSelected,
  onSelect,
}: {
  subject: Subject;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const total = subject.totalLectures || 0;
  const completed = subject.completedLectures || 0;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  const hasContent = total > 0;
  const duration = subject.totalDuration || 0;

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left rounded-lg px-4 py-3 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-ring/50 outline-none",
        isSelected
          ? "bg-accent-light ring-1 ring-primary/20"
          : "hover:bg-muted",
      )}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span
          className={cn(
            "text-sm font-medium",
            isSelected ? "text-primary" : "text-text-primary",
          )}
        >
          {subject.name}
        </span>
        {hasContent && (
          <span className="text-xs text-text-secondary tabular-nums">
            {progress}%
          </span>
        )}
      </div>

      {hasContent ? (
        <div>
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-text-secondary mt-1.5">
            {completed}/{total} lectures
            {duration > 0 && ` · ${formatDuration(duration)}`}
          </p>
        </div>
      ) : (
        <p className="text-xs text-text-secondary">No lectures yet</p>
      )}
    </button>
  );
}
