import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Lecture } from "../types";

export function useLectures(topicId: string | null) {
  return useQuery<Lecture[]>({
    queryKey: ["lectures", topicId],
    queryFn: () => api.get(`/topics/${topicId}/lectures`),
    enabled: !!topicId,
    staleTime: 30_000,
  });
}

export function useCreateLecture() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; topicId: string; duration?: number; order?: number }) =>
      api.post<Lecture>("/lectures", data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lectures", variables.topicId] });
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}

export function useUpdateLecture() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      title?: string;
      duration?: number;
      order?: number;
      completed?: boolean;
      completedAt?: string | null;
    }) => api.put<Lecture>(`/lectures/${id}`, data),
    onMutate: async ({ id, ...data }) => {
      await queryClient.cancelQueries({ queryKey: ["lectures"] });
      const allLectureQueries = queryClient.getQueriesData<Lecture[]>({ queryKey: ["lectures"] });

      allLectureQueries.forEach(([key, lectures]) => {
        if (!lectures) return;
        queryClient.setQueryData<Lecture[]>(key, lectures.map((l) =>
          l.id === id ? { ...l, ...data } : l
        ));
      });

      return { previousQueries: allLectureQueries };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["lectures"] });
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}

export function useDeleteLecture() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; topicId: string }) =>
      api.delete(`/lectures/${vars.id}`),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["lectures"] });
      const allLectureQueries = queryClient.getQueriesData<Lecture[]>({ queryKey: ["lectures"] });

      allLectureQueries.forEach(([key, lectures]) => {
        if (!lectures) return;
        queryClient.setQueryData<Lecture[]>(key, lectures.filter((l) => l.id !== id));
      });

      return { previousQueries: allLectureQueries };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lectures", variables?.topicId] });
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}
