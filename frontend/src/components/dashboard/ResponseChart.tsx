import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { TimeSeriesPoint } from '@/types';

interface ResponseChartProps {
  data: TimeSeriesPoint[];
  title?: string;
}

export function ResponseChart({ data, title = 'Responses over time' }: ResponseChartProps) {
  return (
    <div className="ccard">
      <div className="chead">
        <div className="ctitle">{title}</div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 12, bottom: 4, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted)' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10, fill: 'var(--muted)' }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text)' }}
            cursor={{ stroke: 'var(--border)' }}
          />
          <Line type="monotone" dataKey="count" stroke="var(--accent)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: 'var(--accent)' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
