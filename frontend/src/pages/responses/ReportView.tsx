import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { ResponseChart } from '@/components/dashboard/ResponseChart';
import { Spinner } from '@/components/common/Spinner';
import { useSurvey } from '@/hooks/useSurveys';
import { useTimeSeries } from '@/hooks/useDashboard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#9333ea', '#0891b2'];

const FROM = new Date(Date.now() - 30 * 86_400_000).toISOString().split('T')[0];
const TO   = new Date().toISOString().split('T')[0];

export function ReportView() {
  const { id: surveyId = '' } = useParams();
  const { data: survey, isPending: surveyPending } = useSurvey(surveyId);
  const { data: tsData } = useTimeSeries(surveyId, FROM, TO);

  if (surveyPending) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (!survey) return <p className="text-gray-500">Survey not found.</p>;

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

  return (
    <div>
      <PageHeader
        title={`Report — ${survey.title}`}
        subtitle={`${survey.receivedResponseCount} responses collected`}
      />

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {tsData && <ResponseChart data={tsData.data} title="Daily responses (last 30 days)" />}

        <div className="card-padded">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Gender breakdown</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={genderData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                {genderData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card-padded">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Responses by country</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={countryData} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="country" tick={{ fontSize: 12 }} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
