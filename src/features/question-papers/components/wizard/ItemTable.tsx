import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Badge, Button, DataTable, IconButton, type Column } from '@/shared/ui';

interface ItemTableProps<Item extends { id: string; marks: number }> {
  title: string;
  /** Singular, for buttons: "Question". */
  itemName: string;
  items: Item[];
  columns: Column<Item>[];
  onAdd: () => void;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
}

/** The question and task lists share everything but their columns. */
export function ItemTable<Item extends { id: string; marks: number }>({
  title,
  itemName,
  items,
  columns,
  onAdd,
  onEdit,
  onDelete,
}: ItemTableProps<Item>) {
  const totalMarks = items.reduce((sum, item) => sum + item.marks, 0);
  const name = (index: number) => `${itemName.toLowerCase()} ${index + 1}`;

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-bold">
          {title}{' '}
          <span className="font-medium">
            ({items.length} {items.length === 1 ? itemName : `${itemName}s`}, {totalMarks} Marks)
          </span>
        </h2>
        <Button onClick={onAdd}>
          <Plus aria-hidden className="size-4" />
          Add {itemName}
        </Button>
      </div>
      <DataTable
        caption={title}
        rows={items}
        getRowKey={(item) => item.id}
        emptyMessage={`No ${itemName.toLowerCase()}s yet. Use “Add ${itemName}” to start.`}
        columns={[
          { header: 'No.', cell: (_item, index) => index + 1 },
          ...columns,
          { header: 'Marks', align: 'center', cell: (item) => item.marks },
          {
            header: 'Actions',
            align: 'center',
            cell: (item, index) => (
              <span className="inline-flex gap-1">
                <IconButton
                  icon={Pencil}
                  label={`Edit ${name(index)}`}
                  onClick={() => onEdit(item)}
                />
                <IconButton
                  icon={Trash2}
                  danger
                  label={`Delete ${name(index)}`}
                  onClick={() => onDelete(item)}
                />
              </span>
            ),
          },
        ]}
      />
      <p className="mt-3 flex justify-end gap-3">
        <Badge tone="info">
          Total {itemName}s: {items.length}
        </Badge>
        <Badge tone="info">Total Marks: {totalMarks}</Badge>
      </p>
    </section>
  );
}
