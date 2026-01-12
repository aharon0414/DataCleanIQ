import type { Issue } from '@/types/quality';

export function detectMissingValues(
  data: any[],
  columnName: string
): Issue | null {
  if (!data.length) return null;

  const missingValues = data.filter(row => {
    const value = row[columnName];
    
    // Check for various forms of missing data
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') {
      const trimmed = value.trim().toLowerCase();
      if (trimmed === '' || 
          trimmed === 'n/a' || 
          trimmed === 'na' || 
          trimmed === 'null' || 
          trimmed === 'none' ||
          trimmed === '#n/a') {
        return true;
      }
    }
    return false;
  });

  const missingCount = missingValues.length;
  const missingPercent = (missingCount / data.length) * 100;

  if (missingCount === 0) return null;

  return {
    type: 'missing_values',
    column: columnName,
    count: missingCount,
    percentage: missingPercent,
    severity: missingPercent > 50 ? 'critical' : 
              missingPercent > 20 ? 'high' : 
              missingPercent > 10 ? 'medium' : 'low',
    description: `${missingCount} missing values (${missingPercent.toFixed(1)}%)`,
    suggestion: missingPercent > 50 
      ? 'Consider removing this column or filling with domain-specific values'
      : 'Fill missing values with median, mean, or mode depending on data type'
  };
}
