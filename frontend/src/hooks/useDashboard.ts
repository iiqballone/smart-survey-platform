import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/dashboardApi';

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: dashboardApi.summary,
    staleTime: 60_000,
  });
}

export function useTimeSeries(surveyId: string, from: string, to: string, granularity: 'day' | 'week' | 'month' = 'day') {
  return useQuery({
    queryKey: ['dashboard', 'timeseries', surveyId, from, to, granularity],
    queryFn: () => dashboardApi.timeSeries(surveyId, from, to, granularity),
    enabled: !!surveyId && !!from && !!to,
  });
}

export function useCompletionRates() {
  return useQuery({
    queryKey: ['dashboard', 'completion-rates'],
    queryFn: dashboardApi.completionRates,
    staleTime: 60_000,
  });
}
