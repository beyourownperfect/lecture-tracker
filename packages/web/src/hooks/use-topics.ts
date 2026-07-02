import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Topic } from "../types";

export function useTopics(subjectId: string | null) {
  return useQuery<Topic[]>({
    queryKey: ["topics", subjectId],
    queryFn: () => api.get(`/api/subjects/${subjectId}/topics`),
    enabled: !!subjectId,
    staleTime: 30_000,
  });
}

export function useCreateTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; subjectId: string; order?: number }) =>
      api.post<Topic>("/api/topics", data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["topics", variables.subjectId] });
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}

export function useUpdateTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; order?: number; totalPyqs?: number; solvedPyqs?: number }) =>
      api.put<Topic>(`/api/topics/${id}`, data),
    onMutate: async ({ id, ...data }) => {
      await queryClient.cancelQueries({ queryKey: ["topics"] });
      const allTopicQueries = queryClient.getQueriesData<Topic[]>({ queryKey: ["topics"] });

      allTopicQueries.forEach(([key, topics]) => {
        if (!topics) return;
        queryClient.setQueryData<Topic[]>(key, topics.map((t) =>
          t.id === id ? { ...t, ...data } : t
        ));
      });

      return { previousQueries: allTopicQueries };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}

export function useDeleteTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; subjectId: string }) =>
      api.delete(`/api/topics/${vars.id}`),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["topics"] });
      const allTopicQueries = queryClient.getQueriesData<Topic[]>({ queryKey: ["topics"] });

      allTopicQueries.forEach(([key, topics]) => {
        if (!topics) return;
        queryClient.setQueryData<Topic[]>(key, topics.filter((t) => t.id !== id));
      });

      return { previousQueries: allTopicQueries };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ["topics", variables.subjectId] });
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}
