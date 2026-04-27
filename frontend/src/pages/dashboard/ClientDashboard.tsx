import { StatsCard } from '@/components/dashboard/StatsCard';
import { Spinner } from '@/components/common/Spinner';
import { useDashboardSummary, useCompletionRates } from '@/hooks/useDashboard';
import { useSurveys } from '@/hooks/useSurveys';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useCrossSurveyAnalytics } from '@/hooks/useAnalytics';
import {
  AreaChart, Area, Legend,
} from 'recharts';

const TT = {
  contentStyle: {
    background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 8, fontSize: 12, color: 'var(--text)',
  },
};

export function ClientDashboard() {
  const { data: summary, isPending } = useDashboardSummary();
  const { data: rates } = useCompletionRates();
  const { data: surveys } = useSurveys({ status: 'LIVE' });
  const { data: crossAnalytics } = useCrossSurveyAnalytics();

  if (isPending) {
    return <div className="center-spinner"><Spinner size="lg" /></div>;
  }

  const s = summary ?? { totalSurveys: 0, activeSurveys: 0, totalResponses: 0, avgCompletionRate: 0, responsesThisMonth: 0 };

  const trendData = (crossAnalytics?.responseTrend ?? []).map(p => ({
    date: p.period,
    responses: p.responses,
    completions: p.completions,
  }));

  return (
    <div>
      <div className="kgrid">
        <StatsCard label="Total Surveys"    value={s.totalSurveys} />
        <StatsCard label="Active Surveys"   value={s.activeSurveys} delta="Live now" deltaUp />
        <StatsCard label="Total Responses"  value={s.totalResponses.toLocaleString()} />
        <StatsCard label="Avg Completion"   value={`${s.avgCompletionRate}%`} sub={`${s.responsesThisMonth} this month`} />
      </div>

      <div className="cgrid">
        {trendData.length > 0 ? (
          <div className="ccard">
            <div className="chead">
              <div>
                <div className="ctitle">Response velocity</div>
                <div className="csub">Daily responses vs completions</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendData} margin={{ top: 4, right: 12, bottom: 4, left: -16 }}>
                <defs>
                  <linearGradient id="gradResp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--accent)"  stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--accent)"  stopOpacity={0}    />
                  </linearGradient>
                  <linearGradient id="gradComp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--success)" stopOpacity={0.2}  />
                    <stop offset="95%" stopColor="var(--success)" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--muted)' }} tickLine={false} axisLine={false} />
                <Tooltip {...TT} />
                <Legend wrapperStyle={{ fontSize: 11, color: 'var(--muted)' }} />
                <Area type="monotone" dataKey="responses"   stroke="var(--accent)"  strokeWidth={2} fill="url(#gradResp)" name="Responses"   dot={false} />
                <Area type="monotone" dataKey="completions" stroke="var(--success)" strokeWidth={2} fill="url(#gradComp)" name="Completions" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="ccard">
            <div className="chead">
              <div className="ctitle">Response velocity</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--muted)', fontSize: 13 }}>No data yet</div>
          </div>
        )}

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
                  {...TT}
                  formatter={(v: number) => `${v}%`}
                />
                <Bar dataKey="completionRate" radius={[4, 4, 0, 0]}>
                  {rates.map((r, i) => (
                    <Cell key={i} fill={r.completionRate >= 80 ? 'var(--success)' : r.completionRate >= 60 ? 'var(--accent)' : 'var(--warning)'} />
                  ))}
                </Bar>
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
                    <th>Country</th>
                    <th>Progress</th>
                    <th>Completes</th>
                  </tr>
                </thead>
                <tbody>
                  {surveys.content.map((survey) => {
                    const pct = survey.completesRequired > 0
                      ? Math.min(100, (survey.completedCount / survey.completesRequired) * 100)
                      : 0;
                    return (
                      <tr key={survey.id}>
                        <td><div className="sn">{survey.title}</div></td>
                        <td style={{ color: 'var(--muted)' }}>{survey.country}</td>
                        <td>
                          <div className="pbar">
                            <div className="pfill" style={{ width: `${pct}%` }} />
                          </div>
                        </td>
                        <td style={{ color: 'var(--muted)' }}>
                          {survey.completedCount.toLocaleString()} / {survey.completesRequired.toLocaleString()}
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
