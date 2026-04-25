import { Badge } from '@/components/common/Badge';
import type { Question } from '@/types';

interface QuestionCardProps {
  question: Question;
  index: number;
}

export function QuestionCard({ question, index }: QuestionCardProps) {
  return (
    <div className="card p-4 flex gap-4">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-700">
        {index + 1}
      </span>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900">{question.text}</p>
          {question.required && <Badge label="Required" color="blue" />}
        </div>
        <p className="mt-0.5 text-xs text-gray-400">{question.type.replace(/_/g, ' ')}</p>
        {question.options && question.options.length > 0 && (
          <ul className="mt-2 space-y-1">
            {question.options.map((opt) => (
              <li key={opt.id} className="flex items-center gap-2 text-xs text-gray-600">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                {opt.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
