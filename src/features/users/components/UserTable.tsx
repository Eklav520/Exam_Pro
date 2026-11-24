import { Pencil, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import {
  Button,
  DataTable,
  IconButton,
  Pagination,
  RowMenu,
  usePreviewAction,
  type Column,
} from '@/shared/ui';
import { roleIds, roles } from '../model/roles';
import type { ManagedUser } from '../model/userSchema';
import { RoleBadge } from './RoleBadge';
import { StatusDot } from './StatusDot';

const PAGE_SIZE = 8;
const ALL = 'all';

interface UserTableProps {
  users: ManagedUser[];
  onAdd: () => void;
  onEdit: (user: ManagedUser) => void;
  onToggleStatus: (user: ManagedUser) => void;
}

function getInitials(name: string): string {
  const words = name.replace(/^(Dr|Prof|Mr|Mrs|Ms)\. /, '').split(/\s+/);
  return words
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();
}

export function UserTable({ users, onAdd, onEdit, onToggleStatus }: UserTableProps) {
  const preview = usePreviewAction();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<string>(ALL);
  const [requestedPage, setPage] = useState(1);

  const term = search.trim().toLowerCase();
  const matches = users.filter(
    (user) =>
      (role === ALL || user.role === role) &&
      `${user.name} ${user.email} ${roles[user.role].label}`.toLowerCase().includes(term),
  );
  const pageCount = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const page = Math.min(requestedPage, pageCount);
  const start = (page - 1) * PAGE_SIZE;
  const rows = matches.slice(start, start + PAGE_SIZE);

  const columns: Column<ManagedUser>[] = [
    { header: '#', cell: (_user, index) => start + index + 1 },
    {
      header: 'User Name',
      cell: (user) => (
        <span className="flex items-center gap-2.5 font-medium">
          <span
            aria-hidden
            className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${roles[user.role].badge}`}
          >
            {getInitials(user.name)}
          </span>
          {user.name}
        </span>
      ),
    },
    { header: 'Email / Login ID', cell: (user) => user.email },
    { header: 'Role', cell: (user) => <RoleBadge role={user.role} /> },
    {
      header: 'Status',
      cell: (user) => (
        <StatusDot
          isPositive={user.status === 'active'}
          label={user.status === 'active' ? 'Active' : 'Inactive'}
        />
      ),
    },
    { header: 'Last Login', cell: (user) => user.lastLogin ?? 'Never' },
    {
      header: 'Actions',
      align: 'center',
      cell: (user) => (
        <span className="inline-flex">
          <IconButton icon={Pencil} label={`Edit ${user.name}`} onClick={() => onEdit(user)} />
          <RowMenu
            label={`More actions for ${user.name}`}
            items={[
              {
                label: user.status === 'active' ? 'Deactivate' : 'Activate',
                onSelect: () => onToggleStatus(user),
              },
              { label: 'Reset password', onSelect: () => preview('Reset password') },
              { label: 'Delete', danger: true, onSelect: () => preview('Delete user') },
            ]}
          />
        </span>
      ),
    },
  ];

  return (
    <section className="min-w-0 rounded-xl border border-line p-4">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h2 className="mr-auto text-lg font-bold">Users ({users.length})</h2>
        <div className="relative w-full sm:w-64">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          />
          <input
            type="search"
            aria-label="Search users"
            placeholder="Search by name, email or role..."
            className="control pl-9"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          aria-label="Filter by role"
          className="control w-auto!"
          value={role}
          onChange={(event) => {
            setRole(event.target.value);
            setPage(1);
          }}
        >
          <option value={ALL}>All Roles</option>
          {roleIds.map((id) => (
            <option key={id} value={id}>
              {roles[id].label}
            </option>
          ))}
        </select>
        <Button onClick={onAdd}>
          <Plus aria-hidden className="size-4" />
          Add User
        </Button>
      </div>
      <DataTable
        dense
        caption="Users"
        columns={columns}
        rows={rows}
        getRowKey={(user) => user.id}
        emptyMessage="No users match this search."
      />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-sm text-muted">
          {matches.length === 0
            ? 'No users'
            : `Showing ${start + 1} – ${start + rows.length} of ${matches.length} users`}
        </p>
        <Pagination page={page} pageCount={pageCount} onChange={setPage} />
      </div>
    </section>
  );
}
