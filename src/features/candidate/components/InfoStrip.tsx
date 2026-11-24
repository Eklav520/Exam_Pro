/** The line of facts below the exam header. */
export function InfoStrip({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-y-1 text-sm font-medium">
      {items.map((item) => (
        <li key={item} className="border-l border-muted/60 px-5 first:border-l-0 first:pl-0">
          {item}
        </li>
      ))}
    </ul>
  );
}
