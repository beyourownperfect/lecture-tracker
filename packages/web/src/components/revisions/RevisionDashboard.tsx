import { useRevisionDashboard, useUpdateRevision, useDeleteRevision } from "../../hooks/use-revisions";
import { useUIStore } from "../../stores/ui-store";
import { cn } from "../../lib/utils";
import { Check, Trash2, FileText, Layers, AlertTriangle, Calendar, ChevronRight } from "lucide-react";
import type { PopulatedRevision } from "../../types";

export function RevisionDashboard() {
  const { data, isLoading } = useRevisionDashboard();
  const selectSubject = useUIStore((s) => s.selectSubject);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-12 py-10">
          <p className="text-sm text-text-secondary">Loading revisions...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { overdue, dueToday, upcoming } = data;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-12 py-10">
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight mb-2">
          Revision Tracker
        </h1>
        <p className="text-sm text-text-secondary mb-8">
          Spaced repetition schedule for notes and flashcards
        </p>

        {overdue.length === 0 && dueToday.length === 0 && upcoming.length === 0 ? (
          <div className="text-center py-20 text-text-secondary">
            <Calendar className="w-10 h-10 mx-auto mb-3 text-text-secondary/50" />
            <p className="text-sm">No revisions scheduled yet.</p>
            <p className="text-xs mt-1">Add revision dates to lectures to start tracking.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {overdue.length > 0 && (
              <Section
                title="Overdue"
                icon={<AlertTriangle className="w-4 h-4 text-destructive" />}
                revisions={overdue}
                variant="overdue"
                onSelectSubject={selectSubject}
              />
            )}

            {dueToday.length > 0 && (
              <Section
                title="Due Today"
                icon={<Calendar className="w-4 h-4 text-amber-500" />}
                revisions={dueToday}
                variant="dueToday"
                onSelectSubject={selectSubject}
              />
            )}

            {upcoming.length > 0 && (
              <Section
                title="Upcoming (Next 7 Days)"
                icon={<Calendar className="w-4 h-4 text-text-secondary" />}
                revisions={upcoming}
                variant="upcoming"
                onSelectSubject={selectSubject}
              />
            )}

            <div className="border-t border-border pt-6 mt-4">
              <h3 className="text-sm font-medium text-text-primary mb-3">Spaced Repetition Schedule</h3>
              <div className="grid grid-cols-4 gap-3 text-xs text-text-secondary">
                {[
                  { num: 1, label: "3 days", desc: "First review" },
                  { num: 2, label: "7 days", desc: "Second review" },
                  { num: 3, label: "14 days", desc: "Third review" },
                  { num: 4, label: "30 days", desc: "Final review" },
                ].map((r) => (
                  <div key={r.num} className="border border-border rounded-lg p-3 text-center">
                    <div className="text-sm font-semibold text-text-primary">#{r.num}</div>
                    <div className="mt-0.5">{r.label}</div>
                    <div className="text-text-secondary/60">{r.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  revisions: PopulatedRevision[];
  variant: "overdue" | "dueToday" | "upcoming";
  onSelectSubject: (id: string) => void;
}

function Section({ title, icon, revisions, variant, onSelectSubject }: SectionProps) {
  const updateRevision = useUpdateRevision();
  const deleteRevision = useDeleteRevision();

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
        <span className="text-xs text-text-secondary ml-1">{revisions.length}</span>
      </div>
      <div className="space-y-1">
        {revisions.map((rev) => (
          <div
            key={rev.id}
            className={cn(
              "group flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              variant === "overdue" && "bg-destructive/5 hover:bg-destructive/10",
              variant === "dueToday" && "bg-amber-50 hover:bg-amber-100",
              variant === "upcoming" && "bg-muted/30 hover:bg-muted/50",
            )}
          >
            <button
              onClick={() => updateRevision.mutate({ id: rev.id, completed: !rev.completed })}
              className={cn(
                "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer",
                rev.completed
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-border hover:border-primary",
              )}
            >
              {rev.completed && <Check className="w-3 h-3" />}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-sm font-medium truncate",
                  rev.completed && "line-through text-text-secondary",
                )}>
                  {rev.lectureId.title || "Unknown lecture"}
                </span>
                <TypeBadge type={rev.type} />
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <button
                  onClick={() => {
                    const subjectId = rev.lectureId.topicId.subjectId.id;
                    if (subjectId) onSelectSubject(subjectId);
                  }}
                  className="text-xs text-text-secondary hover:text-text-primary transition-colors truncate"
                >
                  <span className="flex items-center gap-1">
                    {rev.lectureId.topicId.subjectId.name}
                    <ChevronRight className="w-3 h-3" />
                    {rev.lectureId.topicId.name}
                  </span>
                </button>
                {rev.revisionNumber != null && (
                  <span className="text-xs text-text-secondary/60">Revision #{rev.revisionNumber}</span>
                )}
              </div>
              <p className="text-xs text-text-secondary/70 mt-0.5">
                {new Date(rev.scheduledDate).toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </p>
            </div>

            <div className="hidden group-hover:flex">
              <button
                onClick={() => deleteRevision.mutate(rev.id)}
                className="p-1 rounded hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const isNotes = type === "NOTES";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium",
        isNotes ? "bg-revision-notes/10 text-revision-notes" : "bg-revision-flashcards/10 text-revision-flashcards",
      )}
    >
      {isNotes ? <FileText className="w-3 h-3" /> : <Layers className="w-3 h-3" />}
      {isNotes ? "Notes" : "Cards"}
    </span>
  );
}
