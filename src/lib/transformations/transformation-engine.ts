/**
 * Transformation Engine - Orchestrates data cleaning transformations
 */

import type { IssueType, QualityReport } from '@/types/quality';
import { removeDuplicates } from './cleaners/remove-duplicates';
import { fillMissingValues, type FillMissingConfig, type FillStrategy } from './cleaners/fill-missing';
import { removeOutliers, type RemoveOutliersConfig } from './cleaners/remove-outliers';

export interface FlagOnlyConfig {
  column: string;
  issueType: IssueType;
  count: number;
}

export type Transformation =
  | {
      id: string;
      type: 'remove-duplicates';
      description: string;
      applied: boolean;
    }
  | {
      id: string;
      type: 'fill-missing';
      description: string;
      config: FillMissingConfig;
      applied: boolean;
    }
  | {
      id: string;
      type: 'remove-outliers';
      description: string;
      config: RemoveOutliersConfig;
      applied: boolean;
    }
  | {
      id: string;
      type: 'flag-only';
      description: string;
      config: FlagOnlyConfig;
      applied: boolean;
    };

/*
export interface Transformation {
  id: string;
  type: 'remove-duplicates' | 'fill-missing' | 'remove-outliers' | 'flag-only';
  description: string;
  config?: FillMissingConfig | RemoveOutliersConfig | FlagOnlyConfig;
  applied: boolean;
}
*/

export interface TransformationAudit {
  step: number;
  type: string;
  description: string;
  rowsBefore: number;
  rowsAfter: number;
  rowsAffected: number;
  beforeSample: any[];
  afterSample: any[];
  timestamp: Date;
}

export interface TransformationResult {
  cleanedData: any[];
  transformationsApplied: string[];
  qualityImprovement: number; // Score before → after
  auditLog: TransformationAudit[];
}

export function generateSuggestedFixes(report: QualityReport, data: any[]): Transformation[] {
  const suggestions: Transformation[] = [];

  // Check for duplicates
  const duplicateIssue = report.issues.find(i => i.type === 'duplicates');
  if (duplicateIssue) {
    suggestions.push({
      id: 'remove-duplicates',
      type: 'remove-duplicates',
      description: `Remove ${duplicateIssue.count.toLocaleString()} duplicate rows`,
      applied: false
    });
  }

  // Check for missing values in each column
  const missingIssues = report.issues.filter(i => i.type === 'missing_values');
  missingIssues.forEach(issue => {
    // Sample the column to detect its type
    const columnValues = data
      .map(row => row[issue.column])
      .filter(val => {
        if (val === null || val === undefined || val === '') return false;
        if (typeof val === 'string') {
          const normalized = val.trim().toLowerCase();
          if (
            normalized === 'n/a' ||
            normalized === 'na' ||
            normalized === 'null' ||
            normalized === 'none' ||
            normalized === '#n/a'
          )
            return false;
        }
        return true;
      });

    // Detect if column is numeric by checking if non-missing values are all numbers
    const isNumeric =
      columnValues.length > 0 &&
      columnValues.every(val => typeof val === 'number' && !isNaN(val));

    // ALSO check original data to see if this column SHOULD be numeric
    // even if it has string variants of nulls like "N/A"
    const allDataForColumn = data.map(row => row[issue.column]);
    const hasNumericValues = allDataForColumn.some(val => typeof val === 'number' && !isNaN(val));
    const hasOnlyMissingStrings = allDataForColumn
      .filter(val => typeof val === 'string')
      .every(val => {
        const normalized = val.trim().toLowerCase();
        return normalized === 'n/a' || normalized === 'na' || normalized === 'null' || 
               normalized === 'none' || normalized === '#n/a' || normalized === '';
      });

    // If column has ANY numeric values and non-numeric values are only missing-value strings,
    // treat it as numeric
    const shouldTreatAsNumeric = isNumeric || (hasNumericValues && hasOnlyMissingStrings);

    if (shouldTreatAsNumeric) {
      // Numeric columns - safe to auto-fill with median
      const strategy: FillStrategy = issue.percentage > 80 ? 'remove-rows' : 'median';
      const label = issue.percentage > 80 ? 'remove rows (>80% missing)' : 'median';

      suggestions.push({
        id: `fill-missing-${issue.column}`,
        type: 'fill-missing',
        description: `Fill missing values in '${issue.column}' (${issue.percentage.toFixed(1)}% missing) with ${label}`,
        config: {
          column: issue.column,
          strategy,
        },
        applied: false
      });
    } else {
      // Text/identifier columns - flag but don't auto-fill
      // Create a suggestion but DO NOT auto-apply it
      suggestions.push({
        id: `flag-missing-${issue.column}`,
        type: 'flag-only', // New type for issues we detect but don't auto-fix
        description: `⚠️ ${issue.percentage.toFixed(1)}% missing values in '${issue.column}' - Manual review recommended (identifiers cannot be auto-filled)`,
        config: {
          column: issue.column,
          issueType: 'missing_values',
          count: issue.count
        },
        applied: false // Never auto-checked
      });
    }

    console.log(`🔍 Column '${issue.column}' analysis:`, {
      isNumeric,
      hasNumericValues,
      hasOnlyMissingStrings,
      shouldTreatAsNumeric,
      willAutoFill: shouldTreatAsNumeric,
      sampleValues: columnValues.slice(0, 3)
    });
  });

  // Check for outliers in each column
  const outlierIssues = report.issues.filter(i => i.type === 'outliers');
  outlierIssues.forEach(issue => {
    suggestions.push({
      id: `remove-outliers-${issue.column}`,
      type: 'remove-outliers',
      description: `Remove ${issue.count.toLocaleString()} outliers in '${issue.column}' (${issue.percentage.toFixed(1)}% of values)`,
      config: {
        column: issue.column,
        method: 'iqr',
        threshold: 1.5
      } as RemoveOutliersConfig,
      applied: false
    });
  });

  return suggestions;
}

