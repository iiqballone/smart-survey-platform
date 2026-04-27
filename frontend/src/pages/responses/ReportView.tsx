import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import { SurveyStatusBadge } from '@/components/survey/SurveyStatusBadge';
import { Spinner } from '@/components/common/Spinner';
import { useSurvey } from '@/hooks/useSurveys';
import { useSurveyAnalytics } from '@/hooks/useAnalytics';
import { useTimeSeries } from '@/hooks/useDashboard';

type Granularity = 'day' | 'week' | 'month';
type DateRange = '7d' | '30d' | '90d';

function rangeToParams(r: DateRange): { from: string; to: string; granularity: Granularity } {
  const to   = new Date();
  const from = new Date();
  if (r === '7d')  { from.setDate(to.getDate() - 7);  return { from: from.toISOString(), to: to.toISOString(), granularity: 'day'   }; }
  if (r === '30d') { from.setDate(to.getDate() - 30); return { from: from.toISOString(), to: to.toISOString(), granularity: 'day'   }; }
  from.setDate(to.getDate() - 90);
  return { from: from.toISOString(), to: to.toISOString(), granularity: 'week' };
}

const TT = {
  contentStyle: {
    background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 8, fontSize: 12, color: 'var(--text)',
  },
};

const BENCHMARKS = { completionRate: 68, screenoutRate: 25 };

const GENDER_BASE = [
  { name: 'Female',     value: 48, fill: '#818CF8' },
  { name: 'Male',       value: 44, fill: 'var(--accent)' },
  { name: 'Non-binary', value: 8,  fill: 'var(--success)' },
];

const AGE_BASE = [
  { age: '18–24', pct: 22 }, { age: '25–34', pct: 35 },
  { age: '35–44', pct: 24 }, { age: '45–54', pct: 13 }, { age: '55+', pct: 6 },
];

