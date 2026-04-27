import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/services/analyticsApi';

export function useSurveyAnalytics(id: string) {
  return useQuery({
    queryKey: ['analytics', 'survey', id],
    queryFn: () => analyticsApi.surveyAnalytics(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useCrossSurveyAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'cross-survey'],
    queryFn: analyticsApi.crossSurveyAnalytics,
    staleTime: 60_000,
  });
}
