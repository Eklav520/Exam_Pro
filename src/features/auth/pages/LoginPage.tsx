import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { useAppSelector } from '@/app/hooks';
import { getErrorMessage } from '@/shared/api/getErrorMessage';
import { env } from '@/shared/config/env';
import { path } from '@/shared/config/paths';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { Alert, Button, Card, Field } from '@/shared/ui';
import { useLoginMutation } from '../api/authApi';
import { selectIsAuthenticated } from '../model/authSlice';

const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});

type LoginForm = z.infer<typeof loginSchema>;

const demoAccounts = [
  { label: 'Student demo', email: 'student@exampro.test', password: 'student123' },
  { label: 'Admin demo', email: 'admin@exampro.test', password: 'admin123' },
];

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
  const [login, { isLoading, error }] = useLoginMutation();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  if (isAuthenticated) return <Navigate to={getRedirect(location.state)} replace />;

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4 py-12">
      <img src="/favicon.svg" alt="" className="mb-4 size-10" />
      <h1 className="text-2xl font-semibold tracking-tight">Sign in to Exam Pro</h1>
      <p className="mt-1 mb-6 text-muted">Take your exams and review your results.</p>
      <Card>
        <form
          noValidate
          className="space-y-4"
          onSubmit={handleSubmit((values) => void login(values))}
        >
          {error && <Alert>{getErrorMessage(error)}</Alert>}
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
      </Card>
      {import.meta.env.DEV && env.enableMocks && (
        <div className="mt-4 flex gap-2">
          {demoAccounts.map((account) => (
            <Button
              key={account.email}
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => {
                setValue('email', account.email, { shouldValidate: true });
                setValue('password', account.password, { shouldValidate: true });
              }}
            >
              {account.label}
            </Button>
          ))}
        </div>
      )}
    </main>
  );
}
