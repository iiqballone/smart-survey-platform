import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { surveyApi } from '@/services/surveyApi';
import type { CreateSurveyRequest, SurveyStatus } from '@/types';

export const surveyKeys = {
  all: ['surveys'] as const,
  list: (filters?: { status?: SurveyStatus }) => [...surveyKeys.all, 'list', filters] as const,
  detail: (id: string) => [...surveyKeys.all, id] as const,
};

export function useSurveys(filters?: { status?: SurveyStatus }) {
  return useQuery({
    queryKey: surveyKeys.list(filters),
    queryFn: () => surveyApi.list(filters),
  });
}

export function useSurvey(id: string) {
  return useQuery({
    queryKey: surveyKeys.detail(id),
    queryFn: () => surveyApi.get(id),
    enabled: !!id,
  });
}

export function useCreateSurvey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSurveyRequest) => surveyApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: surveyKeys.all }),
  });
}

export function useUpdateSurvey(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateSurveyRequest>) => surveyApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: surveyKeys.detail(id) });
      qc.invalidateQueries({ queryKey: surveyKeys.all });
    },
  });
}

export function usePublishSurvey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => surveyApi.publish(id),
    onSuccess: (_data, id) => qc.invalidateQueries({ queryKey: surveyKeys.detail(id) }),
  });
}

export function usePauseSurvey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => surveyApi.pause(id),
    onSuccess: (_data, id) => qc.invalidateQueries({ queryKey: surveyKeys.detail(id) }),
  });
}

export function useCloseSurvey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => surveyApi.close(id),
    onSuccess: (_data, id) => qc.invalidateQueries({ queryKey: surveyKeys.detail(id) }),
  });
}

export function useDeleteSurvey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => surveyApi.delete(id).then(() => {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: surveyKeys.all }),
  });
}
