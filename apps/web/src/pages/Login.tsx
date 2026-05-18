import { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { authClient } from '../lib/auth-client';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [unverified, setUnverified] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [signedUp, setSignedUp] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setUnverified(false);
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error: err } = await authClient.signUp.email({ name, email, password });
        if (err) throw new Error(err.message);
        setSignedUp(true);
        return;
      } else {
        const { error: err } = await authClient.signIn.email({ email, password });
        if (err) {
          if (err.code === 'EMAIL_NOT_VERIFIED') {
            setUnverified(true);
            return;
          }
          throw new Error(err.message);
        }
      }
      void navigate({ to: '/' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendSent(false);
    try {
       
      await authClient.sendVerificationEmail({ email, callbackURL: '/' });
      setResendSent(true);
    } catch {
      // silently fail — avoid leaking whether email exists
      setResendSent(true);
    }
  };

  if (signedUp) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
          <p className="text-2xl mb-3">📬</p>
          <h2 className="font-semibold text-gray-900 mb-2">Check your email</h2>
          <p className="text-sm text-gray-500">
            We sent a verification link to <strong>{email}</strong>. Click it to activate your
            account.
          </p>
          <button
            onClick={() => {
              setSignedUp(false);
              setMode('signin');
            }}
            className="mt-4 text-sm text-forest font-medium hover:underline"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-forest">CampApp</h1>
          <p className="text-sm text-gray-500 mt-1">
            {mode === 'signin' ? 'Sign in to your account' : 'Create an account'}
          </p>
        </div>

        {unverified ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center flex flex-col gap-3">
            <p className="text-2xl">📬</p>
            <p className="text-sm text-gray-700">
              Your email <strong>{email}</strong> hasn't been verified yet.
            </p>
            {resendSent ? (
              <p className="text-sm text-forest">Verification email sent — check your inbox.</p>
            ) : (
              <Button
                onClick={() => {
                  void handleResend();
                }}
                className="w-full justify-center"
              >
                Resend verification email
              </Button>
            )}
            <button
              onClick={() => {
                setUnverified(false);
                setResendSent(false);
              }}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Back
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              void handleSubmit(e);
            }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4"
          >
            {mode === 'signup' && (
              <Input
                label="Name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
                placeholder="Your name"
                required
              />
            )}
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
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              placeholder="••••••••"
              required
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" disabled={loading} className="w-full justify-center mt-1">
              {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </Button>

            {mode === 'signin' && (
              <p className="text-center text-xs text-gray-400">
                <Link to="/forgot-password" className="hover:text-gray-600">
                  Forgot password?
                </Link>
              </p>
            )}
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-4">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError(null);
              setUnverified(false);
            }}
            className="text-forest font-medium"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
