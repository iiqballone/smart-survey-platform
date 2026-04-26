import { useMemo } from 'react';
import { calcFeasibility } from '@/services/feasibilityApi';
import type { FeasibilityRequest } from '@/services/feasibilityApi';

interface Props extends FeasibilityRequest {}

export function FeasibilityPanel(props: Props) {
  const result = useMemo(() => calcFeasibility(props), [
    props.country, props.ageMin, props.ageMax, props.gender,
    props.sampleSize, props.incidenceRate, props.questionCount,
  ]);

  const fieldColor = result.estimatedFieldDays <= 5
    ? 'var(--success)' : result.estimatedFieldDays <= 14
    ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="feasibility-panel">
      <div className="fp-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>💡</span>
          <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>
            Dynata Cost Estimate
          </span>
        </div>
        <span className="fp-source">
          {result.source === 'MOCK_MATRIX' ? 'Mock matrix · pending API access' : '⚡ Live Dynata API'}
        </span>
      </div>

      {/* Main cost */}
      <div className="fp-cost">
        <div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Total estimated cost</div>
          <div style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, color: result.feasible ? 'var(--accent)' : 'var(--danger)' }}>
            ${result.totalCostMin.toLocaleString()}
            <span style={{ fontSize: 15, fontWeight: 400, color: 'var(--muted)' }}> – ${result.totalCostMax.toLocaleString()}</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
            ${result.cpiMin.toFixed(2)} – ${result.cpiMax.toFixed(2)} per response
          </div>
        </div>
        {!result.feasible && (
          <div className="fp-infeasible">⚠ Low feasibility</div>
        )}
      </div>

      {/* Stats row */}
      <div className="fp-stats">
        <div className="fp-stat">
          <div className="fp-stat-val">{result.panelSize.toLocaleString()}</div>
          <div className="fp-stat-lbl">Eligible panelists</div>
        </div>
        <div className="fp-stat">
          <div className="fp-stat-val">{result.estimatedLOI} min</div>
          <div className="fp-stat-lbl">Est. survey length</div>
        </div>
        <div className="fp-stat">
          <div className="fp-stat-val" style={{ color: fieldColor }}>
            ~{result.estimatedFieldDays}d
          </div>
          <div className="fp-stat-lbl">Est. field time</div>
        </div>
        <div className="fp-stat">
          <div className="fp-stat-val">{result.estimatedCompletes.toLocaleString()}</div>
          <div className="fp-stat-lbl">30-day capacity</div>
        </div>
      </div>

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="fp-warnings">
          {result.warnings.map((w, i) => (
            <div key={i} className="fp-warn">
              <span style={{ flexShrink: 0 }}>⚠</span>
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      <div className="fp-disclaimer">
        Estimates based on Dynata panel indicative rates. Final CPI confirmed at project launch.
        {' '}<strong>Dynata Feasibility API</strong> will replace this once partner access is activated.
      </div>
    </div>
  );
}
