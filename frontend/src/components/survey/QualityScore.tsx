interface Question { text: string; type: string }
interface Targeting { incidenceRate?: number }

interface Props {
  title: string;
  description: string;
  questions: Question[];
  targeting?: Targeting;
}

interface Check {
  label: string;
  pass: boolean;
  warn?: boolean;
  tip: string;
}

function buildChecks(p: Props): Check[] {
  const qCount = p.questions.length;
  const hasText = p.questions.every((q) => q.text.length >= 5);
  const hasMeasurable = p.questions.some((q) => ['NPS', 'RATING', 'SINGLE_CHOICE', 'MULTI_CHOICE'].includes(q.type));
  const estimatedMin  = Math.round(qCount * (0.7 * 45 + 0.3 * 90) / 60);
  const ir = p.targeting?.incidenceRate ?? 50;

  return [
    {
      label: 'Has a title and description',
      pass: p.title.length >= 3 && p.description.length >= 10,
      tip: 'A clear title and description help panelists understand the survey context.',
    },
    {
      label: `At least 3 questions (${qCount} added)`,
      pass: qCount >= 3,
      warn: qCount > 0 && qCount < 3,
      tip: 'Short surveys complete faster but fewer than 3 questions reduce data quality.',
    },
    {
      label: 'All question texts are clear',
      pass: hasText,
      tip: 'Questions under 5 characters are likely incomplete.',
    },
    {
      label: 'Includes a measurable question',
      pass: hasMeasurable,
      warn: !hasMeasurable,
      tip: 'Add an NPS, rating, or choice question to make results quantifiable.',
    },
    {
      label: `Survey length ≤ 10 min (est. ${estimatedMin} min)`,
      pass: estimatedMin <= 10,
      warn: estimatedMin > 10 && estimatedMin <= 15,
      tip: 'Surveys over 10 minutes see significantly higher drop-off rates and higher CPI from Dynata.',
    },
    {
      label: `Incidence rate ≥ 20% (${ir}% set)`,
      pass: ir >= 20,
      warn: ir >= 10 && ir < 20,
      tip: 'Low IR means fewer qualifying panelists and much higher cost. Consider broader targeting.',
    },
  ];
}

function scoreFromChecks(checks: Check[]): number {
  let score = 100;
  checks.forEach((c) => {
    if (!c.pass && !c.warn) score -= 20;
    else if (!c.pass && c.warn) score -= 10;
    else if (c.warn) score -= 5;
  });
  return Math.max(0, score);
}

export function QualityScore({ title, description, questions, targeting }: Props) {
  const checks = buildChecks({ title, description, questions, targeting });
  const score  = scoreFromChecks(checks);

  const color = score >= 80 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)';
  const label = score >= 80 ? 'Ready to publish' : score >= 50 ? 'Needs improvement' : 'Not ready';

  return (
    <div className="quality-box">
      <div className="qb-head">
        <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>
          Survey Readiness
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontFamily: 'Syne', fontSize: 26, fontWeight: 800, color }}>{score}</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color }}>{label}</div>
            <div style={{ fontSize: 10, color: 'var(--muted)' }}>out of 100</div>
          </div>
        </div>
      </div>

      {/* Score bar */}
      <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: 3, transition: 'width .4s ease' }} />
      </div>

      {/* Checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {checks.map((c, i) => (
          <div key={i} className="qb-check">
            <span style={{ fontSize: 13, flexShrink: 0 }}>
              {c.pass && !c.warn ? '✅' : c.warn ? '⚠️' : '❌'}
            </span>
            <div>
              <div style={{ fontSize: 12, color: c.pass && !c.warn ? 'var(--text)' : c.warn ? 'var(--warning)' : 'var(--danger)', fontWeight: 500 }}>
                {c.label}
              </div>
              {(!c.pass || c.warn) && (
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{c.tip}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
