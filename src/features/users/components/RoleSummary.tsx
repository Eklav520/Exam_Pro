import clsx from 'clsx';
import { UsersRound, type LucideIcon } from 'lucide-react';
import { roleIds, roles } from '../model/roles';
import type { ManagedUser } from '../model/userSchema';

export function RoleSummary({ users }: { users: ManagedUser[] }) {
  return (
    <dl className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {roleIds.map((id) => (
        <SummaryCard
          key={id}
          label={roles[id].label}
          icon={roles[id].icon}
          card={roles[id].card}
          iconColor={roles[id].iconColor}
          count={users.filter((user) => user.role === id).length}
          unit="Users"
        />
      ))}
      <SummaryCard
        label="Total Users"
        icon={UsersRound}
        card="border-sky-200 bg-[#d6f7fd]"
        iconColor="text-sky-700"
        count={users.length}
      />
    </dl>
  );
}

interface SummaryCardProps {
  label: string;
  icon: LucideIcon;
  card: string;
  iconColor: string;
  count: number;
  unit?: string;
}

function SummaryCard({ label, icon: Icon, card, iconColor, count, unit }: SummaryCardProps) {
  return (
    <div className={clsx('flex items-center gap-4 rounded-xl border px-4 py-3.5', card)}>
      <Icon aria-hidden className={clsx('size-9 shrink-0', iconColor)} strokeWidth={1.75} />
      <div>
        <dt className="text-sm leading-snug font-semibold">{label}</dt>
        <dd className="text-sm">
          <span className="text-xl font-bold tabular-nums">{count}</span> {unit}
        </dd>
      </div>
    </div>
  );
}
