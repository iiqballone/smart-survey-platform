import type { Question } from '@/types';

interface QuestionCardProps {
  question: Question;
  index: number;
}

export function QuestionCard({ question, index }: QuestionCardProps) {
  return (
    <div className="qcard">
      <div className="qhead">
        <div className="qnum">{index + 1}</div>
        <div className="qrow" style={{ flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'var(--text)' }}>{question.text}</span>
            {question.required && <span className="tag">Required</span>}
          </div>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>{question.type.replace(/_/g, ' ')}</span>
          {question.options && question.options.length > 0 && (
            <ul style={{ marginTop: 4, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 3 }}>
              {question.options.map((opt) => (
                <li key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)' }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border)', flexShrink: 0 }} />
                  {opt.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
