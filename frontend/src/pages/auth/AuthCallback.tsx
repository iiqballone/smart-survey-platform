import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '@/components/common/Spinner';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Keycloak-js handles the code exchange automatically.
    // After the redirect back, the main.tsx Keycloak init resolves
    // and sets the auth state. We simply redirect to dashboard.
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
