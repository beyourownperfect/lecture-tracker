import { useState } from "react";
import { useWeeklyReport } from "../../hooks/use-weekly-report";
import { Copy, Check, Camera } from "lucide-react";

export function StudySnapshot() {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const { refetch } = useWeeklyReport();

  async function handleSnapshot() {
    setLoading(true);
    const result = await refetch();
    setLoading(false);

    if (!result.data) return;

    const d = result.data;
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric",
    });

    let total = 0;
    let completed = 0;
    let totalDur = 0;
    let completedDur = 0;
    for (const s of d.subjects) {
      total += s.totalLectures || 0;
      completed += s.completedLectures || 0;
      totalDur += s.totalDuration || 0;
      completedDur += s.completedDuration || 0;
    }
    const overallPct = total > 0 ? Math.round((completed / total) * 100) : 0;

    const subjectLines = d.subjects
      .filter((s) => (s.completedLectures || 0) > 0 || (s.totalLectures || 0) > 0)
      .map((s) => {
        const pct = (s.totalLectures || 0) > 0
          ? Math.round(((s.completedLectures || 0) / (s.totalLectures || 0)) * 100)
          : 0;
        return `• ${s.name}: ${pct}%`;
      });

    const lecturesThisWeek = d.completedLecturesThisWeek.length;
    const hoursThisWeek = d.completedLecturesThisWeek.reduce((s, l) => s + (l.duration || 0), 0);

    const solvedPyqs = d.topics.reduce((s, t) => s + t.solvedPyqs, 0);
    const totalPyqs = d.topics.reduce((s, t) => s + t.totalPyqs, 0);
    const notesRev = d.allRevisions.filter((r) => r.completed && r.type === "NOTES").length;
    const cardsRev = d.allRevisions.filter((r) => r.completed && r.type === "FLASHCARDS").length;

    const subjectTests = d.subjectTests.length;
    const topicTests = d.topicTests.length;
    const mocks = d.mockTests.length;

    const upcomingCount = d.allRevisions.filter((r) => !r.completed).length;

    const incompleteLectures = d.lectures
      .filter((l) => !l.completed)
      .slice(0, 1)
      .map((l) => {
        const topic = d.topics.find((t) => t.id === l.topicId);
        const subject = topic ? d.subjects.find((s) => s.id === topic.subjectId) : undefined;
        return `${subject?.name || ""} → ${topic?.name || ""} → ${l.title}`;
      });

    function fmtHours(m: number) {
      if (m < 60) return `${m}m`;
      const h = Math.floor(m / 60);
      const mi = m % 60;
      return mi > 0 ? `${h}h ${mi}m` : `${h}h`;
    }

    const text = `📸 GATE CSE Progress Snapshot — ${dateStr}

━━━━━━━━━━━━━━━━━━━━━━

📈 Overall Progress: ${overallPct}%
   ${completed}/${total} lectures · ${fmtHours(completedDur)} / ${fmtHours(totalDur)}

📚 Subjects
${subjectLines.join("\n")}

🔥 This Week
   Lectures Completed: ${lecturesThisWeek}
   Hours Studied: ${fmtHours(hoursThisWeek)}
   PYQs Solved: ${solvedPyqs} / ${totalPyqs}
   Notes Revisions: ${notesRev}
   Flashcard Revisions: ${cardsRev}
   Subject Tests: ${subjectTests}
   Topic Tests: ${topicTests}
   Mock Tests: ${mocks}

⏳ Upcoming
   ${upcomingCount} revisions due${incompleteLectures.length > 0 ? `\n   Next incomplete: ${incompleteLectures[0]}` : ""}

Generated: ${dateStr}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <button
      onClick={handleSnapshot}
      disabled={loading}
      className="w-full text-left rounded-lg px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-ring/50 outline-none hover:bg-muted text-text-secondary disabled:opacity-50"
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-text-secondary/30 border-t-text-secondary rounded-full animate-spin" />
      ) : copied ? (
        <Check className="w-4 h-4 text-emerald-500" />
      ) : (
        <Camera className="w-4 h-4" />
      )}
      {copied ? "Copied!" : "Study Snapshot"}
    </button>
  );
}
