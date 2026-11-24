import { roles, type RoleId } from '../model/roles';

export function RoleBadge({ role }: { role: RoleId }) {
  return (
    <span className={`inline-flex rounded-md px-3 py-1 text-xs font-semibold ${roles[role].badge}`}>
      {roles[role].label}
    </span>
  );
}
