interface WeeklySubject {
  id: string; name: string; order: number;
  totalLectures?: number; completedLectures?: number;
  totalDuration?: number; completedDuration?: number;
}

interface WeeklyTopic {
  id: string; name: string; order: number; subjectId: string;
  totalPyqs: number; solvedPyqs: number;
}

interface WeeklyLecture {
  id: string; title: string; duration: number;
  completed: boolean; completedAt: string | null;
  topicId: string;
}

interface WeeklyRevision {
  id: string; type: string; scheduledDate: string;
  completed: boolean; revisionNumber: number | null;
  lectureId: string;
}

interface WeeklyTest {
  id: string; name: string; date: string;
  score: number | null; completed: boolean;
}

export interface WeeklyReportParams {
  subjects: WeeklySubject[];
  topics: WeeklyTopic[];
  lectures: WeeklyLecture[];
  completedLecturesThisWeek: WeeklyLecture[];
  allRevisions: WeeklyRevision[];
  subjectTests: WeeklyTest[];
  topicTests: WeeklyTest[];
  mockTests: WeeklyTest[];
  testsThisWeek: number;
}

function pad(n: number) { return String(n).padStart(2, "0"); }

function formatDate(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

function formatHours(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function generateReport(data: WeeklyReportParams): { markdown: string; aiPrompt: string } {
  const { subjects, topics, lectures, completedLecturesThisWeek, allRevisions, subjectTests, topicTests, mockTests, testsThisWeek } = data;

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);
  const periodStart = formatDate(weekStart);
  const periodEnd = formatDate(now);

  let totalLecturesAll = 0;
  let completedLecturesAll = 0;
  let totalDurationAll = 0;
  let completedDurationAll = 0;
  for (const s of subjects) {
    totalLecturesAll += s.totalLectures || 0;
    completedLecturesAll += s.completedLectures || 0;
    totalDurationAll += s.totalDuration || 0;
    completedDurationAll += s.completedDuration || 0;
  }
  const overallPct = totalLecturesAll > 0 ? Math.round((completedLecturesAll / totalLecturesAll) * 100) : 0;

  const lecturesCompletedCount = completedLecturesThisWeek.length;
  const durationThisWeek = completedLecturesThisWeek.reduce((s, l) => s + (l.duration || 0), 0);

  const pyqList = topics
    .filter((t) => t.totalPyqs > 0)
    .map((t) => {
      const subj = subjects.find((s) => s.id === t.subjectId);
      return { subjectName: subj?.name || "Unknown", topicName: t.name, solved: t.solvedPyqs, total: t.totalPyqs };
    });
  const totalPyqs = pyqList.reduce((s, p) => s + p.total, 0);
  const solvedPyqs = pyqList.reduce((s, p) => s + p.solved, 0);

  const notesCompleted = allRevisions.filter((r) => r.completed && r.type === "NOTES").length;
  const flashcardsCompleted = allRevisions.filter((r) => r.completed && r.type === "FLASHCARDS").length;

  const upcomingRevisions = allRevisions
    .filter((r) => !r.completed)
    .slice(0, 10)
    .map((r) => ({
      type: r.type,
      date: new Date(r.scheduledDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      lectureTitle: "Revision",
    }));

  const subjectProgress = subjects
    .map((s) => {
      const total = s.totalLectures || 0;
      const done = s.completedLectures || 0;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      const durTotal = s.totalDuration || 0;
      const durDone = s.completedDuration || 0;
      return { name: s.name, total, done, pct, durTotal, durDone };
    })
    .sort((a, b) => a.pct - b.pct);

  const weakest = subjectProgress.slice(0, 3);
  const strongest = subjectProgress.slice(-3).reverse();

  const totalSubjects = subjects.length;
  const activeSubjects = subjects.filter((s) => (s.completedLectures || 0) > 0).length;
  const allTestsCount = subjectTests.length + topicTests.length + mockTests.length;

  const markdown = `# 📊 Weekly Study Report — GATE CSE

**Period:** ${periodStart} to ${periodEnd}

---

## 📈 Overall Progress

- **Syllabus:** ${completedLecturesAll}/${totalLecturesAll} lectures completed (${overallPct}%)
- **Total watch time:** ${formatHours(completedDurationAll)} / ${formatHours(totalDurationAll)}
- **Subjects active:** ${activeSubjects} / ${totalSubjects}
- **Tests recorded:** ${allTestsCount}

---

## 🔥 This Week's Activity

- **Lectures completed:** ${lecturesCompletedCount}
- **Watch time:** ${formatHours(durationThisWeek)}
- **PYQs solved:** ${solvedPyqs} / ${totalPyqs}
- **Notes revisions:** ${notesCompleted}
- **Flashcard revisions:** ${flashcardsCompleted}
- **Tests taken:** ${testsThisWeek}

${completedLecturesThisWeek.length > 0 ? `### Lectures Completed This Week\n\n${completedLecturesThisWeek.map((l) => `- ✅ ${l.title}${l.duration > 0 ? ` (${l.duration}m)` : ""}`).join("\n")}\n` : ""}

---

## 📚 Subject-Wise Progress

| Subject | Lectures | Progress | Time |
|---|---|---|---|
${subjectProgress.map((s) => `| ${s.name} | ${s.done}/${s.total} | ${s.pct}% | ${formatHours(s.durDone)} / ${formatHours(s.durTotal)} |`).join("\n")}

---

## 🎯 PYQ Progress

${pyqList.length > 0 ? pyqList.map((p) => `- **${p.subjectName} > ${p.topicName}:** ${p.solved}/${p.total}`).join("\n") : "- No PYQ data recorded yet."}

---

## 🧠 Revisions

- **Notes completed:** ${notesCompleted}
- **Flashcards completed:** ${flashcardsCompleted}
${upcomingRevisions.length > 0 ? `\n### Upcoming (Next 7 Days)\n\n${upcomingRevisions.map((r) => `- ${r.type === "NOTES" ? "📝" : "🃏"} ${r.date} — ${r.lectureTitle}`).join("\n")}` : ""}

---

## 🧪 Tests

${allTestsCount > 0
    ? subjectTests.map((t) => `- 📋 **Subject Test:** ${t.name}${t.score != null ? ` — Score: ${t.score}` : ""}${t.completed ? " ✅" : ""}`).join("\n") + "\n" +
      topicTests.map((t) => `- 📝 **Topic Test:** ${t.name}${t.score != null ? ` — Score: ${t.score}` : ""}${t.completed ? " ✅" : ""}`).join("\n") + "\n" +
      mockTests.map((t) => `- 🏆 **Mock Test:** ${t.name}${t.score != null ? ` — Score: ${t.score}` : ""}${t.completed ? " ✅" : ""}`).join("\n")
    : "- No tests recorded yet."}

---

## ⚡ Strongest Subjects

${strongest.map((s, i) => `${i + 1}. **${s.name}** — ${s.pct}% (${s.done}/${s.total})`).join("\n")}

## ⚠️ Weakest Subjects

${weakest.map((s, i) => `${i + 1}. **${s.name}** — ${s.pct}% (${s.done}/${s.total})`).join("\n")}
`;

  const aiPrompt = `You are a GATE CSE exam preparation coach. Analyze my study data from the past week and provide actionable guidance.

## Study Report

${markdown}

## Instructions

Analyze the above data and provide:

1. **Weekly Assessment:** Brief evaluation of this week's effort, consistency, and output.
2. **Strengths:** What I'm doing well. Subjects/topics where progress is strong.
3. **Weaknesses:** Problem areas — low-progress subjects, missed revisions, lack of testing.
4. **Inconsistencies:** Gaps between lecture watching and revision/testing. Imbalanced subject distribution.
5. **Syllabus Completion Estimate:** Given current pace, estimate overall GATE syllabus completion % and projected completion timeline.
6. **GATE Readiness Assessment:** On a scale of 1-10, how prepared am I currently? What would move the needle?
7. **Next Week's Priorities:**
   - Top 3 subjects to focus on
   - Recommended lecture count target
   - Revision schedule adjustments
   - Testing targets (subject tests, topic tests, mocks)
8. **Revision Strategy:** Given my upcoming scheduled revisions, suggest optimal spacing and prioritization.
9. **Practical Tips:** 2-3 specific, actionable recommendations for the coming week.

Keep recommendations practical and concise. Format with clear headings. No fluff.`;

  return { markdown, aiPrompt };
}
