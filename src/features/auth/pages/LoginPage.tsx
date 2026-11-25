import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { useAppSelector } from '@/app/hooks';
import { getErrorMessage } from '@/shared/api/getErrorMessage';
import { path } from '@/shared/config/paths';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { Alert, Brand, Button, Field, SelectField } from '@/shared/ui';
import { useLoginMutation, type LoginRequest } from '../api/authApi';
import { DUMMY_PASSWORD, dummyAccounts } from '../data/dummyAccounts';
import { selectIsAuthenticated } from '../model/authSlice';

const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});

function getRedirect(state: unknown): string {
  if (typeof state === 'object' && state !== null && 'from' in state) {
    if (typeof state.from === 'string') return state.from;
  }
  return path.home;
}

export function LoginPage() {
  useDocumentTitle('Sign in');
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [selectedRole, setSelectedRole] = useState('');
  const [login, { isLoading, error }] = useLoginMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  function handleRoleChange(roleId: string) {
    setSelectedRole(roleId);
    const account = dummyAccounts.find((item) => item.id === roleId);
    if (account) {
      reset({ email: account.email, password: DUMMY_PASSWORD });
    } else {
      reset({ email: '', password: '' });
    }
  }

  if (isAuthenticated) return <Navigate to={getRedirect(location.state)} replace />;

  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr] bg-surface lg:grid-cols-[2fr_3fr] lg:grid-rows-1">
      <header className="flex flex-col justify-between gap-12 bg-linear-to-b from-navy-800 to-navy-900 px-6 py-6 text-white lg:px-12 lg:py-10">
        <Brand />
        <p className="hidden max-w-md text-3xl leading-snug font-semibold lg:block">
          Prepare, conduct, evaluate and approve examinations in one place.
        </p>
        <span aria-hidden className="hidden lg:block" />
      </header>
      <main className="mx-auto flex w-full max-w-md flex-col justify-center px-6 py-10">
        <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
        <p className="mt-1 mb-6 text-muted">Use your ExamPro account to continue.</p>
        <form
          noValidate
          className="space-y-4"
          onSubmit={handleSubmit((values) => void login(values))}
        >
          {error && <Alert>{getErrorMessage(error)}</Alert>}
          <SelectField
            label="Role"
            value={selectedRole}
            options={[
              { value: '', label: 'Select a role (Demo / Quick Fill)' },
              ...dummyAccounts.map(({ id, label }) => ({ value: id, label })),
            ]}
            onChange={handleRoleChange}
          />
          <Field label="Email" error={errors.email?.message}>
            {(props) => (
              <input {...props} type="email" autoComplete="username" {...register('email')} />
            )}
          </Field>
          <Field label="Password" error={errors.password?.message}>
            {(props) => (
              <input
                {...props}
                type="password"
                autoComplete="current-password"
                {...register('password')}
              />
            )}
          </Field>
          <Button type="submit" isLoading={isLoading} className="w-full">
            Sign in
          </Button>
        </form>
      </main>
    </div>
  );
}
