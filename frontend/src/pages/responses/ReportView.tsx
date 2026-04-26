import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import { SurveyStatusBadge } from '@/components/survey/SurveyStatusBadge';
import { Spinner } from '@/components/common/Spinner';
import { useSurvey } from '@/hooks/useSurveys';
import { MOCK_TIMESERIES } from '@/mocks/data';

const TT = {
  contentStyle: {
    background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 8, fontSize: 12, color: 'var(--text)',
  },
};

// ── Industry benchmarks (Dynata research averages) ────────────────────────────
const BENCHMARKS = {
  nps: 28,          // avg consumer brand NPS
  completionRate: 68, // % completion rate
  avgDuration: 195, // seconds
};

// ── Base mock data ─────────────────────────────────────────────────────────────
const TREND_BASE = MOCK_TIMESERIES.map((p, i) => ({
  date: p.date, responses: p.count, completions: Math.round(p.count * (0.72 + i * 0.02)),
}));

type Gender  = 'ALL' | 'Male' | 'Female' | 'Non-binary';
type Country = 'ALL' | 'US' | 'GB' | 'CA' | 'AU';
type Age     = 'ALL' | '18–24' | '25–34' | '35–44' | '45+';

interface Filters { gender: Gender; country: Country; age: Age }

// Filtered data slices (simulate demographic breakdown)
function applyFilters(base: typeof TREND_BASE, f: Filters) {
  const factor =
    (f.gender  !== 'ALL' ? 0.45 : 1) *
    (f.country !== 'ALL' ? 0.35 : 1) *
    (f.age     !== 'ALL' ? 0.28 : 1);
  return base.map((d) => ({
    ...d,
    responses:   Math.round(d.responses   * factor),
    completions: Math.round(d.completions * factor),
  }));
}

const GENDER_BASE = [
  { name: 'Female', value: 48, fill: '#818CF8' },
  { name: 'Male',   value: 44, fill: 'var(--accent)' },
  { name: 'Non-binary', value: 8, fill: 'var(--success)' },
];

const AGE_BASE = [
  { age: '18–24', pct: 22 }, { age: '25–34', pct: 35 },
  { age: '35–44', pct: 24 }, { age: '45–54', pct: 13 }, { age: '55+', pct: 6 },
];

const COUNTRY_BASE = [
  { country: 'US', count: 210 }, { country: 'GB', count: 52 },
  { country: 'CA', count: 31  }, { country: 'AU', count: 19 },
];

const RECOMMEND_DATA = [
  { answer: 'Yes, definitely', pct: 54 },
  { answer: 'Maybe',           pct: 28 },
  { answer: 'Not sure',        pct: 13 },
  { answer: 'No',              pct: 5  },
];

const AWARENESS_DATA = [
  { label: 'Very familiar',     pct: 41 },
  { label: 'Somewhat familiar', pct: 33 },
  { label: 'Not familiar',      pct: 26 },
];

