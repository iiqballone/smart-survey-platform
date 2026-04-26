import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useCompletionRates, useDashboardSummary } from '@/hooks/useDashboard';


const TT = {
  contentStyle: {
    background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 8, fontSize: 12, color: 'var(--text)',
  },
};

// ── Mock analytics data ───────────────────────────────────────────────────────

const TREND_30D = [
  { date: 'Apr 1',  responses: 24,  completions: 19 },
  { date: 'Apr 3',  responses: 31,  completions: 26 },
  { date: 'Apr 5',  responses: 58,  completions: 44 },
  { date: 'Apr 7',  responses: 42,  completions: 35 },
  { date: 'Apr 9',  responses: 43,  completions: 38 },
  { date: 'Apr 11', responses: 67,  completions: 53 },
  { date: 'Apr 13', responses: 89,  completions: 72 },
  { date: 'Apr 15', responses: 71,  completions: 58 },
  { date: 'Apr 17', responses: 67,  completions: 49 },
  { date: 'Apr 19', responses: 84,  completions: 68 },
  { date: 'Apr 21', responses: 112, completions: 93 },
  { date: 'Apr 23', responses: 98,  completions: 80 },
  { date: 'Apr 25', responses: 95,  completions: 77 },
];

const STATUS_DATA = [
  { name: 'Live',      value: 2, fill: 'var(--live)'      },
  { name: 'Draft',     value: 1, fill: 'var(--draft)'     },
  { name: 'Paused',    value: 1, fill: 'var(--warning)'   },
  { name: 'Completed', value: 1, fill: 'var(--completed)' },
];

const COUNTRY_DATA = [
  { country: 'US', responses: 382 },
  { country: 'GB', responses: 241 },
  { country: 'AU', responses: 198 },
  { country: 'CA', responses: 167 },
  { country: 'DE', responses: 89  },
  { country: 'FR', responses: 68  },
];

const SURVEY_PERF = [
  { id: '1', title: 'Q2 Brand Perception',   received: 312, target: 500, rate: 71, nps: 42,  status: 'LIVE'      },
  { id: '5', title: 'NPS Benchmark 2025',     received: 600, target: 600, rate: 93, nps: 58,  status: 'COMPLETED' },
  { id: '2', title: "Product Satisfaction",   received: 88,  target: 200, rate: 84, nps: 31,  status: 'LIVE'      },
  { id: '4', title: 'Ad Recall – Campaign V2',received: 145, target: 400, rate: 62, nps: -4,  status: 'PAUSED'    },
];

const AGE_DATA = [
  { age: '18–24', count: 187 },
  { age: '25–34', count: 342 },
  { age: '35–44', count: 298 },
  { age: '45–54', count: 196 },
  { age: '55–64', count: 87  },
  { age: '65+',   count: 35  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    LIVE: 'var(--live)', DRAFT: 'var(--draft)', PAUSED: 'var(--warning)', COMPLETED: 'var(--completed)',
  };
  return (
    <span style={{ width: 7, height: 7, borderRadius: '50%', background: colors[status] ?? 'var(--muted)', display: 'inline-block', flexShrink: 0 }} />
  );
}

type Range = '7d' | '30d' | '90d';

// ── Component ─────────────────────────────────────────────────────────────────

