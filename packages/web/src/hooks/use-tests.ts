import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { SubjectTest, TopicTest, FullMockTest, TestDashboard } from "../types";

export function useTestDashboard() {
  return useQuery<TestDashboard>({
    queryKey: ["tests", "dashboard"],
    queryFn: () => api.get("/api/tests/dashboard"),
    staleTime: 30_000,
  });
}

export function useSubjectTests(subjectId: string | null) {
  return useQuery<SubjectTest[]>({
    queryKey: ["subject-tests", subjectId],
    queryFn: () => api.get(`/api/subjects/${subjectId}/tests`),
    enabled: !!subjectId,
  });
}

export function useTopicTests(topicId: string | null) {
  return useQuery<TopicTest[]>({
    queryKey: ["topic-tests", topicId],
    queryFn: () => api.get(`/api/topics/${topicId}/tests`),
    enabled: !!topicId,
  });
}

export function useMockTests() {
  return useQuery<FullMockTest[]>({
    queryKey: ["mock-tests"],
    queryFn: () => api.get("/api/mock-tests"),
  });
}

export function useCreateSubjectTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; date: string; subjectId: string; score?: number | null }) =>
      api.post<SubjectTest>("/api/subject-tests", data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subject-tests", variables.subjectId] });
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
  });
}

export function useUpdateSubjectTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; date?: string; score?: number | null; completed?: boolean }) =>
      api.put<SubjectTest>(`/api/subject-tests/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subject-tests"] });
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
  });
}

export function useDeleteSubjectTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; subjectId: string }) =>
      api.delete(`/api/subject-tests/${vars.id}`),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subject-tests", variables.subjectId] });
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
  });
}

export function useCreateTopicTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; date: string; topicId: string; score?: number | null }) =>
      api.post<TopicTest>("/api/topic-tests", data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["topic-tests", variables.topicId] });
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
  });
}

export function useUpdateTopicTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; date?: string; score?: number | null; completed?: boolean }) =>
      api.put<TopicTest>(`/api/topic-tests/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topic-tests"] });
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
  });
}

export function useDeleteTopicTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; topicId: string }) =>
      api.delete(`/api/topic-tests/${vars.id}`),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["topic-tests", variables.topicId] });
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
  });
}

export function useCreateMockTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; date: string; score?: number | null }) =>
      api.post<FullMockTest>("/api/mock-tests", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mock-tests"] });
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
  });
}

export function useUpdateMockTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; date?: string; score?: number | null; completed?: boolean }) =>
      api.put<FullMockTest>(`/api/mock-tests/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mock-tests"] });
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
  });
}

export function useDeleteMockTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/mock-tests/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mock-tests"] });
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
  });
}
