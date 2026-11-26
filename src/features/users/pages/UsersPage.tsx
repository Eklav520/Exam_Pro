import { nanoid } from '@reduxjs/toolkit';
import { useState } from 'react';
import { PageHeader, Tabs, useToast } from '@/shared/ui';
import { AccessLogTable } from '../components/AccessLogTable';
import { PermissionMatrix } from '../components/PermissionMatrix';
import { RoleSummary } from '../components/RoleSummary';
import { UserDialog } from '../components/UserDialog';
import { UserTable } from '../components/UserTable';
import { sampleUsers } from '../data/sample';
import type { ManagedUser, UserInput } from '../model/userSchema';

const tabs = [
  { id: 'users', label: 'User Management' },
  { id: 'permissions', label: 'Roles & Permissions' },
  { id: 'logs', label: 'Access Logs' },
] as const;

/** The open user dialog; `editingId` is null when adding. */
interface DialogState {
  editingId: string | null;
}

/** Changes are kept in memory until this screen is connected. */
export function UsersPage() {
  const toast = useToast();
  const [tab, setTab] = useState<(typeof tabs)[number]['id']>('users');
  const [users, setUsers] = useState(sampleUsers);
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const editing = users.find((user) => user.id === dialog?.editingId) ?? null;

  const update = (id: string, change: Partial<ManagedUser>) =>
    setUsers(users.map((user) => (user.id === id ? { ...user, ...change } : user)));

  const validateEmail = (email: string) =>
    users.some((user) => user.email === email && user.id !== dialog?.editingId)
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
    setDialog(null);
  };

  const handleToggleStatus = (user: ManagedUser) => {
    const status = user.status === 'active' ? 'inactive' : 'active';
    update(user.id, { status });
    toast(`${user.name} is now ${status}. Not saved to a server yet.`);
  };

  return (
    <>
      <PageHeader title="Admin – Role & Access Management" documentTitle="Users & Roles" />
      <Tabs label="Role and access views" tabs={tabs} active={tab} onChange={setTab}>
        {tab === 'users' && (
          <>
            <RoleSummary users={users} />
            <UserTable
              users={users}
              onAdd={() => setDialog({ editingId: null })}
              onEdit={(user) => setDialog({ editingId: user.id })}
              onToggleStatus={handleToggleStatus}
            />
            {dialog && (
              <UserDialog
                user={editing}
                validateEmail={validateEmail}
                onSubmit={handleSubmit}
                onCancel={() => setDialog(null)}
              />
            )}
          </>
        )}
        {tab === 'permissions' && <PermissionMatrix />}
        {tab === 'logs' && <AccessLogTable />}
      </Tabs>
    </>
  );
}
