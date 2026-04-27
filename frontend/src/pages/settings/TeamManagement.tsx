import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Spinner } from '@/components/common/Spinner';
import { useTeam, useInviteTeamMember, useRemoveTeamMember } from '@/hooks/useTeam';
import type { TeamRole } from '@/types';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  role:  z.enum(['ADMIN', 'MEMBER', 'VIEWER']),
});
type FormValues = z.infer<typeof schema>;

const ROLE_COLOR: Record<TeamRole, string> = {
  OWNER:  '#818CF8',
  ADMIN:  '#F4A340',
  MEMBER: '#60A5FA',
  VIEWER: '#34D399',
};

function initials(email: string) {
  return email.split('@')[0].slice(0, 2).toUpperCase();
}

export function TeamManagement() {
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  const { data: members, isPending } = useTeam();
  const invite = useInviteTeamMember();
  const remove = useRemoveTeamMember();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'VIEWER' },
  });

  const onSubmit = (values: FormValues) => {
    invite.mutate(values, { onSuccess: () => reset() });
  };

  return (
    <div>
      <div className="sh"><div className="st">Team</div></div>

      {isPending ? (
        <div className="center-spinner"><Spinner size="lg" /></div>
      ) : (
        <div className="tw" style={{ marginBottom: 20 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 600, color: 'var(--muted)', letterSpacing: '.5px', textTransform: 'uppercase' }}>
            {(members ?? []).length} members
          </div>
          {(members ?? []).map((m) => (
            <div key={m.id} className="member-row">
              <div className="mem-avatar" style={{ background: ROLE_COLOR[m.role] ?? 'var(--accent)' }}>
                {initials(m.email)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="mem-name">{m.email}</div>
                <div className="mem-email">Joined {new Date(m.createdAt).toLocaleDateString()}</div>
              </div>
              <span className={`role-badge role-${m.role}`}>{m.role}</span>
              {m.role !== 'OWNER' && (
                <RoleGuard roles={['CLIENT_ADMIN', 'PLATFORM_ADMIN']}>
                  <button
                    className="btn btn-d btn-xs"
                    onClick={() => setConfirmRemove(m.id)}
                    disabled={remove.isPending}
                  >
                    Remove
                  </button>
                </RoleGuard>
              )}
            </div>
          ))}
        </div>
      )}

      <RoleGuard roles={['CLIENT_ADMIN', 'PLATFORM_ADMIN']}>
        <div className="fsec">
          <div className="fst"><span className="fsi">✉</span> Invite member</div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="frow">
              <Input label="Email address" type="email" error={errors.email?.message} {...register('email')} />
              <Select label="Role" options={[
                { value: 'VIEWER', label: 'Viewer'  },
                { value: 'MEMBER', label: 'Member'  },
                { value: 'ADMIN',  label: 'Admin'   },
              ]} {...register('role')} />
            </div>
            <div className="factions">
              <button type="submit" className="btn btn-p" disabled={invite.isPending}>
                {invite.isPending && <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />}
                Send invite
              </button>
            </div>
          </form>
        </div>
      </RoleGuard>

      {confirmRemove && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setConfirmRemove(null)}
        >
          <div
            style={{ background: 'var(--surface)', borderRadius: 12, padding: 24, maxWidth: 360, width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 12 }}>Remove team member?</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>This will revoke their access immediately.</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-s btn-sm" onClick={() => setConfirmRemove(null)}>Cancel</button>
              <button
                className="btn btn-d btn-sm"
                onClick={() => { remove.mutate(confirmRemove); setConfirmRemove(null); }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