export function AnalyticsPage() {
  const navigate = useNavigate();
  const [range, setRange] = useState<Range>('30d');
  const { data: summary } = useDashboardSummary();
  const { data: rates } = useCompletionRates();
  const s =summary ?? { totalSurveys: 5, activeSurveys: 2, totalResponses: 1145, avgCompletionRate: 77, responsesThisMonth: 400 };

  const trendData = range === '7d' ? TREND_30D.slice(-5) : TREND_30D;

  return (
    <div>
      {/* Page header */}
      <div className="sh">
        <div>
          <div className="st">Analytics</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
            Cross-survey performance · April 2026
          </div>
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
          <div className="kdelta"><span className="up">▲ 12%</span><span style={{ color: 'var(--muted)' }}> vs last period</span></div>
        </div>
        <div className="kcard">
          <div className="klbl">Avg completion rate</div>
          <div className="kval">{s.avgCompletionRate}%</div>
          <div className="kdelta"><span className="up">▲ 4pp</span><span style={{ color: 'var(--muted)' }}> vs last period</span></div>
        </div>
        <div className="kcard">
          <div className="klbl">Best NPS</div>
          <div className="kval" style={{ color: 'var(--success)' }}>+58</div>
          <div className="kdelta"><span style={{ color: 'var(--muted)' }}>NPS Benchmark 2025</span></div>
        </div>
        <div className="kcard">
          <div className="klbl">Responses this month</div>
          <div className="kval">{s.responsesThisMonth.toLocaleString()}</div>
          <div className="kdelta"><span className="up">▲ 8%</span><span style={{ color: 'var(--muted)' }}> vs last month</span></div>
        </div>
      </div>

      {/* Trend + survey performance */}
      <div className="cgrid" style={{ marginBottom: 14 }}>
        <div className="ccard">
          <div className="chead">
            <div>
              <div className="ctitle">Response velocity</div>
              <div className="csub">Responses vs completions over time</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
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

        <div className="ccard">
          <div className="chead">
            <div>
              <div className="ctitle">Survey status</div>
              <div className="csub">Distribution across {s.totalSurveys} surveys</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={STATUS_DATA} cx="50%" cy="50%" innerRadius={42} outerRadius={62} dataKey="value" paddingAngle={3}>
                {STATUS_DATA.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip {...TT} />
              <Legend wrapperStyle={{ fontSize: 11, color: 'var(--muted)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Survey performance table */}
      <div className="ccard" style={{ marginBottom: 14 }}>
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
                  <th>Responses</th>
                  <th>Completion</th>
                  <th>NPS</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {SURVEY_PERF.map((s) => {
                  const pct = Math.min(100, (s.received / s.target) * 100);
                  const npsColor = s.nps >= 30 ? 'var(--success)' : s.nps >= 0 ? 'var(--warning)' : 'var(--danger)';
                  return (
                    <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/surveys/${s.id}/reports`)}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <StatusDot status={s.status} />
                          <span className="sn">{s.title}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge b${s.status}`}>
                          <span className="dot" />{s.status.charAt(0) + s.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td style={{ color: 'var(--muted)' }}>
                        <strong style={{ color: 'var(--text)' }}>{s.received.toLocaleString()}</strong>
                        {' '}/{' '}{s.target.toLocaleString()}
                      </td>
                      <td>
                        <span style={{ fontSize: 13, fontWeight: 600, color: s.rate >= 80 ? 'var(--success)' : s.rate >= 60 ? 'var(--warning)' : 'var(--danger)' }}>
                          {s.rate}%
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 14, fontWeight: 700, color: npsColor }}>
                          {s.nps >= 0 ? '+' : ''}{s.nps}
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

      {/* Geo + age distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div className="ccard">
          <div className="chead">
            <div>
              <div className="ctitle">Responses by country</div>
              <div className="csub">All surveys combined</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={COUNTRY_DATA} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--muted)' }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="country" tick={{ fontSize: 11, fill: 'var(--muted)' }} tickLine={false} axisLine={false} width={28} />
              <Tooltip {...TT} />
              <Bar dataKey="responses" fill="var(--accent)" radius={[0, 4, 4, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="ccard">
          <div className="chead">
            <div>
              <div className="ctitle">Age distribution</div>
              <div className="csub">Respondents by age group</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={AGE_DATA} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="age" tick={{ fontSize: 10, fill: 'var(--muted)' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--muted)' }} tickLine={false} axisLine={false} />
              <Tooltip {...TT} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={18}>
                {AGE_DATA.map((_, i) => (
                  <Cell key={i} fill={i === 1 || i === 2 ? 'var(--accent)' : 'rgba(244,163,64,.35)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Completion rate comparison */}
      <div className="ccard" style={{ marginTop: 14 }}>
        <div className="chead">
          <div>
            <div className="ctitle">Completion rate by survey</div>
            <div className="csub">How many respondents finished vs. started</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={rates ?? []} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="title" tick={{ fontSize: 10, fill: 'var(--muted)' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--muted)' }} tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
            <Tooltip {...TT} formatter={(v: number) => `${v}%`} />
            <Bar dataKey="completionRate" radius={[4, 4, 0, 0]} barSize={28}>
              {(rates ?? []).map((r, i) => (
                <Cell key={i} fill={r.completionRate >= 80 ? 'var(--success)' : r.completionRate >= 60 ? 'var(--accent)' : 'var(--warning)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
