import { Link } from 'react-router-dom';
import { to } from '@/shared/config/paths';
import { formatDateTime, formatNumber } from '@/shared/lib/format';
import type { ResultSummary } from '@/shared/types';
import { Badge } from '@/shared/ui';

export function ResultTable({ results }: { results: ResultSummary[] }) {
  return (
    <div className="relative overflow-x-auto rounded-lg border border-line bg-surface">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Exam</th>
            <th className="px-4 py-3 font-medium">Submitted</th>
            <th className="px-4 py-3 text-right font-medium">Score</th>
            <th className="px-4 py-3 font-medium">Outcome</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {results.map((result) => (
            <tr key={result.attemptId}>
              <td className="px-4 py-3">
                <Link
                  to={to.resultDetail(result.attemptId)}
                  className="font-medium text-brand-700 hover:underline"
                >
                  {result.examTitle}
                </Link>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-muted">
                {formatDateTime(result.submittedAt)}
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap tabular-nums">
                {formatNumber(result.score)} / {formatNumber(result.totalMarks)} (
                {formatNumber(result.percentage)}%)
              </td>
              <td className="px-4 py-3">
                <Badge tone={result.passed ? 'success' : 'danger'}>
                  {result.passed ? 'Passed' : 'Not passed'}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
