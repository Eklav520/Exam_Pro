import { z } from 'zod';
import { roleIds } from './roles';

export const ALL_CENTRES = 'All Centres';

export const userSchema = z.object({
  name: z.string().trim().min(2, 'Enter the full name'),
  email: z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address')),
  role: z.enum(roleIds, { error: 'Select a role' }),
  mobile: z
    .string()
    .trim()
    .regex(/^(\+?[0-9][0-9 ]{8,14}[0-9])?$/, 'Enter 10 to 16 digits'),
  centre: z.string(),
  status: z.enum(['active', 'inactive']),
});

export type UserFormInput = z.input<typeof userSchema>;
export type UserInput = z.output<typeof userSchema>;

export interface ManagedUser extends UserInput {
  id: string;
  /** Null until the first sign-in. */
  lastLogin: string | null;
}
