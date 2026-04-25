import { useQuery } from '@tanstack/react-query';
import { responseApi } from '@/services/responseApi';

export const responseKeys = {
  list: (surveyId: string, filters?: object) => ['responses', surveyId, filters] as const,
};

export function useResponses(surveyId: string, filters?: { page?: number; size?: number; from?: string; to?: string }) {
  return useQuery({
    queryKey: responseKeys.list(surveyId, filters),
    queryFn: () => responseApi.list(surveyId, filters),
    enabled: !!surveyId,
  });
}
