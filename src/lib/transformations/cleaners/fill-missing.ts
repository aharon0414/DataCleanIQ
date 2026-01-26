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
  // ==========================================
  // DEBUGGING: Entry point
  // ==========================================
  console.group('🔧 fillMissingValues DEBUG');
  console.log('📥 INPUT:', {
    totalRows: data.length,
    column: config.column,
    strategy: config.strategy,
    constantValue: config.constantValue,
    firstRowSample: data[0],
    sampleColumnValues: data.slice(0, 5).map(row => row[config.column])
  });

  const { column, strategy, constantValue } = config;

  // Helper function to check if a value should be treated as missing
  const isMissingValue = (val: any): boolean => {
    if (val === null || val === undefined || val === '') return true;
    
    if (typeof val === 'string') {
      const normalized = val.trim().toLowerCase();
      return normalized === 'n/a' || 
             normalized === 'na' || 
             normalized === 'null' || 
             normalized === 'none' || 
             normalized === '#n/a';
    }
    
    return false;
  };

  // Get values for this column (excluding missing values)
  const values = data
    .map(row => row[config.column])
    .filter(val => !isMissingValue(val));

  console.log('📊 After filtering missing values:', {
    originalCount: data.length,
    validValuesCount: values.length,
    missingCount: data.length - values.length,
    percentageMissing: ((data.length - values.length) / data.length * 100).toFixed(1) + '%',
    sampleValidValues: values.slice(0, 5)
  });

  let fillValue: any;

  // ==========================================
  // DEBUGGING: Strategy calculation
  // ==========================================
  console.log('🎯 Calculating fillValue using strategy:', strategy);

  switch (strategy) {
    case 'constant':
      fillValue = constantValue;
      console.log('   → Using constant:', fillValue);
      break;
      
    case 'mean':
      const numericValues = values.filter(v => typeof v === 'number' && !isNaN(v));
      if (numericValues.length === 0) {
        console.error('   ❌ ERROR: No numeric values found for mean calculation');
        fillValue = null;
      } else {
        fillValue = numericValues.reduce((sum, v) => sum + v, 0) / numericValues.length;
        console.log('   → Calculated mean:', fillValue, 'from', numericValues.length, 'numeric values');
      }
      break;
      
    case 'median':
      const sortedValues = [...values].filter(v => typeof v === 'number' && !isNaN(v)).sort((a, b) => a - b);
      if (sortedValues.length === 0) {
        console.error('   ❌ ERROR: No numeric values found for median calculation');
        fillValue = null;
      } else {
        const mid = Math.floor(sortedValues.length / 2);
        fillValue = sortedValues.length % 2 === 0 
          ? (sortedValues[mid - 1] + sortedValues[mid]) / 2
          : sortedValues[mid];
        console.log('   → Calculated median:', fillValue, 'from', sortedValues.length, 'numeric values');
        console.log('   → Sorted values sample:', sortedValues.slice(0, 10));
      }
      break;
      
    case 'mode':
      if (values.length === 0) {
        console.error('   ❌ ERROR: No valid values found for mode calculation');
        fillValue = null;
      } else {
        const counts = new Map<any, number>();
        values.forEach(v => counts.set(v, (counts.get(v) || 0) + 1));
        const entries = Array.from(counts.entries());
        fillValue = entries.reduce((a, b) => a[1] > b[1] ? a : b)[0];
        console.log('   → Calculated mode:', fillValue);
        console.log('   → Value frequencies:', Object.fromEntries(Array.from(counts.entries()).slice(0, 5)));
      }
      break;
      
    case 'forward-fill':
      console.log('   → Using forward-fill strategy');
      let lastValid: any = null;
      const ffResult = data.map((row, index) => {
        const value = row[column];
        const isEmpty = isMissingValue(value);
        if (!isEmpty) {
          lastValid = value;
        }
        const newValue = isEmpty ? lastValid : value;
        if (index < 3) {
          console.log(`   Row ${index}: ${JSON.stringify(value)} → ${newValue}`);
        }
        return { ...row, [column]: newValue };
      });
      console.log('   ✅ Forward-fill complete');
      console.log('📤 OUTPUT (forward-fill):', {
        sampleResults: ffResult.slice(0, 3).map(row => ({ [column]: row[column] }))
      });
      console.groupEnd();
      return ffResult;
      
    case 'remove-rows':
      console.log('   → Removing rows with missing values');
      const filtered = data.filter(row => {
        const value = row[column];
        return !isMissingValue(value);
      });
      console.log('   ✅ Remove-rows complete:', data.length, '→', filtered.length);
      console.log('📤 OUTPUT (remove-rows):', {
        originalCount: data.length,
        filteredCount: filtered.length,
        removedCount: data.length - filtered.length
      });
      console.groupEnd();
      return filtered;

    default:
      console.error('   ❌ ERROR: Unknown strategy:', strategy);
      fillValue = null;
  }

  // ==========================================
  // DEBUGGING: Applying fillValue
  // ==========================================
  console.log('🔄 Applying fillValue to data...');
  console.log('   fillValue to apply:', fillValue);
  
  if (fillValue === null || fillValue === undefined) {
    console.error('   ❌ ERROR: fillValue is null/undefined - cannot fill!');
    console.groupEnd();
    return data; // Return unchanged data
  }

  // Apply fill value to all missing cells
  const result = data.map((row, index) => {
    const originalValue = row[column];
    const isEmpty = isMissingValue(originalValue);
    const newValue = isEmpty ? fillValue : originalValue;
    
    // Log first 3 transformations
    if (isEmpty && index < 3) {
      console.log(`   Row ${index}: ${JSON.stringify(originalValue)} → ${newValue}`);
    }
    
    return {
      ...row,
      [column]: newValue
    };
  });
  
  // ==========================================
  // DEBUGGING: Verify output
  // ==========================================
  console.log('✅ Fill operation complete');
  console.log('📤 OUTPUT:', {
    originalCount: data.length,
    resultCount: result.length,
    sampleOriginal: data.slice(0, 3).map(row => ({ [column]: row[column] })),
    sampleResult: result.slice(0, 3).map(row => ({ [column]: row[column] })),
    nullsRemaining: result.filter(row => isMissingValue(row[column])).length
  });
  
  console.groupEnd();
  return result;
}
