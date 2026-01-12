import type { Issue } from '@/types/quality';

export function detectDuplicates(data: any[]): Issue | null {
  if (!data.length) return null;

  const seen = new Set<string>();
  let duplicateCount = 0;

  data.forEach(row => {
    const rowString = JSON.stringify(row);
    if (seen.has(rowString)) {
      duplicateCount++;
    } else {
      seen.add(rowString);
    }
  });

  const duplicatePercent = parseFloat(((duplicateCount / data.length) * 100).toFixed(1));

  if (duplicateCount === 0) return null;

  return {
    type: 'duplicates',
    column: 'all_columns',
    count: duplicateCount,
    percentage: duplicatePercent,
    severity: duplicatePercent > 10 ? 'high' : 
              duplicatePercent > 5 ? 'medium' : 'low',
    description: `${duplicateCount} exact duplicate rows found (${duplicatePercent.toFixed(1)}%)`,
    suggestion: 'Remove duplicate rows unless they represent valid repeated records'
  };
}
