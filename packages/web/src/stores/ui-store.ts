import { create } from "zustand";

interface UIState {
  selectedSubjectId: string | null;
  expandedTopicIds: string[];
  view: "subjects" | "revisions" | "tests";

  selectSubject: (id: string | null) => void;
  toggleTopic: (id: string) => void;
  setExpandedTopicIds: (ids: string[]) => void;
  setView: (view: "subjects" | "revisions" | "tests") => void;
}

export const useUIStore = create<UIState>((set) => ({
  selectedSubjectId: null,
  expandedTopicIds: [],
  view: "subjects",

  selectSubject: (id) =>
    set({
      selectedSubjectId: id,
      expandedTopicIds: [],
      view: "subjects",
    }),

  toggleTopic: (id) =>
    set((state) => {
      const idx = state.expandedTopicIds.indexOf(id);
      if (idx === -1) {
        return { expandedTopicIds: [...state.expandedTopicIds, id] };
      }
      return { expandedTopicIds: state.expandedTopicIds.filter((v) => v !== id) };
    }),

  setExpandedTopicIds: (ids) => set({ expandedTopicIds: ids }),

  setView: (view) => set({ view, selectedSubjectId: null, expandedTopicIds: [] }),
}));
