import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RoleGuard } from '@/components/auth/RoleGuard';

import { LoginPage }         from '@/pages/auth/LoginPage';
import { AuthCallback }      from '@/pages/auth/AuthCallback';
import { UnauthorizedPage }  from '@/pages/auth/UnauthorizedPage';
import { ClientDashboard }   from '@/pages/dashboard/ClientDashboard';
import { SurveyList }        from '@/pages/surveys/SurveyList';
import { SurveyCreate }      from '@/pages/surveys/SurveyCreate';
import { SurveyDetail }      from '@/pages/surveys/SurveyDetail';
import { SurveyEdit }        from '@/pages/surveys/SurveyEdit';
import { ResponseViewer }    from '@/pages/responses/ResponseViewer';
import { ReportView }        from '@/pages/responses/ReportView';
import { ProfileSettings }   from '@/pages/settings/ProfileSettings';
import { TeamManagement }    from '@/pages/settings/TeamManagement';
import { ClientList }        from '@/pages/admin/ClientList';
import { ClientDetail }      from '@/pages/admin/ClientDetail';
import { DynataMonitor }     from '@/pages/admin/DynataMonitor';
import { SystemHealth }      from '@/pages/admin/SystemHealth';

export const router = createBrowserRouter([
  { path: '/login',          element: <LoginPage /> },
  { path: '/auth/callback',  element: <AuthCallback /> },
  { path: '/unauthorized',   element: <UnauthorizedPage /> },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <ClientDashboard /> },

          { path: '/surveys',              element: <SurveyList /> },
          { path: '/surveys/new',          element: <SurveyCreate /> },
          { path: '/surveys/:id',          element: <SurveyDetail /> },
          { path: '/surveys/:id/edit',     element: <SurveyEdit /> },
          { path: '/surveys/:id/responses',element: <ResponseViewer /> },
          { path: '/surveys/:id/reports',  element: <ReportView /> },

          { path: '/settings/profile', element: <ProfileSettings /> },
          { path: '/settings/team',    element: <TeamManagement /> },

          {
            path: '/admin',
            element: <RoleGuard roles={['PLATFORM_ADMIN']}><Navigate to="/admin/clients" replace /></RoleGuard>,
          },
          {
            path: '/admin/clients',
            element: (
              <RoleGuard roles={['PLATFORM_ADMIN']}>
                <ClientList />
              </RoleGuard>
            ),
          },
          {
            path: '/admin/clients/:id',
            element: (
              <RoleGuard roles={['PLATFORM_ADMIN']}>
                <ClientDetail />
              </RoleGuard>
            ),
          },
          {
            path: '/admin/dynata',
            element: (
              <RoleGuard roles={['PLATFORM_ADMIN']}>
                <DynataMonitor />
              </RoleGuard>
            ),
          },
          {
            path: '/admin/system',
            element: (
              <RoleGuard roles={['PLATFORM_ADMIN']}>
                <SystemHealth />
              </RoleGuard>
            ),
          },
        ],
      },
    ],
  },
]);
