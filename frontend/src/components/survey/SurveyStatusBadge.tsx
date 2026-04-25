import { Badge } from '@/components/common/Badge';
import type { SurveyStatus } from '@/types';

const statusMap: Record<SurveyStatus, { label: string; color: 'gray' | 'blue' | 'green' | 'yellow' | 'red' }> = {
  DRAFT:     { label: 'Draft',     color: 'gray'   },
  LIVE:      { label: 'Live',      color: 'green'  },
  PAUSED:    { label: 'Paused',    color: 'yellow' },
  COMPLETED: { label: 'Completed', color: 'blue'   },
};

export function SurveyStatusBadge({ status }: { status: SurveyStatus }) {
  const { label, color } = statusMap[status];
  return <Badge label={label} color={color} />;
}
