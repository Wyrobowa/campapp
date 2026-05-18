import { useState } from 'react';
import { authClient } from '../lib/auth-client';

export function Account() {
  const { data: session } = authClient.useSession();
  const [name, setName] = useState(session?.user.name ?? '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.SyntheticEvent<HTMLFormElement>) => {
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

  const handleSignOut = async () => {
    await authClient.signOut();
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold mb-6">Account</h1>

      <form
        onSubmit={(e) => {
          void handleSave(e);
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

      <button
        onClick={() => {
          void handleSignOut();
        }}
        className="btn-secondary w-full"
      >
        Sign out
      </button>
    </div>
  );
}
