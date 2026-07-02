import { useState, useRef, useEffect } from "react";
import { useTestDashboard, useCreateMockTest, useUpdateMockTest, useUpdateSubjectTest, useUpdateTopicTest, useDeleteMockTest, useDeleteSubjectTest, useDeleteTopicTest } from "../../hooks/use-tests";
import { useUIStore } from "../../stores/ui-store";
import { cn } from "../../lib/utils";
import { Check, Trash2, Plus, Pencil } from "lucide-react";

export function TestDashboard() {
  const { data, isLoading } = useTestDashboard();
  const selectSubject = useUIStore((s) => s.selectSubject);

  const updateSubjectTest = useUpdateSubjectTest();
  const deleteSubjectTest = useDeleteSubjectTest();
  const updateTopicTest = useUpdateTopicTest();
  const deleteTopicTest = useDeleteTopicTest();
  const updateMockTest = useUpdateMockTest();
  const deleteMockTest = useDeleteMockTest();

  const [showAddMock, setShowAddMock] = useState(false);
  const [mockName, setMockName] = useState("");
  const [mockScore, setMockScore] = useState("");
  const mockInputRef = useRef<HTMLInputElement>(null);

  const createMockTest = useCreateMockTest();

  useEffect(() => {
    if (showAddMock) mockInputRef.current?.focus();
  }, [showAddMock]);

  function handleAddMock() {
    const n = mockName.trim();
    if (!n) {
      setShowAddMock(false);
      setMockName("");
      setMockScore("");
      return;
    }
    createMockTest.mutate({
      name: n,
      date: new Date().toISOString(),
      score: mockScore ? parseFloat(mockScore) : null,
    }, {
      onSuccess: () => {
        setShowAddMock(false);
        setMockName("");
        setMockScore("");
      },
    });
  }

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-12 py-10">
          <p className="text-sm text-text-secondary">Loading tests...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { subjectTests, topicTests, mockTests } = data;
  const totalTests = subjectTests.length + topicTests.length + mockTests.length;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-12 py-10">
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight mb-2">
          Test Tracker
        </h1>
        <p className="text-sm text-text-secondary mb-8">
          {totalTests > 0
            ? `${totalTests} tests recorded across subjects, topics, and mock exams`
            : "Track your subject tests, topic tests, and full mock exams"}
        </p>

        {totalTests === 0 ? (
          <div className="text-center py-20 text-text-secondary">
            <p className="text-sm mb-4">No tests recorded yet.</p>
            <button
              onClick={() => setShowAddMock(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Record your first mock test
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {subjectTests.length > 0 && (
              <Section title="Subject Tests">
                {subjectTests.map((t) => (
                  <TestRow
                    key={t.id}
                    test={t}
                    subtitle={t.subjectId?.name}
                    onSubjectClick={() => t.subjectId?.id && selectSubject(t.subjectId.id)}
                    onToggle={(completed) => updateSubjectTest.mutate({ id: t.id, completed })}
                    onDelete={() => deleteSubjectTest.mutate({ id: t.id, subjectId: t.subjectId?.id || "" })}
                    onScoreEdit={(score) => updateSubjectTest.mutate({ id: t.id, score })}
                  />
                ))}
              </Section>
            )}

            {topicTests.length > 0 && (
              <Section title="Topic Tests">
                {topicTests.map((t) => (
                  <TestRow
                    key={t.id}
                    test={t}
                    subtitle={t.topicId?.subjectId?.name
                      ? `${t.topicId.subjectId.name} › ${t.topicId?.name}`
                      : t.topicId?.name}
                    onSubjectClick={() => t.topicId?.subjectId?.id && selectSubject(t.topicId.subjectId.id)}
                    onToggle={(completed) => updateTopicTest.mutate({ id: t.id, completed })}
                    onDelete={() => deleteTopicTest.mutate({ id: t.id, topicId: t.topicId?.id || "" })}
                    onScoreEdit={(score) => updateTopicTest.mutate({ id: t.id, score })}
                  />
                ))}
              </Section>
            )}

            {mockTests.length > 0 && (
              <Section
                title="Full-Length Mock Tests"
                action={
                  <button
                    onClick={() => setShowAddMock(true)}
                    className="text-xs text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add
                  </button>
                }
              >
                {mockTests.map((t) => (
                  <TestRow
                    key={t.id}
                    test={t}
                    onToggle={(completed) => updateMockTest.mutate({ id: t.id, completed })}
                    onDelete={() => deleteMockTest.mutate(t.id)}
                    onScoreEdit={(score) => updateMockTest.mutate({ id: t.id, score })}
                  />
                ))}
              </Section>
            )}

            {showAddMock && (
              <div className="flex gap-2">
                <input
                  ref={mockInputRef}
                  value={mockName}
                  onChange={(e) => setMockName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddMock();
                    if (e.key === "Escape") {
                      setShowAddMock(false);
                      setMockName("");
                      setMockScore("");
                    }
                  }}
                  onBlur={handleAddMock}
                  placeholder="Mock test name..."
                  className="flex-1 h-9 px-3 text-sm border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-colors"
                />
                <input
                  value={mockScore}
                  onChange={(e) => setMockScore(e.target.value.replace(/[^\d.]/g, ""))}
                  placeholder="Score"
                  className="w-20 h-9 px-3 text-sm border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-colors"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">{title}</h2>
        {action}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function TestRow({
  test,
  subtitle,
  onSubjectClick,
  onToggle,
  onDelete,
  onScoreEdit,
}: {
  test: { id: string; name: string; date: string; score: number | null; completed: boolean };
  subtitle?: string;
  onSubjectClick?: () => void;
  onToggle: (completed: boolean) => void;
  onDelete: () => void;
  onScoreEdit: (score: number | null) => void;
}) {
  const [editingScore, setEditingScore] = useState(false);
  const [scoreVal, setScoreVal] = useState(test.score != null ? String(test.score) : "");
  const scoreInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingScore) scoreInputRef.current?.focus();
  }, [editingScore]);

  function saveScore() {
    const v = scoreVal.trim();
    onScoreEdit(v ? parseFloat(v) : null);
    setEditingScore(false);
  }

  const scorePct = test.score != null ? Math.round((test.score / 200) * 100) : null;

  return (
    <div
      className={cn(
        "group flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
        test.completed ? "bg-muted/30" : "hover:bg-muted/30",
      )}
    >
      <button
        onClick={() => onToggle(!test.completed)}
        className={cn(
          "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer",
          test.completed
            ? "bg-primary border-primary text-primary-foreground scale-100"
            : "border-border hover:border-primary hover:scale-110",
        )}
        aria-label={test.completed ? "Mark as incomplete" : "Mark as complete"}
      >
        {test.completed && <Check className="w-3 h-3" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-sm font-medium truncate",
            test.completed && "line-through text-text-secondary",
          )}>
            {test.name}
          </span>
          {scorePct != null && (
            <span className={cn(
              "text-xs font-medium tabular-nums",
              scorePct >= 67 ? "text-emerald-600"
                : scorePct >= 34 ? "text-amber-600"
                : "text-red-600",
            )}>
              {scorePct}%
            </span>
          )}
        </div>
        {subtitle && (
          <button
            onClick={onSubjectClick}
            className="text-xs text-text-secondary hover:text-text-primary transition-colors mt-0.5"
          >
            {subtitle}
          </button>
        )}
        <p className="text-xs text-text-secondary/60 mt-0.5">
          {new Date(test.date).toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>

      {editingScore ? (
        <input
          ref={scoreInputRef}
          value={scoreVal}
          onChange={(e) => setScoreVal(e.target.value.replace(/[^\d.]/g, ""))}
          onKeyDown={(e) => {
            if (e.key === "Enter") saveScore();
            if (e.key === "Escape") {
              setEditingScore(false);
              setScoreVal(test.score != null ? String(test.score) : "");
            }
          }}
          onBlur={saveScore}
          className="w-16 h-7 text-center text-xs border border-border rounded bg-surface focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-colors tabular-nums"
        />
      ) : (
        <button
          onClick={() => {
            setEditingScore(true);
            setScoreVal(test.score != null ? String(test.score) : "");
          }}
          className={cn(
            "text-xs tabular-nums shrink-0 min-w-[3rem] text-right hover:text-text-primary transition-colors cursor-pointer",
            test.score != null ? "text-text-secondary font-medium" : "text-text-secondary/40",
          )}
        >
          {test.score != null ? test.score : "—"}
        </button>
      )}

      <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
        <button
          onClick={() => {
            setEditingScore(true);
            setScoreVal(test.score != null ? String(test.score) : "");
          }}
          className="p-1 rounded hover:bg-muted transition-colors"
          aria-label="Edit score"
        >
          <Pencil className="w-3.5 h-3.5 text-text-secondary" />
        </button>
        <button
          onClick={onDelete}
          className="p-1 rounded hover:bg-destructive/10 transition-colors"
          aria-label="Delete test"
        >
          <Trash2 className="w-3.5 h-3.5 text-destructive" />
        </button>
      </div>
    </div>
  );
}
