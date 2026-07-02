import { useState } from "react";
import { useCreateRevision, useUpdateRevision, useDeleteRevision } from "../../hooks/use-revisions";
import { Input } from "../ui/input";
import { Check, Plus, X, FileText, Layers, AlertTriangle } from "lucide-react";
import { cn } from "../../lib/utils";
import type { Revision, RevisionType } from "../../types";

interface RevisionBadgesProps {
  revisions: Revision[];
  lectureId: string;
}

const TYPE_META: Record<RevisionType, { label: string; icon: typeof FileText; color: string; bg: string; ring: string }> = {
  NOTES: { label: "Notes", icon: FileText, color: "text-revision-notes", bg: "bg-revision-notes/10", ring: "ring-revision-notes/20" },
  FLASHCARDS: { label: "Cards", icon: Layers, color: "text-revision-flashcards", bg: "bg-revision-flashcards/10", ring: "ring-revision-flashcards/20" },
};

function getRevisionState(r: Revision): "overdue" | "dueToday" | "upcoming" | "completed" {
  if (r.completed) return "completed";
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const scheduled = new Date(r.scheduledDate);
  const scheduledDay = new Date(scheduled.getFullYear(), scheduled.getMonth(), scheduled.getDate());
  if (scheduledDay < today) return "overdue";
  if (scheduledDay.getTime() === today.getTime()) return "dueToday";
  return "upcoming";
}

export function RevisionBadges({ revisions, lectureId }: RevisionBadgesProps) {
  const createRevision = useCreateRevision();
  const updateRevision = useUpdateRevision();
  const deleteRevision = useDeleteRevision();

  const [adding, setAdding] = useState<RevisionType | null>(null);
  const [dateStr, setDateStr] = useState("");

  function handleAdd(type: RevisionType) {
    const date = dateStr.trim();
    if (!date) {
      setAdding(null);
      setDateStr("");
      return;
    }
    createRevision.mutate({
      type,
      scheduledDate: new Date(date).toISOString(),
      lectureId,
    }, {
      onSuccess: () => {
        setAdding(null);
        setDateStr("");
      },
    });
  }

  function handleToggle(revision: Revision) {
    updateRevision.mutate({
      id: revision.id,
      completed: !revision.completed,
    });
  }

  const notes = revisions.filter((r) => r.type === "NOTES");
  const flashcards = revisions.filter((r) => r.type === "FLASHCARDS");

  function renderRow(type: RevisionType, items: Revision[]) {
    const meta = TYPE_META[type];
    const Icon = meta.icon;

    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className={cn("flex items-center gap-1 text-xs font-medium w-12 shrink-0", meta.color)}>
          <Icon className="w-3 h-3" />
          {meta.label}
        </span>

        {items.map((r) => {
          const state = getRevisionState(r);
          return (
            <button
              key={r.id}
              onClick={() => handleToggle(r)}
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium transition-all cursor-pointer",
                state === "completed" && "bg-success-light text-success line-through",
                state === "overdue" && "bg-destructive/10 text-destructive ring-1 ring-destructive/30 hover:ring-2",
                state === "dueToday" && "bg-amber-100 text-amber-700 ring-1 ring-amber-400/30 hover:ring-2",
                state === "upcoming" && `${meta.bg} ${meta.color} ring-1 ${meta.ring} hover:ring-2`,
              )}
              title={`${new Date(r.scheduledDate).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}${r.revisionNumber ? ` · Revision #${r.revisionNumber}` : ""}`}
            >
              {state === "overdue" && <AlertTriangle className="w-2.5 h-2.5" />}
              {new Date(r.scheduledDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              {r.completed && <Check className="w-2.5 h-2.5 ml-0.5" />}
            </button>
          );
        })}

        <button
          onClick={() => {
            setAdding(type);
            setDateStr(new Date().toISOString().slice(0, 10));
          }}
          className="flex items-center justify-center w-5 h-5 rounded hover:bg-muted transition-colors"
        >
          <Plus className="w-3 h-3 text-text-secondary" />
        </button>

        {items.length > 0 && items.some((r) => !r.completed) && (
          <button
            onClick={() => {
              const firstIncomplete = items.find((r) => !r.completed);
              if (firstIncomplete) deleteRevision.mutate(firstIncomplete.id);
            }}
            className="flex items-center justify-center w-5 h-5 rounded hover:bg-destructive/10 transition-colors"
          >
            <X className="w-3 h-3 text-text-secondary hover:text-destructive" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 ml-8 pb-1">
      {renderRow("NOTES", notes)}
      {renderRow("FLASHCARDS", flashcards)}

      {adding && (
        <div className="flex items-center gap-1.5 ml-14 mt-0.5">
          <Input
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd(adding);
              if (e.key === "Escape") {
                setAdding(null);
                setDateStr("");
              }
            }}
            onBlur={() => handleAdd(adding)}
            className="h-7 text-xs w-36"
          />
        </div>
      )}
    </div>
  );
}
