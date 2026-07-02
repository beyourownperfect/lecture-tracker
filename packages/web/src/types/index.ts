export interface Subject {
  id: string;
  name: string;
  order: number;
  totalLectures?: number;
  completedLectures?: number;
  totalDuration?: number;
  completedDuration?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Topic {
  id: string;
  name: string;
  order: number;
  subjectId: string;
  totalPyqs: number;
  solvedPyqs: number;
  createdAt: string;
  updatedAt: string;
}

export interface Lecture {
  id: string;
  title: string;
  duration: number;
  completed: boolean;
  completedAt: string | null;
  order: number;
  topicId: string;
  createdAt: string;
  updatedAt: string;
  revisions: Revision[];
}

export type RevisionType = "NOTES" | "FLASHCARDS";

export interface Revision {
  id: string;
  type: RevisionType;
  scheduledDate: string;
  completed: boolean;
  revisionNumber: number | null;
  lectureId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PopulatedRevision {
  id: string;
  type: RevisionType;
  scheduledDate: string;
  completed: boolean;
  revisionNumber: number | null;
  lectureId: {
    id: string;
    title: string;
    completed: boolean;
    topicId: {
      id: string;
      name: string;
      subjectId: {
        id: string;
        name: string;
      };
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface RevisionDashboard {
  overdue: PopulatedRevision[];
  dueToday: PopulatedRevision[];
  upcoming: PopulatedRevision[];
}

export interface SubjectTest {
  id: string;
  name: string;
  date: string;
  score: number | null;
  completed: boolean;
  subjectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TopicTest {
  id: string;
  name: string;
  date: string;
  score: number | null;
  completed: boolean;
  topicId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FullMockTest {
  id: string;
  name: string;
  date: string;
  score: number | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PopulatedSubjectTest {
  id: string;
  name: string;
  date: string;
  score: number | null;
  completed: boolean;
  subjectId: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface PopulatedTopicTest {
  id: string;
  name: string;
  date: string;
  score: number | null;
  completed: boolean;
  topicId: { id: string; name: string; subjectId: { id: string; name: string } };
  createdAt: string;
  updatedAt: string;
}

export interface TestDashboard {
  subjectTests: PopulatedSubjectTest[];
  topicTests: PopulatedTopicTest[];
  mockTests: FullMockTest[];
}
