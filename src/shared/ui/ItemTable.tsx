import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Badge } from './Badge';
import { Button } from './Button';
import { DataTable, type Column } from './DataTable';
import { IconButton } from './IconButton';

interface ItemTableProps<Item extends { id: string; marks: number }> {
  title: string;
  /** Singular, for buttons: "Question". */
  itemName: string;
  items: Item[];
  /** Defaults to the item id. */
  getKey?: (item: Item) => string;
  columns: Column<Item>[];
  onAdd: () => void;
  onEdit: (item: Item, index: number) => void;
  onDelete: (item: Item, index: number) => void;
}

/** A list of questions or tasks: add, edit, delete and totals. */
export function ItemTable<Item extends { id: string; marks: number }>({
  title,
  itemName,
  items,
  columns,
  getKey = (item) => item.id,
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
        getRowKey={getKey}
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
                  onClick={() => onEdit(item, index)}
                />
                <IconButton
                  icon={Trash2}
                  danger
                  label={`Delete ${name(index)}`}
                  onClick={() => onDelete(item, index)}
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