// ── Component ─────────────────────────────────────────────────────────────────
export function ReportView() {
  const { id: surveyId = '' } = useParams();
  const navigate = useNavigate();
  const { data: survey, isPending } = useSurvey(surveyId);

  const [filters, setFilters] = useState<Filters>({ gender: 'ALL', country: 'ALL', age: 'ALL' });
  const [copied, setCopied] = useState(false);

  if (isPending) return <div className="center-spinner"><Spinner size="lg" /></div>;
  if (!survey)   return <p style={{ color: 'var(--muted)' }}>Survey not found.</p>;

  const setFilter = <K extends keyof Filters>(key: K, val: Filters[K]) =>
    setFilters((f) => ({ ...f, [key]: val }));

  const hasFilter = filters.gender !== 'ALL' || filters.country !== 'ALL' || filters.age !== 'ALL';

  const trendData = applyFilters(TREND_BASE, filters);
  const totalFiltered = trendData.reduce((sum, d) => sum + d.responses, 0);

  const pct      = survey.targetResponseCount > 0
    ? Math.min(100, (survey.receivedResponseCount / survey.targetResponseCount) * 100) : 0;
  const nps      = 42;
  const duration = 177;

  const shareReport = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div>
      {/* Header */}
      <div className="sh">
        <div>
          <div className="st">{survey.title}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
            {survey.targeting?.country} · {survey.targeting?.ageMin}–{survey.targeting?.ageMax} yrs · {survey.targeting?.gender}
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

      {/* Cross-tab filter bar */}
      <div className="filter-bar">
        <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, letterSpacing: '.5px', textTransform: 'uppercase' }}>
          Filter by
        </span>

        <div className="tabs" style={{ marginBottom: 0, flex: 1 }}>
          {(['ALL', 'Female', 'Male', 'Non-binary'] as Gender[]).map((g) => (
            <button key={g} className={`tab${filters.gender === g ? ' on' : ''}`} onClick={() => setFilter('gender', g)}>
              {g === 'ALL' ? 'All genders' : g}
            </button>
          ))}
        </div>

        <div className="tabs" style={{ marginBottom: 0 }}>
          {(['ALL', 'US', 'GB', 'CA', 'AU'] as Country[]).map((c) => (
            <button key={c} className={`tab${filters.country === c ? ' on' : ''}`} onClick={() => setFilter('country', c)}>
              {c}
            </button>
          ))}
        </div>

        <div className="tabs" style={{ marginBottom: 0 }}>
          {(['ALL', '18–24', '25–34', '35–44', '45+'] as Age[]).map((a) => (
            <button key={a} className={`tab${filters.age === a ? ' on' : ''}`} onClick={() => setFilter('age', a)}>
              {a}
            </button>
          ))}
        </div>

        {hasFilter && (
          <button className="btn btn-d btn-xs" onClick={() => setFilters({ gender: 'ALL', country: 'ALL', age: 'ALL' })}>
            Clear
          </button>
        )}
      </div>

      {hasFilter && (
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>
          Showing <strong style={{ color: 'var(--text)' }}>{totalFiltered.toLocaleString()}</strong> responses matching current filters
          {' '}(of {survey.receivedResponseCount.toLocaleString()} total)
        </div>
      )}

      {/* KPI row */}
      <div className="kgrid">
        <div className="kcard">
          <div className="klbl">Responses collected</div>
          <div className="kval">{survey.receivedResponseCount.toLocaleString()}</div>
          <div style={{ marginTop: 8 }}>
            <div className="pbar" style={{ width: '100%' }}><div className="pfill" style={{ width: `${pct}%` }} /></div>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>{pct.toFixed(0)}% of {survey.targetResponseCount.toLocaleString()} target</div>
          </div>
        </div>
        <div className="kcard">
          <div className="klbl">Completion rate</div>
          <div className="kval" style={{ color: pct >= 80 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)' }}>
            {pct.toFixed(1)}%
          </div>
          <div className="kdelta">
            <span className={pct >= BENCHMARKS.completionRate ? 'up' : 'dn'}>
              {pct >= BENCHMARKS.completionRate ? '▲' : '▼'} {Math.abs(Math.round(pct - BENCHMARKS.completionRate))}pp
            </span>
            <span style={{ color: 'var(--muted)' }}> vs {BENCHMARKS.completionRate}% industry avg</span>
          </div>
        </div>
        <div className="kcard">
          <div className="klbl">Avg duration</div>
          <div className="kval">{Math.floor(duration / 60)}m {duration % 60}s</div>
          <div className="kdelta">
            <span className={duration <= BENCHMARKS.avgDuration ? 'up' : 'dn'}>
              {duration <= BENCHMARKS.avgDuration ? '▲' : '▼'} vs benchmark
            </span>
          </div>
        </div>
        <div className="kcard">
          <div className="klbl">NPS score</div>
          <div className="kval" style={{ color: nps >= 30 ? 'var(--success)' : nps >= 0 ? 'var(--warning)' : 'var(--danger)' }}>
            +{nps}
          </div>
          <div className="kdelta">
            <span className="up">▲ {nps - BENCHMARKS.nps}pts</span>
            <span style={{ color: 'var(--muted)' }}> vs {BENCHMARKS.nps} industry avg</span>
          </div>
        </div>
      </div>

      {/* Response trend */}
      <div className="ccard" style={{ marginBottom: 14 }}>
        <div className="chead">
          <div>
            <div className="ctitle">Response velocity</div>
            <div className="csub">
              {hasFilter ? 'Filtered segment — ' : ''}Daily responses vs completions
            </div>
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

      {/* NPS breakdown */}
      <div className="ccard" style={{ marginBottom: 14 }}>
        <div className="chead">
          <div>
            <div className="ctitle">Net Promoter Score</div>
            <div className="csub">vs industry benchmark of +{BENCHMARKS.nps}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="nps-score" style={{ color: 'var(--success)', fontSize: 40 }}>+{nps}</div>
            <div style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>WORLD CLASS</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
          {[{ label: 'Promoters', pct: 60, color: 'var(--success)', desc: '9–10' },
            { label: 'Passives',  pct: 22, color: 'var(--warning)', desc: '7–8'  },
            { label: 'Detractors',pct: 18, color: 'var(--danger)',  desc: '0–6'  }].map((g) => (
            <div key={g.label} style={{ textAlign: 'center', padding: '12px 8px', background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Syne', color: g.color }}>{g.pct}%</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginTop: 3 }}>{g.label}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>Score {g.desc}</div>
            </div>
          ))}
        </div>

        {/* NPS bar with benchmark marker */}
        <div style={{ position: 'relative' }}>
          <div className="nps-bar-wrap">
            <div className="nps-d" style={{ width: '18%', background: 'var(--danger)'  }} />
            <div className="nps-d" style={{ width: '22%', background: 'var(--warning)' }} />
            <div className="nps-d" style={{ width: '60%', background: 'var(--success)' }} />
          </div>
          {/* Industry benchmark marker */}
          <div style={{ position: 'absolute', top: -6, left: `${BENCHMARKS.nps + 50}%`, transform: 'translateX(-50%)' }}>
            <div style={{ width: 2, height: 26, background: 'var(--text)', opacity: 0.5 }} />
            <div style={{ fontSize: 9, color: 'var(--muted)', whiteSpace: 'nowrap', marginTop: 2, transform: 'translateX(-50%)' }}>
              Industry avg
            </div>
          </div>
        </div>
      </div>

      {/* Demographics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div className="ccard">
          <div className="chead"><div className="ctitle">Gender</div></div>
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
          <div className="chead"><div className="ctitle">Age distribution</div></div>
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

      {/* Geography + Satisfaction */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div className="ccard">
          <div className="chead"><div className="ctitle">Geographic reach</div></div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={COUNTRY_BASE} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--muted)' }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="country" tick={{ fontSize: 11, fill: 'var(--muted)' }} tickLine={false} axisLine={false} width={26} />
              <Tooltip {...TT} />
              <Bar dataKey="count" fill="var(--accent)" radius={[0, 4, 4, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="ccard">
          <div className="chead">
            <div className="ctitle">Completion rate</div>
            <div className="csub">vs {BENCHMARKS.completionRate}% industry avg</div>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={[{ label: 'This survey', value: Math.round(pct) }, { label: 'Industry avg', value: BENCHMARKS.completionRate }]} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
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
      </div>

      {/* Question insights */}
      <div className="ccard">
        <div className="chead">
          <div>
            <div className="ctitle">Question insights</div>
            <div className="csub">Answer distribution for key questions</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 10 }}>Would you recommend us?</div>
            {RECOMMEND_DATA.map((r) => (
              <div key={r.answer} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                  <span style={{ color: 'var(--text)' }}>{r.answer}</span>
                  <span style={{ color: 'var(--muted)' }}>{r.pct}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${r.pct}%`, borderRadius: 3, background: r.pct > 40 ? 'var(--success)' : r.pct > 20 ? 'var(--accent)' : 'var(--muted)', transition: 'width .4s ease' }} />
                </div>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 10 }}>Brand awareness level</div>
            {AWARENESS_DATA.map((r) => (
              <div key={r.label} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                  <span style={{ color: 'var(--text)' }}>{r.label}</span>
                  <span style={{ color: 'var(--muted)' }}>{r.pct}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${r.pct}%`, borderRadius: 3, background: 'linear-gradient(90deg,var(--accent),var(--accent2))', transition: 'width .4s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
