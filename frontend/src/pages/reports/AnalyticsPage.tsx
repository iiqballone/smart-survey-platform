import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useCompletionRates, useDashboardSummary } from '@/hooks/useDashboard';
import { useCrossSurveyAnalytics } from '@/hooks/useAnalytics';
import { SurveyStatusBadge } from '@/components/survey/SurveyStatusBadge';
import { Spinner } from '@/components/common/Spinner';

const TT = {
  contentStyle: {
    background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 8, fontSize: 12, color: 'var(--text)',
  },
};

type Range = '7d' | '30d' | '90d';

export function AnalyticsPage() {
  const navigate = useNavigate();
  const [range, setRange] = useState<Range>('30d');
  const { data: summary } = useDashboardSummary();
  const { data: rates } = useCompletionRates();
  const { data: crossAnalytics, isPending } = useCrossSurveyAnalytics();

  const s = summary ?? { totalSurveys: 0, activeSurveys: 0, totalResponses: 0, avgCompletionRate: 0, responsesThisMonth: 0 };

  const trendData = (crossAnalytics?.responseTrend ?? []).map(p => ({
    date: p.period,
    responses: p.responses,
    completions: p.completions,
  }));

  const slicedTrend = range === '7d' ? trendData.slice(-7) : range === '30d' ? trendData.slice(-30) : trendData;

  const surveyPerf = crossAnalytics?.surveyPerformance ?? [];

  if (isPending) return <div className="center-spinner"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="sh">
        <div>
          <div className="st">Analytics</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>Cross-survey performance</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="tabs" style={{ marginBottom: 0 }}>
            {(['7d', '30d', '90d'] as Range[]).map((r) => (
              <button key={r} className={`tab${range === r ? ' on' : ''}`} onClick={() => setRange(r)}>
                {r === '7d' ? 'Last 7 days' : r === '30d' ? 'Last 30 days' : 'Last 90 days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="kgrid">
        <div className="kcard">
          <div className="klbl">Total responses</div>
          <div className="kval">{s.totalResponses.toLocaleString()}</div>
        </div>
        <div className="kcard">
          <div className="klbl">Avg completion rate</div>
          <div className="kval">{s.avgCompletionRate}%</div>
        </div>
        <div className="kcard">
          <div className="klbl">Active surveys</div>
          <div className="kval">{s.activeSurveys}</div>
        </div>
        <div className="kcard">
          <div className="klbl">Responses this month</div>
          <div className="kval">{s.responsesThisMonth.toLocaleString()}</div>
        </div>
      </div>

      {/* Trend + status donut */}
      <div className="cgrid" style={{ marginBottom: 14 }}>
        <div className="ccard">
          <div className="chead">
            <div>
              <div className="ctitle">Response velocity</div>
              <div className="csub">Responses vs completions over time</div>
            </div>
          </div>
          {slicedTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={slicedTrend} margin={{ top: 4, right: 12, bottom: 4, left: -16 }}>
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
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 220, color: 'var(--muted)', fontSize: 13 }}>No trend data yet</div>
          )}
        </div>

        <div className="ccard">
          <div className="chead">
            <div>
              <div className="ctitle">Completion rate by survey</div>
              <div className="csub">How many respondents finished vs. started</div>
            </div>
          </div>
          {(rates ?? []).length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={rates ?? []} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="title" tick={{ fontSize: 9, fill: 'var(--muted)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--muted)' }} tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
                <Tooltip {...TT} formatter={(v: number) => `${v}%`} />
                <Bar dataKey="completionRate" radius={[4, 4, 0, 0]} barSize={28}>
                  {(rates ?? []).map((r, i) => (
                    <Cell key={i} fill={r.completionRate >= 80 ? 'var(--success)' : r.completionRate >= 60 ? 'var(--accent)' : 'var(--warning)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 220, color: 'var(--muted)', fontSize: 13 }}>No data yet</div>
          )}
        </div>
      </div>

      {/* Survey performance table */}
      {surveyPerf.length > 0 && (
        <div className="ccard">
          <div className="chead">
            <div>
              <div className="ctitle">Survey performance</div>
              <div className="csub">Click a row to view full report</div>
            </div>
          </div>
          <div className="tw" style={{ marginBottom: 0, border: 'none' }}>
            <div className="tscroll">
              <table>
                <thead>
                  <tr>
                    <th>Survey</th>
                    <th>Status</th>
                    <th>Completes</th>
                    <th>Completion rate</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {surveyPerf.map((sp) => {
                    const pct = sp.completesRequired > 0
                      ? Math.min(100, (sp.completedCount / sp.completesRequired) * 100)
                      : 0;
                    return (
                      <tr key={sp.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/surveys/${sp.id}/reports`)}>
                        <td><span className="sn">{sp.title}</span></td>
                        <td><SurveyStatusBadge status={sp.status} /></td>
                        <td style={{ color: 'var(--muted)' }}>
                          <strong style={{ color: 'var(--text)' }}>{sp.completedCount.toLocaleString()}</strong>
                          {' '}/{' '}{sp.completesRequired.toLocaleString()}
                        </td>
                        <td>
                          <span style={{ fontSize: 13, fontWeight: 600, color: sp.completionRate >= 80 ? 'var(--success)' : sp.completionRate >= 60 ? 'var(--warning)' : 'var(--danger)' }}>
                            {sp.completionRate.toFixed(1)}%
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="pbar" style={{ width: 72 }}>
                              <div className="pfill" style={{ width: `${pct}%` }} />
                            </div>
                            <span style={{ fontSize: 10, color: 'var(--muted)', minWidth: 28 }}>{pct.toFixed(0)}%</span>
                          </div>
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
