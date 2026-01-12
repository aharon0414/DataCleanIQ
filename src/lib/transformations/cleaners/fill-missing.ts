/**
 * Fill missing values in a column using various strategies
 */

export type FillStrategy = 'constant' | 'mean' | 'median' | 'mode' | 'forward-fill' | 'remove-rows';

export interface FillMissingConfig {
  column: string;
  strategy: FillStrategy;
  constantValue?: any;
}

export function fillMissingValues(data: any[], config: FillMissingConfig): any[] {
  const { column, strategy, constantValue } = config;

  // Get values for this column (excluding nulls)
  const values = data
    .map(row => row[column])
    .filter(val => val !== null && val !== undefined && val !== '');

  let fillValue: any;

  switch (strategy) {
    case 'constant':
      fillValue = constantValue;
      break;
      
    case 'mean':
      const numericValues = values.filter(v => typeof v === 'number');
      if (numericValues.length === 0) return data;
      fillValue = numericValues.reduce((sum, v) => sum + v, 0) / numericValues.length;
      break;
      
    case 'median':
      const sortedValues = [...values].filter(v => typeof v === 'number').sort((a, b) => a - b);
      if (sortedValues.length === 0) return data;
      const mid = Math.floor(sortedValues.length / 2);
      fillValue = sortedValues.length % 2 === 0 
        ? (sortedValues[mid - 1] + sortedValues[mid]) / 2
        : sortedValues[mid];
      break;
      
    case 'mode':
      if (values.length === 0) return data;
      const counts = new Map<any, number>();
      values.forEach(v => counts.set(v, (counts.get(v) || 0) + 1));
      fillValue = Array.from(counts.entries()).reduce((a, b) => a[1] > b[1] ? a : b)[0];
      break;
      
    case 'forward-fill':
      let lastValid: any = null;
      return data.map(row => {
        const value = row[column];
        if (value !== null && value !== undefined && value !== '') {
          lastValid = value;
        }
        return { ...row, [column]: value === null || value === undefined || value === '' ? lastValid : value };
      });
      
    case 'remove-rows':
      return data.filter(row => {
        const value = row[column];
        return value !== null && value !== undefined && value !== '';
      });
      
    default:
      return data;
  }

  // Apply fill value
  return data.map(row => ({
    ...row,
    [column]: row[column] === null || row[column] === undefined || row[column] === '' 
      ? fillValue 
      : row[column]
  }));
}
