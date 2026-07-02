import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Revision, RevisionType, RevisionDashboard, PopulatedRevision } from "../types";

export function useRevisionDashboard() {
  return useQuery<RevisionDashboard>({
    queryKey: ["revisions", "dashboard"],
    queryFn: () => api.get("/api/revisions/dashboard"),
    staleTime: 30_000,
  });
}

export function useCreateRevision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      type: RevisionType;
      scheduledDate: string;
      lectureId: string;
    }) => api.post<Revision>("/api/revisions", { ...data, completed: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lectures"] });
      queryClient.invalidateQueries({ queryKey: ["revisions"] });
    },
  });
}

export function useUpdateRevision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      completed?: boolean;
      scheduledDate?: string;
    }) => api.put<Revision>(`/api/revisions/${id}`, data),
    onMutate: async ({ id, ...data }) => {
      await queryClient.cancelQueries({ queryKey: ["revisions"] });
      const dashboardQuery = queryClient.getQueryData<RevisionDashboard>(["revisions", "dashboard"]);
      if (dashboardQuery) {
        const updateIn = (list: PopulatedRevision[]) =>
          list.map((r) => (r.id === id ? { ...r, ...data } as PopulatedRevision : r));
        queryClient.setQueryData<RevisionDashboard>(["revisions", "dashboard"], {
          overdue: updateIn(dashboardQuery.overdue),
          dueToday: updateIn(dashboardQuery.dueToday),
          upcoming: updateIn(dashboardQuery.upcoming),
        });
      }
      return { previousDashboard: dashboardQuery };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousDashboard) {
        queryClient.setQueryData(["revisions", "dashboard"], context.previousDashboard);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["lectures"] });
      queryClient.invalidateQueries({ queryKey: ["revisions"] });
    },
  });
}

export function useDeleteRevision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/revisions/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["revisions"] });
      const dashboardQuery = queryClient.getQueryData<RevisionDashboard>(["revisions", "dashboard"]);
      if (dashboardQuery) {
        const filterOut = (list: PopulatedRevision[]) => list.filter((r) => r.id !== id);
        queryClient.setQueryData<RevisionDashboard>(["revisions", "dashboard"], {
          overdue: filterOut(dashboardQuery.overdue),
          dueToday: filterOut(dashboardQuery.dueToday),
          upcoming: filterOut(dashboardQuery.upcoming),
        });
      }
      return { previousDashboard: dashboardQuery };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousDashboard) {
        queryClient.setQueryData(["revisions", "dashboard"], context.previousDashboard);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["lectures"] });
      queryClient.invalidateQueries({ queryKey: ["revisions"] });
    },
  });
}
