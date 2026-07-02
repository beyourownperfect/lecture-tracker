import { useState, useRef, useEffect } from "react";
import { useSubjects } from "../../hooks/use-subjects";
import { useTopics, useCreateTopic, useUpdateTopic, useDeleteTopic } from "../../hooks/use-topics";
import { useLectures, useCreateLecture } from "../../hooks/use-lectures";
import { useSubjectTests, useCreateSubjectTest, useUpdateSubjectTest, useDeleteSubjectTest, useTopicTests, useCreateTopicTest, useUpdateTopicTest, useDeleteTopicTest } from "../../hooks/use-tests";
import { useUIStore } from "../../stores/ui-store";
import { WelcomeScreen } from "../layout/WelcomeScreen";
import { GlobalTests } from "../tests/GlobalTests";
import { Accordion, AccordionItem, AccordionContent } from "../ui/accordion";
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ProgressBar, ProgressRing, formatDuration } from "../ui/progress";
import { LectureRow } from "../lectures/LectureRow";
import { Plus, Pencil, Trash2, ChevronRight, Check } from "lucide-react";
import { cn } from "../../lib/utils";

export function SubjectDetail() {
  const { selectedSubjectId, expandedTopicIds, setExpandedTopicIds } = useUIStore();
  const { data: subjects = [] } = useSubjects();
  const { data: topics = [] } = useTopics(selectedSubjectId);
  const createTopic = useCreateTopic();
  const updateTopic = useUpdateTopic();
  const deleteTopic = useDeleteTopic();
  const { data: subjectTests = [] } = useSubjectTests(selectedSubjectId);
  const createSubjectTest = useCreateSubjectTest();
  const updateSubjectTest = useUpdateSubjectTest();
  const deleteSubjectTest = useDeleteSubjectTest();

  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const addInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const [showAddTest, setShowAddTest] = useState(false);
  const [testName, setTestName] = useState("");
  const [testScore, setTestScore] = useState("");
  const testInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adding) addInputRef.current?.focus();
  }, [adding]);

  useEffect(() => {
    if (editingId) editInputRef.current?.focus();
  }, [editingId]);

  useEffect(() => {
    if (showAddTest) testInputRef.current?.focus();
  }, [showAddTest]);

  function handleAdd() {
    const name = newName.trim();
    if (!name || !selectedSubjectId) {
      setAdding(false);
      setNewName("");
      return;
    }
    createTopic.mutate({ name, subjectId: selectedSubjectId }, {
      onSuccess: (data) => {
        setAdding(false);
        setNewName("");
        setExpandedTopicIds([...expandedTopicIds, data.id]);
      },
    });
  }

  function handleEdit(id: string) {
    const name = editName.trim();
    if (!name || name === topics.find((t) => t.id === id)?.name) {
      setEditingId(null);
      return;
    }
    updateTopic.mutate({ id, name }, {
      onSuccess: () => setEditingId(null),
    });
  }

  function handleAddTest() {
    const name = testName.trim();
    if (!name || !selectedSubjectId) {
      setShowAddTest(false);
      setTestName("");
      setTestScore("");
      return;
    }
    createSubjectTest.mutate({
      name,
      date: new Date().toISOString(),
      subjectId: selectedSubjectId,
      score: testScore ? parseFloat(testScore) : null,
    }, {
      onSuccess: () => {
        setShowAddTest(false);
        setTestName("");
        setTestScore("");
      },
    });
  }

  if (!selectedSubjectId) {
    return <WelcomeScreen />;
  }

  const subject = subjects.find((s) => s.id === selectedSubjectId);
  const totalLectures = subject?.totalLectures || 0;
  const completedLectures = subject?.completedLectures || 0;
  const progress = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-12 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
              {subject?.name}
            </h1>
            {totalLectures > 0 && (
              <ProgressRing pct={progress} size={36} />
            )}
          </div>
          <div className="flex items-center gap-6 mt-4">
            <div className="flex-1 max-w-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-text-secondary font-medium">Lecture Progress</span>
                <span className="text-xs text-text-secondary tabular-nums">{progress}%</span>
              </div>
              <ProgressBar value={completedLectures} max={totalLectures} />
            </div>
            <span className="text-sm text-text-secondary">
              {completedLectures} / {totalLectures} lectures
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-medium text-text-primary">Topics</h2>
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Topic
          </Button>
        </div>

        {adding && (
          <div className="mb-4 flex gap-2">
            <Input
              ref={addInputRef}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") {
                  setAdding(false);
                  setNewName("");
                }
              }}
              onBlur={handleAdd}
              placeholder="Topic name..."
              className="h-10 text-sm"
            />
          </div>
        )}

        {topics.length === 0 && !adding ? (
          <button
            onClick={() => setAdding(true)}
            className="w-full text-center py-16 border-2 border-dashed border-border rounded-xl hover:border-primary/40 hover:bg-muted/20 transition-all cursor-pointer"
          >
            <p className="text-sm font-medium text-text-secondary mb-1">No topics yet</p>
            <p className="text-xs text-text-secondary/50">Click here or use the button above to create your first topic</p>
          </button>
        ) : (
          <Accordion
            multiple
            value={expandedTopicIds}
            onValueChange={setExpandedTopicIds}
            className="space-y-1"
          >
            {topics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                selectedSubjectId={selectedSubjectId}
                editingId={editingId}
                editName={editName}
                editInputRef={editInputRef}
                onEditNameChange={setEditName}
                onStartEdit={(id, name) => {
                  setEditingId(id);
                  setEditName(name);
                }}
                onSaveEdit={handleEdit}
                onCancelEdit={() => setEditingId(null)}
                onDelete={() => deleteTopic.mutate({ id: topic.id, subjectId: selectedSubjectId })}
              />
            ))}
          </Accordion>
        )}

        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-medium text-text-primary">Subject Tests</h2>
            <Button size="sm" variant="outline" onClick={() => setShowAddTest(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Add Test
            </Button>
          </div>

          {showAddTest && (
            <div className="mb-3 flex gap-2">
              <Input
                ref={testInputRef}
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddTest();
                  if (e.key === "Escape") {
                    setShowAddTest(false);
                    setTestName("");
                    setTestScore("");
                  }
                }}
                onBlur={handleAddTest}
                placeholder="Test name..."
                className="h-9 text-sm flex-1"
              />
              <Input
                value={testScore}
                onChange={(e) => setTestScore(e.target.value.replace(/[^\d.]/g, ""))}
                placeholder="Score"
                className="h-9 text-sm w-20"
              />
            </div>
          )}

          {subjectTests.length === 0 && !showAddTest ? (
            <p className="text-sm text-text-secondary py-4">
              No subject tests recorded yet.
            </p>
          ) : (
            <div className="space-y-1">
              {subjectTests.map((test) => (
                <TestRow
                  key={test.id}
                  test={test}
                  onToggleComplete={(completed) =>
                    updateSubjectTest.mutate({ id: test.id, completed })
                  }
                  onDelete={() =>
                    deleteSubjectTest.mutate({ id: test.id, subjectId: selectedSubjectId })
                  }
                />
              ))}
            </div>
          )}
        </div>

        <GlobalTests />
      </div>
    </div>
  );
}

