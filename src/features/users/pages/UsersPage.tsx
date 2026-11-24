import { nanoid } from '@reduxjs/toolkit';
import { useState } from 'react';
import { PageHeader, Tabs, useToast } from '@/shared/ui';
import { AccessLogTable } from '../components/AccessLogTable';
import { PermissionMatrix } from '../components/PermissionMatrix';
import { RoleSummary } from '../components/RoleSummary';
import { UserForm } from '../components/UserForm';
import { UserTable } from '../components/UserTable';
import { sampleUsers } from '../data/sample';
import type { ManagedUser, UserInput } from '../model/userSchema';

const tabs = [
  { id: 'users', label: 'User Management' },
  { id: 'permissions', label: 'Roles & Permissions' },
  { id: 'logs', label: 'Access Logs' },
] as const;

/** A new key starts a fresh form. */
interface FormState {
  key: string;
  editingId: string | null;
  shouldFocus: boolean;
}

const createForm = (editingId: string | null, shouldFocus: boolean): FormState => ({
  key: nanoid(),
  editingId,
  shouldFocus,
});

/** Changes are kept in memory until this screen is connected. */
export function UsersPage() {
  const toast = useToast();
  const [tab, setTab] = useState<(typeof tabs)[number]['id']>('users');
  const [users, setUsers] = useState(sampleUsers);
  const [form, setForm] = useState(() => createForm(null, false));

  const editing = users.find((user) => user.id === form.editingId) ?? null;

  const update = (id: string, change: Partial<ManagedUser>) =>
    setUsers(users.map((user) => (user.id === id ? { ...user, ...change } : user)));

  const validateEmail = (email: string) =>
    users.some((user) => user.email === email && user.id !== form.editingId)
      ? 'Another user has this email'
      : undefined;

  const handleSubmit = (input: UserInput) => {
    if (editing) {
      update(editing.id, input);
      toast(`${input.name} is updated. Not saved to a server yet.`);
    } else {
      setUsers([{ ...input, id: nanoid(), lastLogin: null }, ...users]);
      toast(`${input.name} is added. Not saved to a server yet.`);
    }
    setForm(createForm(null, false));
  };

  const handleToggleStatus = (user: ManagedUser) => {
    const status = user.status === 'active' ? 'inactive' : 'active';
    update(user.id, { status });
    // An open edit form would otherwise put the old status back.
    if (user.id === form.editingId) setForm(createForm(user.id, false));
    toast(`${user.name} is now ${status}. Not saved to a server yet.`);
  };

  return (
    <>
      <PageHeader title="Admin – Role & Access Management" documentTitle="Users & Roles" />
      <Tabs label="Role and access views" tabs={tabs} active={tab} onChange={setTab}>
        {tab === 'users' && (
          <>
            <RoleSummary users={users} />
            <div className="grid items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_18rem]">
              <UserTable
                users={users}
                onAdd={() => setForm(createForm(null, true))}
                onEdit={(user) => setForm(createForm(user.id, true))}
                onToggleStatus={handleToggleStatus}
              />
              <UserForm
                key={form.key}
                user={editing}
                shouldFocus={form.shouldFocus}
                validateEmail={validateEmail}
                onSubmit={handleSubmit}
                onCancel={() => setForm(createForm(null, false))}
              />
            </div>
          </>
        )}
        {tab === 'permissions' && <PermissionMatrix />}
        {tab === 'logs' && <AccessLogTable />}
      </Tabs>
    </>
  );
}
