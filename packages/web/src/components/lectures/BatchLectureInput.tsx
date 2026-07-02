import { useState, useRef, useEffect } from "react";
import { useCreateLecture } from "../../hooks/use-lectures";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";

interface BatchLectureInputProps {
  topicId: string;
  onClose: () => void;
}

function parseLine(line: string): { title: string; duration: number } {
  let m = line.match(/^(.+?)\s*\[(\d+)\]\s*$/);
  if (m) return { title: m[1].trim(), duration: parseInt(m[2], 10) };
  m = line.match(/^(.+?)\s+(\d+)\s*$/);
  if (m) return { title: m[1].trim(), duration: parseInt(m[2], 10) };
  return { title: line.trim(), duration: 0 };
}

export function BatchLectureInput({ topicId, onClose }: BatchLectureInputProps) {
  const createLecture = useCreateLecture();
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  async function handleAddAll() {
    const entries = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .map(parseLine);

    if (entries.length === 0) return;

    setAdding(true);
    for (const { title, duration } of entries) {
      await createLecture.mutateAsync({ title, topicId, duration });
    }
    setAdding(false);
    setText("");
    textareaRef.current?.focus();
    onClose();
  }

  return (
    <div className="flex flex-col gap-2 mb-3">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            if (text.trim()) {
              setText("");
            } else {
              onClose();
            }
          }
        }}
        placeholder={"Lecture title 45\nAnother lecture [30]\nLecture without duration"}
        className="w-full min-h-[80px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none resize-y"
      />
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={handleAddAll}
          disabled={!text.trim() || adding}
        >
          {adding ? (
            <span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-1" />
          ) : (
            <Plus className="w-4 h-4 mr-1" />
          )}
          {adding ? "Adding..." : "Add All"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onClose} disabled={adding}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