function TestRow({
  test,
  onToggleComplete,
  onDelete,
}: {
  test: { id: string; name: string; date: string; score: number | null; completed: boolean };
  onToggleComplete: (completed: boolean) => void;
  onDelete: () => void;
}) {
  return (
    <div className="group flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors">
      <button
        onClick={() => onToggleComplete(!test.completed)}
        className={cn(
          "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer",
          test.completed
            ? "bg-primary border-primary text-primary-foreground"
            : "border-border hover:border-primary",
        )}
      >
        {test.completed && (
          <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
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
        <button
          onClick={onDelete}
          className="p-1 rounded hover:bg-destructive/10 transition-colors"
          aria-label="Delete test"
        >
          <Trash2 className="w-3 h-3 text-destructive" />
        </button>
      </div>
    </div>
  );
}

interface TopicCardProps {
  topic: { id: string; name: string; totalPyqs: number; solvedPyqs: number };
  selectedSubjectId: string;
  editingId: string | null;
  editName: string;
  editInputRef: React.RefObject<HTMLInputElement | null>;
  onEditNameChange: (name: string) => void;
  onStartEdit: (id: string, name: string) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  onDelete: () => void;
}

function TopicCard({
  topic,
  editingId,
  editName,
  editInputRef,
  onEditNameChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}: TopicCardProps) {
  const createLecture = useCreateLecture();
  const updateTopic = useUpdateTopic();
  const { data: lectures = [] } = useLectures(topic.id);
  const { data: topicTests = [] } = useTopicTests(topic.id);
  const createTopicTest = useCreateTopicTest();
  const updateTopicTest = useUpdateTopicTest();
  const deleteTopicTest = useDeleteTopicTest();

  const [showAddLecture, setShowAddLecture] = useState(false);
  const [lectureTitle, setLectureTitle] = useState("");
  const [lectureDuration, setLectureDuration] = useState("");
  const lectureInputRef = useRef<HTMLInputElement>(null);
  const pyqSolvedInputRef = useRef<HTMLInputElement>(null);
  const [editingPyqTotal, setEditingPyqTotal] = useState(false);
  const [pyqTotal, setPyqTotal] = useState(String(topic.totalPyqs));
  const [editingPyqSolved, setEditingPyqSolved] = useState(false);
  const [pyqSolved, setPyqSolved] = useState(String(topic.solvedPyqs));
  const [showAddTopicTest, setShowAddTopicTest] = useState(false);
  const [topicTestName, setTopicTestName] = useState("");
  const [topicTestScore, setTopicTestScore] = useState("");
  const topicTestInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showAddLecture) lectureInputRef.current?.focus();
  }, [showAddLecture]);

  useEffect(() => {
    if (editingPyqSolved) pyqSolvedInputRef.current?.focus();
  }, [editingPyqSolved]);

  useEffect(() => {
    if (showAddTopicTest) topicTestInputRef.current?.focus();
  }, [showAddTopicTest]);

  useEffect(() => {
    setPyqSolved(String(topic.solvedPyqs));
    setPyqTotal(String(topic.totalPyqs));
  }, [topic.totalPyqs, topic.solvedPyqs]);

  function handleAddLecture() {
    const title = lectureTitle.trim();
    if (!title) {
      setShowAddLecture(false);
      setLectureTitle("");
      setLectureDuration("");
      return;
    }
    createLecture.mutate({
      title,
      topicId: topic.id,
      duration: parseInt(lectureDuration, 10) || 0,
    }, {
      onSuccess: () => {
        setShowAddLecture(false);
        setLectureTitle("");
        setLectureDuration("");
      },
    });
  }

  function handleSavePyqSolved() {
    const solved = parseInt(pyqSolved, 10) || 0;
    updateTopic.mutate({
      id: topic.id,
      totalPyqs: Math.max(solved, topic.totalPyqs || 0),
      solvedPyqs: Math.min(solved, Math.max(solved, topic.totalPyqs || 0)),
    });
    setEditingPyqSolved(false);
  }

  function handleSavePyqTotal() {
    const total = parseInt(pyqTotal, 10) || 0;
    const solved = Math.min(total, parseInt(pyqSolved, 10) || 0);
    updateTopic.mutate({
      id: topic.id,
      totalPyqs: total,
      solvedPyqs: solved,
    });
    setEditingPyqTotal(false);
  }

  function handleAddTopicTest() {
    const n = topicTestName.trim();
    if (!n) {
      setShowAddTopicTest(false);
      setTopicTestName("");
      setTopicTestScore("");
      return;
    }
    createTopicTest.mutate({
      name: n,
      date: new Date().toISOString(),
      topicId: topic.id,
      score: topicTestScore ? parseFloat(topicTestScore) : null,
    }, {
      onSuccess: () => {
        setShowAddTopicTest(false);
        setTopicTestName("");
        setTopicTestScore("");
      },
    });
  }

  const totalLectures = lectures.length;
  const completedLectures = lectures.filter((l) => l.completed).length;
  const lecturePct = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;

  const totalDuration = lectures.reduce((sum, l) => sum + (l.duration || 0), 0);

  const allRevisions = lectures.flatMap((l) => l.revisions || []);
  const notesRevisions = allRevisions.filter((r) => r.type === "NOTES");
  const flashcardsRevisions = allRevisions.filter((r) => r.type === "FLASHCARDS");
  const notesCompleted = notesRevisions.filter((r) => r.completed).length;
  const flashcardsCompleted = flashcardsRevisions.filter((r) => r.completed).length;

  const components = [
    { label: "Lectures", value: completedLectures, max: totalLectures, hasData: totalLectures > 0 },
    { label: "PYQs", value: topic.solvedPyqs, max: topic.totalPyqs, hasData: topic.totalPyqs > 0 },
    { label: "Notes", value: notesCompleted, max: notesRevisions.length, hasData: notesRevisions.length > 0 },
    { label: "Cards", value: flashcardsCompleted, max: flashcardsRevisions.length, hasData: flashcardsRevisions.length > 0 },
  ].filter((c) => c.hasData);

  const overallPct = components.length > 0
    ? Math.round(components.reduce((sum, c) => sum + (c.max > 0 ? c.value / c.max : 0), 0) / components.length * 100)
    : 0;

  return (
    <AccordionItem value={topic.id} className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <AccordionPrimitive.Trigger className="group/trigger flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-muted/30 transition-colors w-full">
        <ChevronRight className="w-4 h-4 text-text-secondary/50 transition-transform shrink-0 group-aria-expanded/trigger:rotate-90" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            {editingId === topic.id ? (
              <div className="flex gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
                <Input
                  ref={editInputRef}
                  value={editName}
                  onChange={(e) => onEditNameChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSaveEdit(topic.id);
                    if (e.key === "Escape") onCancelEdit();
                  }}
                  onBlur={() => onSaveEdit(topic.id)}
                  className="h-8 text-sm font-medium"
                />
              </div>
            ) : (
              <h3 className="text-sm font-semibold text-text-primary truncate">{topic.name}</h3>
            )}

            <div className="hidden group-hover/trigger:flex items-center gap-0.5 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStartEdit(topic.id, topic.name);
                }}
                className="p-1 rounded hover:bg-muted transition-colors"
                aria-label="Rename topic"
              >
                <Pencil className="w-3.5 h-3.5 text-text-secondary" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1 rounded hover:bg-destructive/10 transition-colors"
                aria-label="Delete topic"
              >
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </button>
            </div>
          </div>

          {components.length > 0 ? (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {components.map((c) => (
                <div key={c.label} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-text-secondary font-medium tracking-wide uppercase">
                      {c.label}
                    </span>
                    <span className="text-[11px] text-text-secondary tabular-nums">
                      {c.max > 0 ? `${c.value}/${c.max}` : "—"}
                    </span>
                  </div>
                  <ProgressBar
                    value={c.value}
                    max={c.max}
                    color={
                      c.label === "PYQs" ? "bg-amber-500"
                        : c.label === "Notes" ? "bg-revision-notes"
                        : c.label === "Cards" ? "bg-revision-flashcards"
                        : "bg-primary"
                    }
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-secondary/60 mt-1">No progress data yet — add lectures to start tracking</p>
          )}
        </div>

        {components.length > 0 && (
          <div className="shrink-0">
            <ProgressRing pct={overallPct} size={44} />
          </div>
        )}
      </AccordionPrimitive.Trigger>

      <AccordionContent>
        <div className="px-5 pb-4">
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4 text-xs text-text-secondary">
                <span className={cn("font-medium tabular-nums flex items-center gap-1", lecturePct === 0 && "text-text-secondary/50")}>
                  <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                  {completedLectures}/{totalLectures} lectures
                </span>
                {totalDuration > 0 && (
                  <span className="tabular-nums">{formatDuration(totalDuration)}</span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-3">
                  {editingPyqSolved ? (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        ref={pyqSolvedInputRef}
                        value={pyqSolved}
                        onChange={(e) => setPyqSolved(e.target.value.replace(/\D/g, ""))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSavePyqSolved();
                          if (e.key === "Escape") {
                            setEditingPyqSolved(false);
                            setPyqSolved(String(topic.solvedPyqs));
                          }
                        }}
                        onBlur={handleSavePyqSolved}
                        className="w-10 h-6 text-center text-xs border border-border rounded bg-surface focus:outline-none focus:ring-1 focus:ring-primary tabular-nums"
                      />
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingPyqSolved(true);
                        setPyqSolved(String(topic.solvedPyqs));
                      }}
                      className="flex items-center gap-1 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                    >
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span className="tabular-nums font-medium">{topic.solvedPyqs}</span>
                      <span className="text-text-secondary/50">/{topic.totalPyqs}</span>
                      <span className="text-text-secondary/50">PYQs</span>
                    </button>
                  )}

                  {editingPyqTotal && (
                    <input
                      value={pyqTotal}
                      onChange={(e) => setPyqTotal(e.target.value.replace(/\D/g, ""))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSavePyqTotal();
                        if (e.key === "Escape") {
                          setEditingPyqTotal(false);
                          setPyqTotal(String(topic.totalPyqs));
                        }
                      }}
                      onBlur={handleSavePyqTotal}
                      className="w-10 h-6 text-center text-xs border border-border rounded bg-surface focus:outline-none focus:ring-1 focus:ring-primary tabular-nums"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  {!editingPyqTotal && topic.totalPyqs > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingPyqTotal(true);
                        setPyqTotal(String(topic.totalPyqs));
                      }}
                      className="text-[10px] text-text-secondary/40 hover:text-text-secondary transition-colors"
                    >
                      edit total
                    </button>
                  )}
                </div>
              </div>
            </div>

            {lectures.length === 0 ? (
              <button
                onClick={() => setShowAddLecture(true)}
                className="w-full text-center py-8 border-2 border-dashed border-border rounded-xl hover:border-primary/40 hover:bg-muted/20 transition-all cursor-pointer"
              >
                <p className="text-sm font-medium text-text-secondary/60 mb-1">No lectures yet</p>
                <p className="text-xs text-text-secondary/40">Click to add your first lecture and start tracking</p>
              </button>
            ) : (
              <div className="space-y-0.5">
                {lectures.map((lecture) => (
                  <LectureRow key={lecture.id} lecture={lecture} topicId={topic.id} />
                ))}
              </div>
            )}

            {showAddLecture ? (
              <div className="flex gap-2 items-center mt-2">
                <Input
                  ref={lectureInputRef}
                  value={lectureTitle}
                  onChange={(e) => setLectureTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddLecture();
                    if (e.key === "Escape") {
                      setShowAddLecture(false);
                      setLectureTitle("");
                      setLectureDuration("");
                    }
                  }}
                  onBlur={handleAddLecture}
                  placeholder="Lecture title..."
                  className="h-9 text-sm flex-1"
                />
                <Input
                  value={lectureDuration}
                  onChange={(e) => setLectureDuration(e.target.value.replace(/\D/g, ""))}
                  placeholder="min"
                  className="h-9 text-sm w-16"
                />
                <button
                  onClick={() => {
                    setShowAddLecture(false);
                    setLectureTitle("");
                    setLectureDuration("");
                  }}
                  className="p-1.5 rounded hover:bg-muted transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4 text-text-secondary" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddLecture(true)}
                className="w-full mt-2 flex items-center gap-2 px-3 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-muted/50 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add lecture
              </button>
            )}

            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">Topic Tests</span>
                <button
                  onClick={() => setShowAddTopicTest(true)}
                  className="text-xs text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
              </div>

              {showAddTopicTest && (
                <div className="mb-2 flex gap-2">
                  <Input
                    ref={topicTestInputRef}
                    value={topicTestName}
                    onChange={(e) => setTopicTestName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddTopicTest();
                      if (e.key === "Escape") {
                        setShowAddTopicTest(false);
                        setTopicTestName("");
                        setTopicTestScore("");
                      }
                    }}
                    onBlur={handleAddTopicTest}
                    placeholder="Test name..."
                    className="h-8 text-sm flex-1"
                  />
                  <Input
                    value={topicTestScore}
                    onChange={(e) => setTopicTestScore(e.target.value.replace(/[^\d.]/g, ""))}
                    placeholder="Score"
                    className="h-8 text-sm w-20"
                  />
                </div>
              )}

              {topicTests.length === 0 && !showAddTopicTest ? (
                <p className="text-xs text-text-secondary/50 py-2">No tests recorded</p>
              ) : (
                <div className="space-y-0.5">
                  {topicTests.map((test) => (
                    <div
                      key={test.id}
                      className="group flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-muted/50 rounded-md transition-colors"
                    >
                      <button
                        onClick={() => updateTopicTest.mutate({ id: test.id, completed: !test.completed })}
                        className={cn(
                          "w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer",
                          test.completed
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-border hover:border-primary",
                        )}
                      >
                        {test.completed && <Check className="w-2.5 h-2.5" />}
                      </button>
                      <span className={cn("flex-1", test.completed && "line-through text-text-secondary")}>
                        {test.name}
                      </span>
                      {test.score != null && (
                        <span className="text-text-secondary tabular-nums">{test.score}</span>
                      )}
                      <button
                        onClick={() => deleteTopicTest.mutate({ id: test.id, topicId: topic.id })}
                        className="hidden group-hover:flex p-0.5 rounded hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-2.5 h-2.5 text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
