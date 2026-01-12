/**
 * Remove outliers from a numeric column using IQR or Z-score method
 */

export interface RemoveOutliersConfig {
  column: string;
  method: 'iqr' | 'z-score';
  threshold?: number; // For z-score (default 3), or IQR multiplier (default 1.5)
}

export function removeOutliers(data: any[], config: RemoveOutliersConfig): any[] {
  const { column, method, threshold = method === 'z-score' ? 3 : 1.5 } = config;

  // Get numeric values only
  const values = data
    .map(row => row[column])
    .filter(val => typeof val === 'number' && !isNaN(val));

  if (values.length === 0) return data;

  if (method === 'iqr') {
    // IQR method
    const sorted = [...values].sort((a, b) => a - b);
    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;
    const lowerBound = q1 - threshold * iqr;
    const upperBound = q3 + threshold * iqr;

    return data.filter(row => {
      const value = row[column];
      if (typeof value !== 'number') return true;
      return value >= lowerBound && value <= upperBound;
    });
  } else {
    // Z-score method
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return data;

    return data.filter(row => {
      const value = row[column];
      if (typeof value !== 'number') return true;
      const zScore = Math.abs((value - mean) / stdDev);
      return zScore <= threshold;
    });
  }
}
