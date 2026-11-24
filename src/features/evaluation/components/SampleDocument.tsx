const students = [
  ['Aarav Sharma', 85],
  ['Diya Patel', 78],
  ['Karan Mehta', 91],
] as const;

/** Stand-in for a candidate's file until documents are connected. */
export function SampleDocument({ taskId, page }: { taskId: string; page: number }) {
  if (taskId === 'excel') return <MarksTable title="Mark Sheet" />;
  if (taskId === 'ppt') {
    return (
      <div className="flex aspect-video flex-col items-center justify-center rounded-lg bg-brand-50 text-center">
        <h3 className="text-2xl font-bold">Slide {page}</h3>
        <p className="mt-2">This is a sample slide created in Microsoft PowerPoint.</p>
      </div>
    );
  }
  if (page > 1) return <p className="text-muted">Page {page} of the sample report.</p>;
  return (
    <div className="space-y-5">
      <h3 className="text-center text-xl font-bold">Student Report</h3>
      <p>This is a sample report created in Microsoft Word.</p>
      <div>
        <h4 className="mb-1 font-bold">1. Introduction</h4>
        <p>The purpose of this report is to demonstrate formatting, tables and page layout.</p>
      </div>
      <MarksTable title="2. Student Details" />
    </div>
  );
}

function MarksTable({ title }: { title: string }) {
  return (
    <div>
      <h4 className="mb-2 font-bold">{title}</h4>
      <table className="w-full border-collapse text-sm [&_td]:border [&_td]:border-muted/50 [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-muted/50 [&_th]:bg-table-head [&_th]:px-3 [&_th]:py-2">
        <thead>
          <tr>
            <th>Sl. No.</th>
            <th>Name</th>
            <th>Marks</th>
          </tr>
        </thead>
        <tbody>
          {students.map(([name, marks], index) => (
            <tr key={name}>
              <td className="text-center">{index + 1}</td>
              <td>{name}</td>
              <td className="text-center">{marks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
