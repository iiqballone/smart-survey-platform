interface StatsCardProps {
  label: string;
  value: string | number;
  sub?: string;
  delta?: string;
  deltaUp?: boolean;
}

export function StatsCard({ label, value, sub, delta, deltaUp }: StatsCardProps) {
  return (
    <div className="kcard">
      <div className="klbl">{label}</div>
      <div className="kval">{value}</div>
      {(sub || delta) && (
        <div className="kdelta">
          {delta && <span className={deltaUp ? 'up' : 'dn'}>{deltaUp ? '▲' : '▼'} {delta}</span>}
          {sub && <span style={{ color: 'var(--muted)' }}>{sub}</span>}
        </div>
      )}
    </div>
  );
}
