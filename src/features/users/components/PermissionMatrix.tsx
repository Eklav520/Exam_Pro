import { useState } from 'react';
import { Button, DataTable, usePreviewAction } from '@/shared/ui';
import { draftPermissions, permissionModules } from '../data/sample';
import { roleIds, roles } from '../model/roles';

export function PermissionMatrix() {
  const preview = usePreviewAction();
  const [permissions, setPermissions] = useState(draftPermissions);

  return (
    <>
      <DataTable
        caption="Permissions by role"
        rows={permissionModules}
        getRowKey={(module) => module}
        columns={[
          { header: 'Screen', cell: (module) => <span className="font-medium">{module}</span> },
          ...roleIds.map((role) => ({
            header: roles[role].label,
            align: 'center' as const,
            cell: (module: string) => (
              <input
                type="checkbox"
                aria-label={`${roles[role].label}: ${module}`}
                className="size-4.5 accent-brand-700"
                // Removing the Admin's access could lock everyone out.
                disabled={role === 'admin'}
                checked={permissions[role].includes(module)}
                onChange={(event) =>
                  setPermissions({
                    ...permissions,
                    [role]: event.target.checked
                      ? [...permissions[role], module]
                      : permissions[role].filter((item) => item !== module),
                  })
                }
              />
            ),
          })),
        ]}
      />
      <div className="mt-5 flex justify-end gap-3">
        <Button variant="secondary" onClick={() => setPermissions(draftPermissions)}>
          Reset
        </Button>
        <Button onClick={() => preview('Save Permissions')}>Save Permissions</Button>
      </div>
    </>
  );
}
