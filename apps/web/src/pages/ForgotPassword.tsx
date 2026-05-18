import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { authClient } from '../lib/auth-client';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      await authClient.forgetPassword({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-forest">CampApp</h1>
          <p className="text-sm text-gray-500 mt-1">Reset your password</p>
        </div>

        {sent ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <p className="text-sm text-gray-700 mb-4">
              If an account exists for <strong>{email}</strong>, a reset link has been sent.
            </p>
            <Link to="/" className="text-sm text-forest font-medium hover:underline">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              void handleSubmit(e);
            }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4"
          >
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              placeholder="you@example.com"
              required
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full justify-center">
              {loading ? 'Sending…' : 'Send reset link'}
            </Button>
            <p className="text-center text-xs text-gray-400">
              <Link to="/" className="hover:text-gray-600">
                Back to sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
