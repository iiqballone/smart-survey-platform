type Color = 'gray' | 'blue' | 'green' | 'yellow' | 'red';

interface BadgeProps {
  label: string;
  color?: Color;
}

const styleMap: Record<Color, React.CSSProperties> = {
  gray:   { background: 'rgba(107,127,163,.12)', color: 'var(--muted)' },
  blue:   { background: 'rgba(129,140,248,.12)', color: '#818CF8' },
  green:  { background: 'rgba(52,211,153,.12)',  color: 'var(--success)' },
  yellow: { background: 'rgba(251,191,36,.12)',  color: 'var(--warning)' },
  red:    { background: 'rgba(248,113,113,.12)', color: 'var(--danger)' },
};

export function Badge({ label, color = 'gray' }: BadgeProps) {
  return (
    <span className="badge" style={styleMap[color]}>
      {label}
    </span>
  );
}
