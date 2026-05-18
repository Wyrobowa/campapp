import { useState } from 'react';
import { Link, useSearch } from '@tanstack/react-router';
import { authClient } from '../lib/auth-client';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function ResetPassword() {
  const { token } = useSearch({ from: '/reset-password' });
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
          <p className="text-sm text-gray-700 mb-4">Invalid or missing reset token.</p>
          <Link to="/" className="text-sm text-forest font-medium hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await authClient.resetPassword({ newPassword: password, token });
      if (err) throw new Error(err.message ?? 'Something went wrong');
      setDone(true);
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
          <p className="text-sm text-gray-500 mt-1">Choose a new password</p>
        </div>

        {done ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <p className="text-sm text-gray-700 mb-4">Password updated! You can now sign in.</p>
            <Link to="/" className="text-sm text-forest font-medium hover:underline">
              Sign in
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
              label="New password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              placeholder="••••••••"
              required
            />
            <Input
              label="Confirm new password"
              type="password"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
              }}
              placeholder="••••••••"
              required
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full justify-center">
              {loading ? 'Saving…' : 'Set new password'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
