import { useState, useRef, useEffect } from "react";
import { useMockTests, useCreateMockTest, useUpdateMockTest, useDeleteMockTest } from "../../hooks/use-tests";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Trash2, Plus, Check } from "lucide-react";
import { cn } from "../../lib/utils";

export function GlobalTests() {
  const { data: mockTests = [] } = useMockTests();
  const createMockTest = useCreateMockTest();
  const updateMockTest = useUpdateMockTest();
  const deleteMockTest = useDeleteMockTest();

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [score, setScore] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showAdd) nameInputRef.current?.focus();
  }, [showAdd]);

  function handleAdd() {
    const n = name.trim();
    if (!n) {
      setShowAdd(false);
      setName("");
      setScore("");
      return;
    }
    createMockTest.mutate({
      name: n,
      date: new Date().toISOString(),
      score: score ? parseFloat(score) : null,
    }, {
      onSuccess: () => {
        setShowAdd(false);
        setName("");
        setScore("");
      },
    });
  }

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-medium text-text-primary">Full-Length Mock Tests</h2>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Add Mock
        </Button>
      </div>

      {showAdd && (
        <div className="mb-3 flex gap-2">
          <Input
            ref={nameInputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") {
                setShowAdd(false);
                setName("");
                setScore("");
              }
            }}
            onBlur={handleAdd}
            placeholder="Mock test name..."
            className="h-9 text-sm flex-1"
          />
          <Input
            value={score}
            onChange={(e) => setScore(e.target.value.replace(/[^\d.]/g, ""))}
            placeholder="Score"
            className="h-9 text-sm w-20"
          />
        </div>
      )}

      {mockTests.length === 0 && !showAdd ? (
        <p className="text-sm text-text-secondary py-4">
          No mock tests recorded yet.
        </p>
      ) : (
        <div className="space-y-1">
          {mockTests.map((test) => (
            <div
              key={test.id}
              className="group flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors"
            >
              <button
                onClick={() => updateMockTest.mutate({ id: test.id, completed: !test.completed })}
                className={cn(
                  "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer",
                  test.completed
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border hover:border-primary",
                )}
                aria-label={test.completed ? "Mark as incomplete" : "Mark as complete"}
              >
                {test.completed && <Check className="w-3 h-3" />}
              </button>
              <span className={cn("text-sm flex-1", test.completed && "line-through text-text-secondary")}>
                {test.name}
              </span>
              {test.score != null && (
                <span className="text-xs text-text-secondary tabular-nums shrink-0">
                  {test.score}
                </span>
              )}
              <span className="text-xs text-text-secondary shrink-0 w-20 text-right">
                {new Date(test.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </span>
              <div className="hidden group-hover:flex">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive hover:text-destructive"
                  onClick={() => deleteMockTest.mutate(test.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
