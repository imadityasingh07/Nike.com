import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@getmocha/users-service/react';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { exchangeCodeForSessionToken } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await exchangeCodeForSessionToken();
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Authentication failed:', error);
        navigate('/', { replace: true });
      }
    };

    handleCallback();
  }, [exchangeCodeForSessionToken, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin mb-4">
        <Loader2 className="w-8 h-8 text-black" />
      </div>
      <p className="text-gray-600">Completing sign in...</p>
    </div>
  );
}
