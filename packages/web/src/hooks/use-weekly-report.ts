import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface WeeklyReportResponse {
  subjects: { id: string; name: string; order: number; totalLectures?: number; completedLectures?: number; totalDuration?: number; completedDuration?: number }[];
  topics: { id: string; name: string; order: number; subjectId: string; totalPyqs: number; solvedPyqs: number }[];
  lectures: { id: string; title: string; duration: number; completed: boolean; completedAt: string | null; topicId: string }[];
  completedLecturesThisWeek: { id: string; title: string; duration: number; completed: boolean; completedAt: string; topicId: string }[];
  allRevisions: { id: string; type: string; scheduledDate: string; completed: boolean; revisionNumber: number | null; lectureId: string }[];
  subjectTests: { id: string; name: string; date: string; score: number | null; completed: boolean }[];
  topicTests: { id: string; name: string; date: string; score: number | null; completed: boolean }[];
  mockTests: { id: string; name: string; date: string; score: number | null; completed: boolean }[];
  testsThisWeek: number;
}

export function useWeeklyReport() {
  return useQuery<WeeklyReportResponse>({
    queryKey: ["weekly-report"],
    queryFn: () => api.get("/reports/weekly"),
    staleTime: 5 * 60 * 1000,
  });
}
