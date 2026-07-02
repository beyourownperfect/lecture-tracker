import { useState, useRef, useEffect, useCallback } from "react";
import { useUpdateLecture, useDeleteLecture } from "../../hooks/use-lectures";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Pencil, Trash2, Clock, Check } from "lucide-react";
import { cn } from "../../lib/utils";
import type { Lecture } from "../../types";

import { RevisionBadges } from "../revisions/RevisionBadges";

interface LectureRowProps {
  lecture: Lecture;
  topicId: string;
}

export function LectureRow({ lecture, topicId }: LectureRowProps) {
  const updateLecture = useUpdateLecture();
  const deleteLecture = useDeleteLecture();

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(lecture.title);
  const [editDuration, setEditDuration] = useState(String(lecture.duration));
  const titleInputRef = useRef<HTMLInputElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (editing) titleInputRef.current?.focus();
  }, [editing]);

  // Reset edit state when lecture prop changes (server sync)
  useEffect(() => {
    setEditTitle(lecture.title);
    setEditDuration(String(lecture.duration));
  }, [lecture.title, lecture.duration]);

  const handleSaveEdit = useCallback(() => {
    const title = editTitle.trim();
    const duration = parseInt(editDuration, 10) || 0;
    if (!title || (title === lecture.title && duration === lecture.duration)) {
      setEditing(false);
      setEditTitle(lecture.title);
      setEditDuration(String(lecture.duration));
      return;
    }
    updateLecture.mutate({
      id: lecture.id,
      title,
      duration,
    });
    setEditing(false);
  }, [editTitle, editDuration, lecture, updateLecture]);

  const scheduleAutoSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const title = editTitle.trim();
      const duration = parseInt(editDuration, 10) || 0;
      if (!title) return;
      updateLecture.mutate({
        id: lecture.id,
        title,
        duration,
      });
    }, 800);
  }, [editTitle, editDuration, lecture.id, updateLecture]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  function handleToggleComplete() {
    updateLecture.mutate({
      id: lecture.id,
      completed: !lecture.completed,
    });
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);
  }

  return (
    <div className="pb-1">
      <div className="group flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors">
        <button
          onClick={handleToggleComplete}
          className={cn(
            "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer",
            lecture.completed
              ? "bg-primary border-primary text-primary-foreground"
              : "border-border hover:border-primary",
            animating && "animate-completion-pop",
          )}
        >
          {lecture.completed && <Check className="w-3 h-3" />}
        </button>

        {editing ? (
          <div className="flex gap-2 flex-1 items-center">
            <Input
              ref={titleInputRef}
              value={editTitle}
              onChange={(e) => {
                setEditTitle(e.target.value);
                scheduleAutoSave();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveEdit();
                if (e.key === "Escape") {
                  setEditing(false);
                  setEditTitle(lecture.title);
                  setEditDuration(String(lecture.duration));
                }
              }}
              onBlur={handleSaveEdit}
              className="h-8 text-sm flex-1"
            />
            <Input
              value={editDuration}
              onChange={(e) => {
                setEditDuration(e.target.value.replace(/\D/g, ""));
                scheduleAutoSave();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveEdit();
              }}
              className="h-8 text-sm w-16 text-center"
            />
            <span className="text-xs text-text-secondary">min</span>
          </div>
        ) : (
          <>
            <span
              className={cn(
                "text-sm flex-1 cursor-pointer py-0.5",
                lecture.completed && "line-through text-text-secondary",
              )}
              onClick={() => {
                setEditing(true);
                setEditTitle(lecture.title);
                setEditDuration(String(lecture.duration));
              }}
            >
              {lecture.title}
            </span>
            {lecture.duration > 0 && (
              <span className="flex items-center gap-1 text-xs text-text-secondary shrink-0">
                <Clock className="w-3 h-3" />
                {lecture.duration} min
              </span>
            )}
          </>
        )}

        <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => {
              setEditing(true);
              setEditTitle(lecture.title);
              setEditDuration(String(lecture.duration));
            }}
          >
            <Pencil className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive"
            onClick={() => deleteLecture.mutate({ id: lecture.id, topicId })}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <RevisionBadges revisions={lecture.revisions || []} lectureId={lecture.id} />
    </div>
  );
}
