interface StatsCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: string;
}

export function StatsCard({ label, value, sub, icon }: StatsCardProps) {
  return (
    <div className="card-padded flex items-start gap-4">
      {icon && (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-xl text-primary-600">
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}
