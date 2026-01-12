import type { Issue } from '@/types/quality';

export function detectOutliers(
  data: any[],
  columnName: string
): Issue | null {
  // Get numeric values only
  const values = data
    .map(row => row[columnName])
    .filter(val => typeof val === 'number' && !isNaN(val));

  if (values.length === 0) return null;

  // Calculate Q1, Q3, and IQR
  const sorted = [...values].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);
  
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;
  
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  // Count outliers
  const outliers = values.filter(val => val < lowerBound || val > upperBound);
  const outlierCount = outliers.length;
  const outlierPercent = (outlierCount / values.length) * 100;

  if (outlierCount === 0) return null;

  return {
    type: 'outliers',
    column: columnName,
    count: outlierCount,
    percentage: outlierPercent,
    severity: outlierPercent > 10 ? 'high' : 
              outlierPercent > 5 ? 'medium' : 'low',
    description: `${outlierCount} statistical outliers detected using IQR method (values < ${lowerBound.toFixed(2)} or > ${upperBound.toFixed(2)})`,
    suggestion: `Review outliers: values < ${lowerBound.toFixed(2)} or > ${upperBound.toFixed(2)}`
  };
}
