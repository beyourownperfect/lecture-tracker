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
  const durationInputRef = useRef<HTMLInputElement>(null);

  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (editing) titleInputRef.current?.focus();
  }, [editing]);

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

  function handleToggleComplete() {
    updateLecture.mutate({
      id: lecture.id,
      completed: !lecture.completed,
    });
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (document.activeElement === titleInputRef.current) {
        durationInputRef.current?.focus();
      } else {
        handleSaveEdit();
      }
    }
    if (e.key === "Escape") {
      setEditing(false);
      setEditTitle(lecture.title);
      setEditDuration(String(lecture.duration));
    }
  }

  return (
    <div className="pb-1">
      <div className="group flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors">
        <button
          onClick={handleToggleComplete}
          className={cn(
            "w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer",
            lecture.completed
              ? "bg-primary border-primary text-primary-foreground"
              : "border-border hover:border-primary",
            animating && "animate-completion-pop",
          )}
          aria-label={lecture.completed ? "Mark incomplete" : "Mark complete"}
        >
          {lecture.completed && <Check className="w-3.5 h-3.5" />}
        </button>

        {editing ? (
          <div className="flex gap-2 flex-1 items-center">
            <Input
              ref={titleInputRef}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSaveEdit}
              placeholder="Lecture title"
              className="h-10 text-sm flex-1"
            />
            <Input
              ref={durationInputRef}
              value={editDuration}
              onChange={(e) => setEditDuration(e.target.value.replace(/\D/g, ""))}
              onKeyDown={handleKeyDown}
              placeholder="min"
              className="h-10 text-sm w-20 text-center"
            />
          </div>
        ) : (
          <button
            className={cn(
              "text-sm flex-1 text-left py-0.5 cursor-pointer rounded hover:bg-muted/50 transition-colors",
              lecture.completed && "line-through text-text-secondary",
            )}
            onClick={() => {
              setEditing(true);
              setEditTitle(lecture.title);
              setEditDuration(String(lecture.duration));
            }}
            title="Click to edit"
          >
            {lecture.title}
          </button>
        )}

        {!editing && lecture.duration > 0 && (
          <span className="flex items-center gap-1 text-xs text-text-secondary shrink-0">
            <Clock className="w-3 h-3" />
            {lecture.duration}m
          </span>
        )}

        <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              setEditing(true);
              setEditTitle(lecture.title);
              setEditDuration(String(lecture.duration));
            }}
            aria-label="Edit lecture"
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => deleteLecture.mutate({ id: lecture.id, topicId })}
            aria-label="Delete lecture"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <RevisionBadges revisions={lecture.revisions || []} lectureId={lecture.id} />
    </div>
  );
}
