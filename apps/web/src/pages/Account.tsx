import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { authClient } from '../lib/auth-client';
import { accountApi } from '../lib/api';
import { Input } from '../components/ui/Input';

export function Account() {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();

  const [name, setName] = useState(session?.user.name ?? '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPw, setChangingPw] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSaved, setPwSaved] = useState(false);

  const handleSaveName = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    setSaved(false);
    try {
      await authClient.updateUser({ name });
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwError('Passwords do not match');
      return;
    }
    setChangingPw(true);
    setPwError('');
    setPwSaved(false);
    try {
      const { error } = await authClient.changePassword({ currentPassword, newPassword });
      if (error) throw new Error(error.message ?? 'Failed to change password');
      setPwSaved(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setChangingPw(false);
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    void navigate({ to: '/' });
  };

  const [deletingAccount, setDeletingAccount] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await accountApi.deleteAccount();
      await authClient.signOut();
      void navigate({ to: '/' });
    } catch {
      setDeletingAccount(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold mb-6">Account</h1>

      <form
        onSubmit={(e) => {
          void handleSaveName(e);
        }}
        className="space-y-4 mb-8"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Display name</label>
          <input
            className="field-base w-full"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <p className="text-gray-500 text-sm">{session?.user.email}</p>
        </div>
        {saveError && <p className="text-sm text-red-500">{saveError}</p>}
        {saved && <p className="text-sm text-forest">Name updated.</p>}
        <button
          type="submit"
          disabled={saving || name === session?.user.name}
          className="btn-primary w-full"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </form>

      <h2 className="text-base font-semibold mb-4">Change password</h2>
      <form
        onSubmit={(e) => {
          void handleChangePassword(e);
        }}
        className="space-y-4 mb-8"
      >
        <Input
          label="Current password"
          type="password"
          value={currentPassword}
          onChange={(e) => {
            setCurrentPassword(e.target.value);
            setPwSaved(false);
          }}
          placeholder="••••••••"
          required
        />
        <Input
          label="New password"
          type="password"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            setPwSaved(false);
          }}
          placeholder="••••••••"
          required
        />
        <Input
          label="Confirm new password"
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setPwSaved(false);
          }}
          placeholder="••••••••"
          required
        />
        {pwError && <p className="text-sm text-red-500">{pwError}</p>}
        {pwSaved && <p className="text-sm text-forest">Password changed.</p>}
        <button type="submit" disabled={changingPw} className="btn-primary w-full">
          {changingPw ? 'Saving…' : 'Change password'}
        </button>
      </form>

      <button
        onClick={() => {
          void handleSignOut();
        }}
        className="btn-secondary w-full"
      >
        Sign out
      </button>

      <div className="mt-12 pt-6 border-t border-gray-100">
        <h2 className="text-base font-semibold text-red-600 mb-2">Danger zone</h2>
        {confirmDelete ? (
          <div className="bg-red-50 rounded-xl p-4 flex flex-col gap-3">
            <p className="text-sm text-red-700">
              This will permanently delete your account and all trips. Are you sure?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setConfirmDelete(false);
                }}
                className="btn-secondary flex-1 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  void handleDeleteAccount();
                }}
                disabled={deletingAccount}
                className="flex-1 text-sm bg-red-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deletingAccount ? 'Deleting…' : 'Yes, delete everything'}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => {
              setConfirmDelete(true);
            }}
            className="text-sm text-red-500 hover:text-red-700 font-medium"
          >
            Delete account
          </button>
        )}
      </div>
    </div>
  );
}
