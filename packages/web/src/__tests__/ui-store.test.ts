import { describe, it, expect, beforeEach } from "vitest";
import { useUIStore } from "../stores/ui-store";

describe("UI Store", () => {
  beforeEach(() => {
    useUIStore.setState({
      selectedSubjectId: null,
      expandedTopicIds: [],
      view: "subjects",
    });
  });

  it("starts with no subject selected and subjects view", () => {
    const state = useUIStore.getState();
    expect(state.selectedSubjectId).toBeNull();
    expect(state.view).toBe("subjects");
    expect(state.expandedTopicIds).toEqual([]);
  });

  it("selects a subject and resets expanded topics", () => {
    useUIStore.getState().selectSubject("subject-1");
    const state = useUIStore.getState();
    expect(state.selectedSubjectId).toBe("subject-1");
    expect(state.expandedTopicIds).toEqual([]);
    expect(state.view).toBe("subjects");
  });

  it("toggles topic expansion", () => {
    const store = useUIStore.getState();
    store.toggleTopic("topic-1");
    expect(useUIStore.getState().expandedTopicIds).toContain("topic-1");

    store.toggleTopic("topic-1");
    expect(useUIStore.getState().expandedTopicIds).not.toContain("topic-1");
  });

  it("switch view clears subject selection", () => {
    useUIStore.getState().selectSubject("subject-1");
    useUIStore.getState().setView("revisions");
    const state = useUIStore.getState();
    expect(state.view).toBe("revisions");
    expect(state.selectedSubjectId).toBeNull();
    expect(state.expandedTopicIds).toEqual([]);
  });

  it("supports all three views", () => {
    useUIStore.getState().setView("tests");
    expect(useUIStore.getState().view).toBe("tests");

    useUIStore.getState().setView("revisions");
    expect(useUIStore.getState().view).toBe("revisions");

    useUIStore.getState().setView("subjects");
    expect(useUIStore.getState().view).toBe("subjects");
  });
});
