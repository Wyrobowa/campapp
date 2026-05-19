import { useState } from 'react';
import type { Collaborator } from '../../types';

interface CollaboratorsPanelProps {
  tripId: string;
  collaborators: Collaborator[];
  onInvite: (email: string) => Promise<void>;
  onRemove: (collaboratorId: string) => Promise<void>;
}

export function CollaboratorsPanel({
  tripId: _tripId,
  collaborators,
  onInvite,
  onRemove,
}: CollaboratorsPanelProps) {
  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInvite = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    setInviting(true);
    try {
      await onInvite(email.trim());
      setEmail('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('User not found')) setError('No account found for that email.');
      else if (msg.includes('Already a collaborator')) setError('Already a collaborator.');
      else if (msg.includes('Cannot invite yourself')) setError("That's you!");
      else setError('Failed to invite. Try again.');
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {collaborators.length > 0 && (
        <ul className="flex flex-col gap-2">
          {collaborators.map((c) => (
            <li key={c.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-800">{c.name}</p>
                <p className="text-xs text-gray-400">{c.email}</p>
              </div>
              <button
                onClick={() => {
                  void onRemove(c.id);
                }}
                className="text-xs text-gray-400 hover:text-red-500"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <form
        onSubmit={(e) => {
          void handleInvite(e);
        }}
        className="flex gap-2"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          placeholder="Invite by email…"
          className="field-base flex-1 text-sm"
        />
        <button
          type="submit"
          disabled={inviting || !email.trim()}
          className="btn-primary text-sm px-3 py-1.5 disabled:opacity-50"
        >
          {inviting ? '…' : 'Invite'}
        </button>
      </form>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
