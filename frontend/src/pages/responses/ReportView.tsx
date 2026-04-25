import { useParams } from 'react-router-dom';
import { ResponseChart } from '@/components/dashboard/ResponseChart';
import { Spinner } from '@/components/common/Spinner';
import { useSurvey } from '@/hooks/useSurveys';
import { useTimeSeries } from '@/hooks/useDashboard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['var(--accent)', 'var(--success)', '#818CF8', 'var(--warning)', 'var(--danger)', '#0891b2'];

const FROM = new Date(Date.now() - 30 * 86_400_000).toISOString().split('T')[0];
const TO   = new Date().toISOString().split('T')[0];

const genderData = [
  { name: 'Male',   value: 48 },
  { name: 'Female', value: 45 },
  { name: 'Other',  value: 7  },
];

const countryData = [
  { country: 'US', count: 210 },
  { country: 'GB', count: 89  },
  { country: 'AU', count: 54  },
  { country: 'CA', count: 31  },
];

const tooltipStyle = {
  contentStyle: { background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text)' },
};

export function ReportView() {
  const { id: surveyId = '' } = useParams();
  const { data: survey, isPending } = useSurvey(surveyId);
  const { data: tsData } = useTimeSeries(surveyId, FROM, TO);

  if (isPending) return <div className="center-spinner"><Spinner size="lg" /></div>;
  if (!survey)   return <p style={{ color: 'var(--muted)' }}>Survey not found.</p>;

  return (
    <div>
      <div className="sh">
        <div>
          <div className="st">Report — {survey.title}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
            {survey.receivedResponseCount.toLocaleString()} responses collected
          </div>
        </div>
      </div>

      <div className="rep-grid">
        {tsData && <ResponseChart data={tsData.data} title="Daily responses — last 30 days" />}

        <div className="ccard">
          <div className="chead"><div className="ctitle">Gender breakdown</div></div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={genderData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label>
                {genderData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 12, color: 'var(--muted)' }} />
              <Tooltip {...tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="ccard">
          <div className="chead"><div className="ctitle">Responses by country</div></div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={countryData} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="country" tick={{ fontSize: 11, fill: 'var(--muted)' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--muted)' }} tickLine={false} axisLine={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="ccard">
          <div className="chead">
            <div>
              <div className="ctitle">NPS Score</div>
              <div className="csub">Net Promoter Score</div>
            </div>
          </div>
          <div style={{ textAlign: 'center', paddingTop: 16 }}>
            <div className="nps-score" style={{ color: 'var(--success)' }}>+42</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>Based on {survey.receivedResponseCount} responses</div>
            <div className="nps-bar-wrap" style={{ maxWidth: 260, margin: '12px auto 0' }}>
              <div className="nps-d" style={{ width: '18%', background: 'var(--danger)' }} />
              <div className="nps-d" style={{ width: '22%', background: 'var(--warning)' }} />
              <div className="nps-d" style={{ width: '60%', background: 'var(--success)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted)', maxWidth: 260, margin: '4px auto 0' }}>
              <span>Detractors 18%</span>
              <span>Passives 22%</span>
              <span>Promoters 60%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
