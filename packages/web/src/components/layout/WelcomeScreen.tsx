import { useSubjects } from "../../hooks/use-subjects";
import { formatDuration } from "../ui/progress";

export function WelcomeScreen() {
  const { data: subjects = [] } = useSubjects();

  const totalLectures = subjects.reduce((sum, s) => sum + (s.totalLectures || 0), 0);
  const completedLectures = subjects.reduce((sum, s) => sum + (s.completedLectures || 0), 0);
  const overallProgress = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;
  const totalDuration = subjects.reduce((sum, s) => sum + (s.totalDuration || 0), 0);
  const completedDuration = subjects.reduce((sum, s) => sum + (s.completedDuration || 0), 0);
  const subjectsStarted = subjects.filter((s) => (s.totalLectures || 0) > 0).length;

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-md px-8 py-12">
        <h2 className="text-xl font-semibold text-text-primary mb-3">
          Welcome to your Lecture Tracker
        </h2>
        <p className="text-sm text-text-secondary leading-relaxed mb-10">
          Select a subject from the sidebar to begin tracking your progress.
          Your lecture progress, revisions, PYQs and tests will appear here.
        </p>

        {totalLectures > 0 && (
          <div className="grid grid-cols-3 gap-6 max-w-sm mx-auto">
            <div className="text-center">
              <div className="text-2xl font-semibold text-text-primary tabular-nums">
                {completedLectures}
                <span className="text-text-secondary text-sm">/{totalLectures}</span>
              </div>
              <p className="text-xs text-text-secondary mt-1">Lectures</p>
            </div>

            <div className="text-center">
              <div className="text-2xl font-semibold text-primary tabular-nums">
                {overallProgress}%
              </div>
              <p className="text-xs text-text-secondary mt-1">Complete</p>
            </div>

            <div className="text-center">
              <div className="text-2xl font-semibold text-text-primary tabular-nums">
                {subjectsStarted}
                <span className="text-text-secondary text-sm">/{subjects.length}</span>
              </div>
              <p className="text-xs text-text-secondary mt-1">Subjects</p>
            </div>

            <div className="col-span-3 mt-2">
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>

            {totalDuration > 0 && (
              <div className="col-span-3 text-center">
                <p className="text-xs text-text-secondary">
                  {formatDuration(completedDuration)} of {formatDuration(totalDuration)} completed
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
