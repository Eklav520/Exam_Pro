import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { UserRoundPlus } from 'lucide-react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Button, Field } from '@/shared/ui';
import { centres } from '../data/sample';
import { roleIds, roles } from '../model/roles';
import {
  ALL_CENTRES,
  userSchema,
  type ManagedUser,
  type UserFormInput,
  type UserInput,
} from '../model/userSchema';

interface UserFormProps {
  /** Absent when adding a user. */
  user: ManagedUser | null;
  /** Move to the form when it was opened by a button. */
  shouldFocus: boolean;
  /** Returns a message when the email already belongs to someone else. */
  validateEmail: (email: string) => string | undefined;
  onSubmit: (input: UserInput) => void;
  onCancel: () => void;
}

const statuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
] as const;

export function UserForm({ user, shouldFocus, validateEmail, onSubmit, onCancel }: UserFormProps) {
  const {
    register,
    control,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors },
  } = useForm<UserFormInput, unknown, UserInput>({
    resolver: zodResolver(userSchema),
    defaultValues: user ?? {
      name: '',
      email: '',
      mobile: '',
      centre: ALL_CENTRES,
      status: 'active',
    },
  });
  const status = useWatch({ control, name: 'status' });

  useEffect(() => {
    if (shouldFocus) setFocus('name');
  }, [shouldFocus, setFocus]);

  const submit = handleSubmit((input) => {
    const message = validateEmail(input.email);
    if (message) setError('email', { message }, { shouldFocus: true });
    else onSubmit(input);
  });

  return (
    <section className="rounded-xl border border-line p-5">
      <h2 className="mb-4 flex items-center gap-3 text-lg font-bold">
        <UserRoundPlus aria-hidden className="size-6 text-brand-700" />
        {user ? 'Edit User' : 'Add New User'}
      </h2>
      <form
        noValidate
        className="grid gap-x-5 gap-y-3.5 sm:grid-cols-2 2xl:grid-cols-1"
        onSubmit={submit}
      >
        <Field label="Full Name" required error={errors.name?.message}>
          {(props) => <input {...props} placeholder="Enter full name" {...register('name')} />}
        </Field>
        <Field label="Email / Login ID" required error={errors.email?.message}>
          {(props) => (
            <input
              {...props}
              type="email"
              placeholder="Enter email address"
              {...register('email')}
            />
          )}
        </Field>
        <Field label="Role" required error={errors.role?.message}>
          {(props) => (
            <select {...props} {...register('role')}>
              <option value="">Select Role</option>
              {roleIds.map((id) => (
                <option key={id} value={id}>
                  {roles[id].label}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Mobile Number" error={errors.mobile?.message}>
          {(props) => (
            <input
              {...props}
              type="tel"
              placeholder="Enter mobile number"
              {...register('mobile')}
            />
          )}
        </Field>
        <Field label="Centre Access (Optional)">
          {(props) => (
            <select {...props} {...register('centre')}>
              {[ALL_CENTRES, ...centres].map((centre) => (
                <option key={centre}>{centre}</option>
              ))}
            </select>
          )}
        </Field>
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium">Status</legend>
          <div className="grid grid-cols-2 gap-3">
            {statuses.map(({ value, label }) => (
              <label
                key={value}
                className={clsx(
                  'flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm',
                  status === value ? 'border-emerald-400 bg-[#d7fcec]' : 'border-line',
                )}
              >
                <input
                  type="radio"
                  value={value}
                  className="size-4 accent-brand-700"
                  {...register('status')}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="col-span-full grid grid-cols-2 gap-3 border-t border-line pt-4 sm:ml-auto sm:w-72 2xl:w-full">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{user ? 'Save Changes' : 'Create User'}</Button>
        </div>
      </form>
    </section>
  );
}