export function ReportView() {
  const { id: surveyId = '' } = useParams();
  const navigate = useNavigate();
  const { data: survey, isPending } = useSurvey(surveyId);
  const { data: analytics } = useSurveyAnalytics(surveyId);
  const [copied, setCopied] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>('30d');

  const { from, to, granularity } = useMemo(() => rangeToParams(dateRange), [dateRange]);
  const { data: timeSeries } = useTimeSeries(surveyId, from, to, granularity);

  if (isPending) return <div className="center-spinner"><Spinner size="lg" /></div>;
  if (!survey)   return <p style={{ color: 'var(--muted)' }}>Survey not found.</p>;

  const completionRate = analytics?.completionRate ?? 0;
  const screenoutRate  = analytics?.screenoutRate  ?? 0;
  const pct = survey.completesRequired > 0
    ? Math.min(100, (survey.completedCount / survey.completesRequired) * 100)
    : 0;

  // prefer live timeseries (date-range-aware), fall back to analytics trend
  const trendData = ((timeSeries?.data ?? analytics?.trend ?? []).map(p => ({
    date: p.period,
    responses: p.responses,
    completions: p.completions,
  })));

  const shareReport = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div>
      <div className="sh">
        <div>
          <div className="st">{survey.title}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
            {survey.country} · LOI {survey.loi} min
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <SurveyStatusBadge status={survey.status} />
          <button className="btn btn-s btn-sm" onClick={() => navigate(`/surveys/${surveyId}/responses`)}>
            Raw data
          </button>
          <button className="btn btn-s btn-sm" onClick={shareReport}>
            {copied ? '✓ Copied!' : '🔗 Share report'}
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="kgrid">
        <div className="kcard">
          <div className="klbl">Responses collected</div>
          <div className="kval">{survey.completedCount.toLocaleString()}</div>
          <div style={{ marginTop: 8 }}>
            <div className="pbar" style={{ width: '100%' }}><div className="pfill" style={{ width: `${pct}%` }} /></div>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>{pct.toFixed(0)}% of {survey.completesRequired.toLocaleString()} target</div>
          </div>
        </div>
        <div className="kcard">
          <div className="klbl">Completion rate</div>
          <div className="kval" style={{ color: completionRate >= 80 ? 'var(--success)' : completionRate >= 50 ? 'var(--warning)' : 'var(--danger)' }}>
            {completionRate.toFixed(1)}%
          </div>
          <div className="kdelta">
            <span className={completionRate >= BENCHMARKS.completionRate ? 'up' : 'dn'}>
              {completionRate >= BENCHMARKS.completionRate ? '▲' : '▼'} {Math.abs(Math.round(completionRate - BENCHMARKS.completionRate))}pp
            </span>
            <span style={{ color: 'var(--muted)' }}> vs {BENCHMARKS.completionRate}% industry avg</span>
          </div>
        </div>
        <div className="kcard">
          <div className="klbl">Screenout rate</div>
          <div className="kval" style={{ color: screenoutRate <= BENCHMARKS.screenoutRate ? 'var(--success)' : 'var(--warning)' }}>
            {screenoutRate.toFixed(1)}%
          </div>
          <div className="kdelta">
            <span style={{ color: 'var(--muted)' }}>Industry avg ~{BENCHMARKS.screenoutRate}%</span>
          </div>
        </div>
        <div className="kcard">
          <div className="klbl">Avg CPI</div>
          <div className="kval">
            {analytics?.averageCpi != null ? `$${analytics.averageCpi.toFixed(2)}` : '—'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
            Range ${survey.cpiMin}–${survey.cpiMax}
          </div>
        </div>
      </div>

      {/* Response trend */}
      {trendData.length > 0 && (
        <div className="ccard" style={{ marginBottom: 14 }}>
          <div className="chead">
            <div>
              <div className="ctitle">Response velocity</div>
              <div className="csub">Responses vs completions over time</div>
            </div>
            <div className="tabs" style={{ marginBottom: 0 }}>
              {(['7d', '30d', '90d'] as DateRange[]).map((r) => (
                <button key={r} className={`tab${dateRange === r ? ' on' : ''}`} onClick={() => setDateRange(r)}>
                  {r === '7d' ? '7 days' : r === '30d' ? '30 days' : '90 days'}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData} margin={{ top: 4, right: 12, bottom: 4, left: -16 }}>
              <defs>
                <linearGradient id="gR2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--accent)"  stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--accent)"  stopOpacity={0}    />
                </linearGradient>
                <linearGradient id="gC2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--success)" stopOpacity={0.2}  />
                  <stop offset="95%" stopColor="var(--success)" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted)' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--muted)' }} tickLine={false} axisLine={false} />
              <Tooltip {...TT} />
              <Legend wrapperStyle={{ fontSize: 11, color: 'var(--muted)' }} />
              <Area type="monotone" dataKey="responses"   stroke="var(--accent)"  strokeWidth={2} fill="url(#gR2)" name="Responses"   dot={false} />
              <Area type="monotone" dataKey="completions" stroke="var(--success)" strokeWidth={2} fill="url(#gC2)" name="Completions" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Completion rate vs benchmark */}
      <div className="ccard" style={{ marginBottom: 14 }}>
        <div className="chead">
          <div>
            <div className="ctitle">Completion rate</div>
            <div className="csub">vs {BENCHMARKS.completionRate}% industry average</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={[{ label: 'This survey', value: Math.round(completionRate) }, { label: 'Industry avg', value: BENCHMARKS.completionRate }]}
            margin={{ top: 4, right: 8, bottom: 4, left: -20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--muted)' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--muted)' }} tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
            <Tooltip {...TT} formatter={(v: number) => `${v}%`} />
            <ReferenceLine y={BENCHMARKS.completionRate} stroke="var(--muted)" strokeDasharray="4 4" />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
              <Cell fill="var(--accent)" />
              <Cell fill="var(--border)" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Demographics (indicative — not from API since backend doesn't store them) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div className="ccard">
          <div className="chead"><div className="ctitle">Gender split</div><div className="csub">Indicative</div></div>
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie data={GENDER_BASE} cx="50%" cy="50%" innerRadius={44} outerRadius={66} dataKey="value" paddingAngle={3}>
                {GENDER_BASE.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Pie>
              <Tooltip {...TT} formatter={(v: number) => `${v}%`} />
              <Legend wrapperStyle={{ fontSize: 11, color: 'var(--muted)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="ccard">
          <div className="chead"><div className="ctitle">Age distribution</div><div className="csub">Indicative</div></div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={AGE_BASE} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="age" tick={{ fontSize: 10, fill: 'var(--muted)' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--muted)' }} tickLine={false} axisLine={false} unit="%" />
              <Tooltip {...TT} formatter={(v: number) => `${v}%`} />
              <Bar dataKey="pct" radius={[4, 4, 0, 0]} barSize={20}>
                {AGE_BASE.map((_, i) => (
                  <Cell key={i} fill={i === 1 || i === 2 ? 'var(--accent)' : 'rgba(244,163,64,.35)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
