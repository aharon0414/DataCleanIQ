/**
 * Transformation Engine - Orchestrates data cleaning transformations
 */

import type { QualityReport } from '@/types/quality';
import { removeDuplicates } from './cleaners/remove-duplicates';
import { fillMissingValues, type FillMissingConfig } from './cleaners/fill-missing';
import { removeOutliers, type RemoveOutliersConfig } from './cleaners/remove-outliers';

export interface Transformation {
  id: string;
  type: 'remove-duplicates' | 'fill-missing' | 'remove-outliers';
  description: string;
  config?: FillMissingConfig | RemoveOutliersConfig;
  applied: boolean;
}

export interface TransformationResult {
  cleanedData: any[];
  transformationsApplied: string[];
  qualityImprovement: number; // Score before → after
}

export function generateSuggestedFixes(report: QualityReport): Transformation[] {
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
    // Determine best strategy based on percentage
    const strategy = issue.percentage > 50 ? 'remove-rows' : 'median';
    
    suggestions.push({
      id: `fill-missing-${issue.column}`,
      type: 'fill-missing',
      description: `Fill missing values in '${issue.column}' (${issue.percentage.toFixed(1)}% missing, ${issue.count.toLocaleString()} values)`,
      config: {
        column: issue.column,
        strategy,
      } as FillMissingConfig,
      applied: false
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
      return fillMissingValues(data, transformation.config as FillMissingConfig);
      
    case 'remove-outliers':
      return removeOutliers(data, transformation.config as RemoveOutliersConfig);
      
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

  transformations
    .filter(t => t.applied)
    .forEach(transformation => {
      cleanedData = applyTransformation(cleanedData, transformation);
      applied.push(transformation.description);
    });

  return {
    cleanedData,
    transformationsApplied: applied,
    qualityImprovement: 0 // Will calculate after
  };
}
