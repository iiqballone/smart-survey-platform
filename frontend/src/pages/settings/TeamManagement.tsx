import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { RoleGuard } from '@/components/auth/RoleGuard';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  role:  z.enum(['CLIENT_ADMIN', 'CLIENT_VIEWER']),
});
type FormValues = z.infer<typeof schema>;

const MOCK_MEMBERS = [
  { id: '1', name: 'Alice Admin',  email: 'alice@acme.com',  role: 'OWNER',  avatar: '#818CF8' },
  { id: '2', name: 'Bob Builder',  email: 'bob@acme.com',    role: 'ADMIN',  avatar: '#F4A340' },
  { id: '3', name: 'Carol Viewer', email: 'carol@acme.com',  role: 'VIEWER', avatar: '#34D399' },
];

export function TeamManagement() {
  const [pending, setPending] = useState<FormValues[]>([]);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'CLIENT_VIEWER' },
  });

  const onSubmit = (values: FormValues) => { setPending((p) => [...p, values]); reset(); };

  return (
    <div>
      <div className="sh"><div className="st">Team</div></div>

      <div className="tw" style={{ marginBottom: 20 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 600, color: 'var(--muted)', letterSpacing: '.5px', textTransform: 'uppercase' }}>
          {MOCK_MEMBERS.length} members
        </div>
        {MOCK_MEMBERS.map((m) => (
          <div key={m.id} className="member-row">
            <div className="mem-avatar" style={{ background: m.avatar }}>{m.name[0]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="mem-name">{m.name}</div>
              <div className="mem-email">{m.email}</div>
            </div>
            <span className={`role-badge role-${m.role}`}>{m.role}</span>
          </div>
        ))}
      </div>

      <RoleGuard roles={['CLIENT_ADMIN', 'PLATFORM_ADMIN']}>
        <div className="fsec">
          <div className="fst"><span className="fsi">✉</span> Invite member</div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="frow">
              <Input label="Email address" type="email" error={errors.email?.message} {...register('email')} />
              <Select label="Role" options={[
                { value: 'CLIENT_VIEWER', label: 'Viewer' },
                { value: 'CLIENT_ADMIN',  label: 'Admin'  },
              ]} {...register('role')} />
            </div>
            <div className="factions">
              <button type="submit" className="btn btn-p">Send invite</button>
            </div>
          </form>
        </div>

        {pending.length > 0 && (
          <div className="tw">
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 600, color: 'var(--muted)', letterSpacing: '.5px', textTransform: 'uppercase' }}>
              Pending invitations
            </div>
            {pending.map((inv, i) => (
              <div key={i} className="member-row">
                <div className="mem-avatar" style={{ background: 'var(--border)' }}>?</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="mem-name">{inv.email}</div>
                  <div className="mem-email">Invitation pending</div>
                </div>
                <span className={`role-badge role-${inv.role === 'CLIENT_ADMIN' ? 'ADMIN' : 'VIEWER'}`}>
                  {inv.role === 'CLIENT_ADMIN' ? 'ADMIN' : 'VIEWER'}
                </span>
              </div>
            ))}
          </div>
        )}
      </RoleGuard>
    </div>
  );
}
