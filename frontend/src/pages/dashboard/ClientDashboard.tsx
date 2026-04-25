import { StatsCard } from '@/components/dashboard/StatsCard';
import { ResponseChart } from '@/components/dashboard/ResponseChart';
import { Spinner } from '@/components/common/Spinner';
import { useDashboardSummary, useCompletionRates } from '@/hooks/useDashboard';
import { useSurveys } from '@/hooks/useSurveys';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_TIMESERIES } from '@/mocks/data';

export function ClientDashboard() {
  const { data: summary, isPending } = useDashboardSummary();
  const { data: rates } = useCompletionRates();
  const { data: surveys } = useSurveys({ status: 'LIVE' });

  if (isPending) {
    return <div className="center-spinner"><Spinner size="lg" /></div>;
  }

  const s = summary ?? { totalSurveys: 0, activeSurveys: 0, totalResponses: 0, avgCompletionRate: 0, responsesThisMonth: 0 };

  return (
    <div>
      <div className="kgrid">
        <StatsCard label="Total Surveys"    value={s.totalSurveys} />
        <StatsCard label="Active Surveys"   value={s.activeSurveys} delta="Live now" deltaUp />
        <StatsCard label="Total Responses"  value={s.totalResponses.toLocaleString()} />
        <StatsCard label="Avg Completion"   value={`${s.avgCompletionRate}%`} sub={`${s.responsesThisMonth} this month`} />
      </div>

      <div className="cgrid">
        <ResponseChart data={MOCK_TIMESERIES} title="Daily responses — last 30 days" />

        <div className="ccard">
          <div className="chead">
            <div>
              <div className="ctitle">Completion rates</div>
              <div className="csub">By survey</div>
            </div>
          </div>
          {rates && rates.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={rates} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="title" tick={{ fontSize: 9, fill: 'var(--muted)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--muted)' }} tickLine={false} axisLine={false} unit="%" />
                <Tooltip
                  formatter={(v: number) => `${v}%`}
                  contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text)' }}
                />
                <Bar dataKey="completionRate" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--muted)', fontSize: 13 }}>No data yet</div>
          )}
        </div>
      </div>

      {surveys && surveys.content.length > 0 && (
        <div className="ccard">
          <div className="sh" style={{ marginBottom: 14 }}>
            <div className="st">Active surveys</div>
          </div>
          <div className="tw" style={{ marginBottom: 0 }}>
            <div className="tscroll">
              <table>
                <thead>
                  <tr>
                    <th>Survey</th>
                    <th>Progress</th>
                    <th>Responses</th>
                  </tr>
                </thead>
                <tbody>
                  {surveys.content.map((survey) => {
                    const pct = survey.targetResponseCount > 0
                      ? Math.min(100, (survey.receivedResponseCount / survey.targetResponseCount) * 100)
                      : 0;
                    return (
                      <tr key={survey.id}>
                        <td><div className="sn">{survey.title}</div></td>
                        <td>
                          <div className="pbar">
                            <div className="pfill" style={{ width: `${pct}%` }} />
                          </div>
                        </td>
                        <td style={{ color: 'var(--muted)' }}>
                          {survey.receivedResponseCount.toLocaleString()} / {survey.targetResponseCount.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
