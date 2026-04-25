import type { SurveyStatus } from '@/types';

const statusMap: Record<SurveyStatus, string> = {
  LIVE:      'bLIVE',
  DRAFT:     'bDRAFT',
  PAUSED:    'bPAUSED',
  COMPLETED: 'bCOMPLETED',
};

const labelMap: Record<SurveyStatus, string> = {
  LIVE: 'Live', DRAFT: 'Draft', PAUSED: 'Paused', COMPLETED: 'Completed',
};

export function SurveyStatusBadge({ status }: { status: SurveyStatus }) {
  return (
    <span className={`badge ${statusMap[status]}`}>
      <span className="dot" />
      {labelMap[status]}
    </span>
  );
}
