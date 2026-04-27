import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamApi } from '@/services/teamApi';
import type { InviteRequest } from '@/types';

export const teamKeys = {
  all: ['team'] as const,
};

export function useTeam() {
  return useQuery({
    queryKey: teamKeys.all,
    queryFn: teamApi.list,
  });
}

export function useInviteTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InviteRequest) => teamApi.invite(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: teamKeys.all }),
  });
}

export function useRemoveTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => teamApi.remove(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: teamKeys.all }),
  });
}
