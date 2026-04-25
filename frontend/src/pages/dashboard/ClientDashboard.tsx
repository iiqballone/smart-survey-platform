import { PageHeader } from '@/components/layout/PageHeader';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ResponseChart } from '@/components/dashboard/ResponseChart';
import { useDashboardSummary, useCompletionRates } from '@/hooks/useDashboard';
import { useSurveys } from '@/hooks/useSurveys';
import { Spinner } from '@/components/common/Spinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DEMO_TIMESERIES = Array.from({ length: 14 }, (_, i) => ({
  date: new Date(Date.now() - (13 - i) * 86_400_000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
  count: Math.floor(Math.random() * 80) + 10,
}));

export function ClientDashboard() {
  const { data: summary, isPending: summaryPending } = useDashboardSummary();
  const { data: rates } = useCompletionRates();
  const { data: surveys } = useSurveys({ status: 'LIVE' });

  if (summaryPending) {
    return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  }

  const stats = summary ?? {
    totalSurveys: 0,
    activeSurveys: 0,
    totalResponses: 0,
    avgCompletionRate: 0,
    responsesThisMonth: 0,
  };

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of your surveys and responses" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <StatsCard icon="◧" label="Total Surveys" value={stats.totalSurveys} />
        <StatsCard icon="▶" label="Active Surveys" value={stats.activeSurveys} />
        <StatsCard icon="✉" label="Total Responses" value={stats.totalResponses.toLocaleString()} />
        <StatsCard
          icon="✔"
          label="Avg Completion"
          value={`${stats.avgCompletionRate.toFixed(1)}%`}
          sub={`${stats.responsesThisMonth} this month`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <ResponseChart data={DEMO_TIMESERIES} title="Daily responses (last 14 days)" />

        <div className="card-padded">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Completion rates by survey</h3>
          {rates && rates.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={rates} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="title" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} unit="%" />
                <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
                <Bar dataKey="completionRate" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-60 items-center justify-center text-sm text-gray-400">No data yet</div>
          )}
        </div>
      </div>

      {surveys && surveys.content.length > 0 && (
        <div className="card-padded">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Active surveys</h3>
          <div className="space-y-2">
            {surveys.content.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-md bg-gray-50 px-4 py-2 text-sm">
                <span className="font-medium text-gray-800">{s.title}</span>
                <span className="text-gray-500">
                  {s.receivedResponseCount} / {s.targetResponseCount} responses
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
