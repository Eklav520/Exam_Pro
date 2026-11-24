import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { marksSheet } from '../../data/sample';
import { cellEdited, selectCandidate } from '../../model/candidateSlice';
import { Ribbon } from './Ribbon';
import { ZoomControl } from './ZoomControl';

const FIRST_ROW = 3;
/** Enough to fill a large screen; the sheet scrolls on smaller ones. */
const EMPTY_ROWS = 34;
const tabs = ['File', 'Home', 'Insert', 'Page Layout', 'Formulas', 'Data', 'Review', 'View'];
const commands = [
  { group: 'Cells', items: ['Wrap Text', 'Merge & Center'] },
  { group: 'Number', items: ['General', '%', ','] },
  { group: 'Styles', items: ['Conditional Formatting', 'Format Styles'] },
];

const columnLetter = (index: number) => String.fromCharCode(65 + index);
const columnCount = marksSheet.headers.length;
const givenCount = marksSheet.rows[0]?.length ?? 0;

/** Answer cells are editable. Formulas are stored as typed; they are not calculated yet. */
export function ExcelWorkspace() {
  const dispatch = useAppDispatch();
  const values = useAppSelector(selectCandidate).work.excel;
  const [active, setActive] = useState(`${columnLetter(givenCount)}${FIRST_ROW}`);
  const [zoom, setZoom] = useState(100);

  const edit = (cell: string, value: string) => dispatch(cellEdited({ cell, value }));
  const headerCell = 'border border-line bg-canvas px-2 py-1 text-center font-medium text-muted';

  return (
    <section
      aria-label="Excel workspace"
      className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-line"
    >
      <Ribbon tabs={tabs} className="bg-[#066d41]" commands={commands} />
      <div className="flex items-center gap-2 border-b border-line bg-canvas px-2 py-1.5 text-sm">
        <span className="w-16 rounded border border-line bg-surface px-2 py-1 text-center font-medium">
          {active}
        </span>
        <span aria-hidden className="text-muted italic">
          fx
        </span>
        <input
          aria-label={`Formula for cell ${active}`}
          className="flex-1 rounded border border-line bg-surface px-2 py-1"
          value={values[active] ?? ''}
          onChange={(event) => edit(active, event.target.value)}
        />
      </div>
      <div className="max-h-112 overflow-auto lg:max-h-none lg:min-h-0 lg:flex-1">
        <table className="w-full min-w-176 border-collapse text-sm" style={{ zoom: zoom / 100 }}>
          <caption className="sr-only">{marksSheet.title}</caption>
          <thead className="sticky top-0 z-10">
            <tr>
              <td className={headerCell} />
              {marksSheet.headers.map((header, index) => (
                <td key={header} className={headerCell}>
                  {columnLetter(index)}
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={headerCell}>1</td>
              <td
                colSpan={columnCount}
                className="bg-[#087135] py-1.5 text-center text-base font-bold text-white"
              >
                {marksSheet.title}
              </td>
            </tr>
            <tr>
              <td className={headerCell}>2</td>
              {marksSheet.headers.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="border border-line bg-table-head px-2 py-1.5 font-bold whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
            {marksSheet.rows.map((row, rowIndex) => (
              <tr key={row[0]}>
                <td className={headerCell}>{FIRST_ROW + rowIndex}</td>
                {marksSheet.headers.map((header, column) => {
                  const given = row[column];
                  if (given !== undefined) {
                    return (
                      <td
                        key={header}
                        className={`border border-line px-2 py-1.5 whitespace-nowrap ${column === 1 ? '' : 'text-center'}`}
                      >
                        {given}
                      </td>
                    );
                  }
                  const cell = `${columnLetter(column)}${FIRST_ROW + rowIndex}`;
                  return (
                    <td key={header} className="border border-line bg-[#fdfbd8] p-0">
                      <input
                        aria-label={`${header}, ${row[1] ?? ''}`}
                        className="w-full min-w-16 bg-transparent px-2 py-1.5 text-center focus:outline-2 focus:-outline-offset-2 focus:outline-emerald-700"
                        value={values[cell] ?? ''}
                        onFocus={() => setActive(cell)}
                        onChange={(event) => edit(cell, event.target.value)}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
            {Array.from({ length: EMPTY_ROWS }, (_item, index) => (
              <tr key={index}>
                <td className={headerCell}>{FIRST_ROW + marksSheet.rows.length + index}</td>
                {marksSheet.headers.map((header) => (
                  <td key={header} className="h-8 border border-line" />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-3 border-t border-line bg-canvas px-3 py-1">
        <ChevronLeft aria-hidden className="size-4 text-muted" />
        <ChevronRight aria-hidden className="size-4 text-muted" />
        <span className="rounded-t border-b-2 border-emerald-700 bg-surface px-4 py-1 text-sm font-bold text-emerald-800">
          Marks
        </span>
        <span className="ml-auto">
          <ZoomControl zoom={zoom} onChange={setZoom} />
        </span>
      </div>
    </section>
  );
}