export function applyTransformation(
  data: any[],
  transformation: Transformation
): any[] {
  switch (transformation.type) {
    case 'remove-duplicates':
      return removeDuplicates(data);
      
    case 'fill-missing':
      return fillMissingValues(data, transformation.config);
      
    case 'remove-outliers':
      return removeOutliers(data, transformation.config);

    case 'flag-only':
      // Flag-only transformations don't modify data
      // They're just informational
      console.log('ℹ️ Flag-only issue - no transformation applied:', transformation.description);
      return data;
      
    default:
      return data;
  }
}

export function applyTransformations(
  data: any[],
  transformations: Transformation[]
): TransformationResult {
  let cleanedData = [...data];
  const applied: string[] = [];
  const auditLog: TransformationAudit[] = [];

  // Start logging
  console.clear(); // Clear previous logs
  console.log(
    '%c🔧 TRANSFORMATION PIPELINE STARTING',
    'color: #0078D4; font-size: 16px; font-weight: bold'
  );
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #0078D4');
  console.log('📊 Initial state:');
  console.log('   • Total rows:', data.length);
  console.log('   • Total columns:', Object.keys(data[0] || {}).length);
  console.log('   • Transformations queued:', transformations.filter(t => t.applied).length);
  console.log('');

  const activeTransformations = transformations.filter(t => t.applied);

  activeTransformations.forEach((transformation, index) => {
    const stepNumber = index + 1;
    const beforeCount = cleanedData.length;

    // Capture before state
    const beforeSample = cleanedData.slice(0, 3).map(row => ({ ...row }));

    // Log step header
    console.log(
      `%c📍 STEP ${stepNumber}/${activeTransformations.length}: ${transformation.type.toUpperCase()}`,
      'color: #FF8C00; font-weight: bold; font-size: 14px'
    );
    console.log('   Description:', transformation.description);
    console.log('   Rows before:', beforeCount.toLocaleString());

    if ('config' in transformation) {
      console.log('   Config:', transformation.config);
    }

    // Apply the transformation
    const startTime = performance.now();
    cleanedData = applyTransformation(cleanedData, transformation);
    const endTime = performance.now();

    const afterCount = cleanedData.length;
    const rowsAffected = beforeCount - afterCount;
    const afterSample = cleanedData.slice(0, 3).map(row => ({ ...row }));

    // Log results
    console.log('   Rows after:', afterCount.toLocaleString());

    if (rowsAffected > 0) {
      console.log(
        `   %c✂️  Rows removed: ${rowsAffected.toLocaleString()}`,
        'color: #D13438; font-weight: bold'
      );
    } else if (rowsAffected < 0) {
      console.log(
        `   %c➕ Rows added: ${Math.abs(rowsAffected).toLocaleString()}`,
        'color: #107C10'
      );
    } else {
      console.log(`   %c🔄 Rows modified (count unchanged)`, 'color: #0078D4');
    }

    console.log(`   ⏱️  Time: ${(endTime - startTime).toFixed(2)}ms`);

    // Show sample data comparison
    console.log('   Before sample (first 3 rows):');
    console.table(beforeSample);
    console.log('   After sample (first 3 rows):');
    console.table(afterSample);
    console.log('');

    applied.push(transformation.description);

    // Build audit trail
    auditLog.push({
      step: stepNumber,
      type: transformation.type,
      description: transformation.description,
      rowsBefore: beforeCount,
      rowsAfter: afterCount,
      rowsAffected: rowsAffected,
      beforeSample,
      afterSample,
      timestamp: new Date()
    });
  });

  // Final summary
  const totalRowsRemoved = data.length - cleanedData.length;
  const percentageRemoved = ((totalRowsRemoved / data.length) * 100).toFixed(1);

  console.log('%c✅ TRANSFORMATION COMPLETE', 'color: #107C10; font-size: 16px; font-weight: bold');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #107C10');
  console.log('📊 Final state:');
  console.log('   • Starting rows:', data.length.toLocaleString());
  console.log('   • Final rows:', cleanedData.length.toLocaleString());
  console.log(`   • Total removed: ${totalRowsRemoved.toLocaleString()} (${percentageRemoved}%)`);
  console.log('   • Transformations applied:', applied.length);
  console.log('');
  console.log('📋 Audit log available in result.auditLog');
  console.log('');

  return {
    cleanedData,
    transformationsApplied: applied,
    qualityImprovement: 0, // Will calculate after
    auditLog
  };
}
