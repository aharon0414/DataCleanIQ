import type { QualityReport, ColumnScore, Issue, QualitySummary, QualityRating } from '@/types/quality';
import { detectMissingValues } from './detectors/missing-values';
import { detectOutliers } from './detectors/outliers';
import { detectDuplicates } from './detectors/duplicates';

export function analyzeDataQuality(data: any[]): QualityReport {
  if (!data.length) {
    return {
      overallScore: 0,
      rating: 'critical',
      columnScores: [],
      issues: [],
      summary: {
        totalRows: 0,
        totalColumns: 0,
        totalIssues: 0,
        issuesByType: {
          missing_values: 0,
          duplicates: 0,
          outliers: 0,
          type_inconsistency: 0,
          format_issues: 0,
          invalid_values: 0,
        },
        qualityDistribution: {
          excellent: 0,
          good: 0,
          fair: 0,
          poor: 0,
          critical: 0,
        },
      },
      generatedAt: new Date(),
    };
  }

  const columns = Object.keys(data[0]);
  const issues: Issue[] = [];
  const columnScores: ColumnScore[] = [];

  // Analyze each column
  columns.forEach(column => {
    const columnIssues: Issue[] = [];
    const missingIssue = detectMissingValues(data, column);
    const outlierIssue = detectOutliers(data, column);

    if (missingIssue) {
      issues.push(missingIssue);
      columnIssues.push(missingIssue);
    }
    if (outlierIssue) {
      issues.push(outlierIssue);
      columnIssues.push(outlierIssue);
    }

    // Calculate column score using algorithm from REQUIREMENTS.md
    const missingPercent = missingIssue?.percentage || 0;
    const outlierPercent = outlierIssue?.percentage || 0;
    
    // Column Score = 100 - (Missing % × 2) - (Outlier % × 1) - etc.
    const score = Math.max(0, 
      100 
      - (missingPercent * 2)
      - (outlierPercent * 1)
    );

    const rating: QualityRating = 
      score >= 90 ? 'excellent' :
      score >= 75 ? 'good' :
      score >= 60 ? 'fair' :
      score >= 40 ? 'poor' : 'critical';

    columnScores.push({
      column,
      score,
      rating,
      missingPercent,
      outlierPercent,
      typeInconsistencies: 0,
      formatIssuePercent: 0,
      duplicatePercent: 0,
      issues: columnIssues,
    });
  });

  // Check for duplicates
  const duplicateIssue = detectDuplicates(data);
  if (duplicateIssue) {
    issues.push(duplicateIssue);
  }

  // Calculate overall score (average of column scores)
  const overallScore = columnScores.length 
    ? Math.round(columnScores.reduce((sum, col) => sum + col.score, 0) / columnScores.length)
    : 0;

  const overallRating: QualityRating = 
    overallScore >= 90 ? 'excellent' :
    overallScore >= 75 ? 'good' :
    overallScore >= 60 ? 'fair' :
    overallScore >= 40 ? 'poor' : 'critical';

  // Calculate summary
  const issuesByType: Record<string, number> = {
    missing_values: 0,
    duplicates: 0,
    outliers: 0,
    type_inconsistency: 0,
    format_issues: 0,
    invalid_values: 0,
  };

  issues.forEach(issue => {
    issuesByType[issue.type] = (issuesByType[issue.type] || 0) + 1;
  });

  const qualityDistribution = {
    excellent: columnScores.filter(c => c.rating === 'excellent').length,
    good: columnScores.filter(c => c.rating === 'good').length,
    fair: columnScores.filter(c => c.rating === 'fair').length,
    poor: columnScores.filter(c => c.rating === 'poor').length,
    critical: columnScores.filter(c => c.rating === 'critical').length,
  };

  const summary: QualitySummary = {
    totalRows: data.length,
    totalColumns: columns.length,
    totalIssues: issues.length,
    issuesByType: issuesByType as any,
    qualityDistribution,
  };

  return {
    overallScore,
    rating: overallRating,
    columnScores,
    issues,
    summary,
    generatedAt: new Date(),
  };
}
