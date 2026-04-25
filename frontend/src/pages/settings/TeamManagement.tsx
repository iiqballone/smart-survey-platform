import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { RoleGuard } from '@/components/auth/RoleGuard';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  role:  z.enum(['CLIENT_ADMIN', 'CLIENT_VIEWER']),
});
type FormValues = z.infer<typeof schema>;

export function TeamManagement() {
  const [invited, setInvited] = useState<FormValues[]>([]);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'CLIENT_VIEWER' },
  });

  const onSubmit = (values: FormValues) => {
    setInvited((prev) => [...prev, values]);
    reset();
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="Team Management" subtitle="Invite team members and manage roles" />

      <RoleGuard roles={['CLIENT_ADMIN', 'PLATFORM_ADMIN']}>
        <div className="card-padded mb-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">Invite a team member</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="flex gap-3 items-end">
            <div className="flex-1">
              <Input label="Email address" type="email" error={errors.email?.message} {...register('email')} />
            </div>
            <Select
              label="Role"
              options={[
                { value: 'CLIENT_VIEWER', label: 'Viewer' },
                { value: 'CLIENT_ADMIN',  label: 'Admin'  },
              ]}
              {...register('role')}
            />
            <Button type="submit">Invite</Button>
          </form>
        </div>
      </RoleGuard>

      {invited.length > 0 && (
        <div className="card-padded">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Pending invitations</h2>
          <div className="space-y-2">
            {invited.map((inv, i) => (
              <div key={i} className="flex items-center justify-between rounded-md bg-gray-50 px-4 py-2 text-sm">
                <span className="text-gray-800">{inv.email}</span>
                <Badge label={inv.role} color="blue" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
