import { Bell } from 'lucide-react';
import { Dropdown } from '@/shared/ui';

// Sample content until notifications are connected.
const notifications = [
  'Set 2 of APPSC Computer Proficiency Test is waiting for approval.',
  '48 results are under review.',
];

export function Notifications() {
  return (
    <Dropdown
      inverse
      label={`Notifications, ${notifications.length} new`}
      trigger={
        <span className="relative p-1">
          <Bell aria-hidden className="size-6" strokeWidth={1.75} />
          <span className="absolute top-0.5 right-0.5 size-2.5 rounded-full border-2 border-navy-800 bg-danger" />
        </span>
      }
    >
      {() => (
        <ul className="divide-y divide-line">
          {notifications.map((message) => (
            <li key={message} className="px-3 py-2.5">
              {message}
            </li>
          ))}
        </ul>
      )}
    </Dropdown>
  );
}
