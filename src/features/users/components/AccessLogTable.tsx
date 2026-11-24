import { DataTable } from '@/shared/ui';
import { accessLogs } from '../data/sample';
import { StatusDot } from './StatusDot';

export function AccessLogTable() {
  return (
    <DataTable
      caption="Access logs"
      rows={accessLogs}
      getRowKey={(log) => log.id}
      columns={[
        { header: 'Date & Time', cell: (log) => log.time },
        { header: 'User', cell: (log) => <span className="font-medium">{log.user}</span> },
        { header: 'Role', cell: (log) => log.role },
        { header: 'Activity', cell: (log) => log.activity },
        {
          header: 'Result',
          cell: (log) => (
            <StatusDot
              isPositive={log.wasSuccessful}
              label={log.wasSuccessful ? 'Successful' : 'Failed'}
            />
          ),
        },
      ]}
    />
  );
}
