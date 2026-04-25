import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/dashboardApi';

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: dashboardApi.summary,
    staleTime: 60_000,
  });
}

export function useTimeSeries(surveyId: string, from: string, to: string) {
  return useQuery({
    queryKey: ['dashboard', 'timeseries', surveyId, from, to],
    queryFn: () => dashboardApi.timeSeries(surveyId, from, to),
    enabled: !!surveyId,
  });
}

export function useCompletionRates() {
  return useQuery({
    queryKey: ['dashboard', 'completion-rates'],
    queryFn: dashboardApi.completionRates,
    staleTime: 60_000,
  });
}
