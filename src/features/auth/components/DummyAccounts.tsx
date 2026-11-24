import { Button } from '@/shared/ui';
import type { LoginRequest } from '../api/authApi';
import { DUMMY_PASSWORD, dummyAccounts } from '../data/dummyAccounts';

interface DummyAccountsProps {
  disabled: boolean;
  onSelect: (credentials: LoginRequest) => void;
}

/** One-click sign-in for each role. Only shown with the mock API, in development. */
export function DummyAccounts({ disabled, onSelect }: DummyAccountsProps) {
  return (
    <section aria-labelledby="dummy-accounts" className="mt-8">
      <h2 id="dummy-accounts" className="mb-3 text-sm font-semibold">
        Or sign in with a dummy account
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {dummyAccounts.map(({ id, label, email }) => (
          <Button
            key={id}
            variant="secondary"
            disabled={disabled}
            className="last:odd:col-span-2"
            onClick={() => onSelect({ email, password: DUMMY_PASSWORD })}
          >
            {label}
          </Button>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">The password for every dummy account is demo123.</p>
    </section>
  );
}
