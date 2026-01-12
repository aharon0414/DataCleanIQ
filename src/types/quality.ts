/**
 * Data Quality Type Definitions
 */

export type IssueType =
  | 'missing_values'
  | 'duplicates'
  | 'outliers'
  | 'type_inconsistency'
  | 'format_issues'
  | 'invalid_values';

export type QualityRating = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

export interface Issue {
  type: IssueType;
  column: string;
  row?: number;
  count: number;
  percentage: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  suggestion?: string;
}

export interface ColumnScore {
  column: string;
  score: number;
  rating: QualityRating;
  missingPercent: number;
  outlierPercent: number;
  typeInconsistencies: number;
  formatIssuePercent: number;
  duplicatePercent: number;
  issues: Issue[];
}

export interface QualitySummary {
  totalRows: number;
  totalColumns: number;
  totalIssues: number;
  issuesByType: Record<IssueType, number>;
  qualityDistribution: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
    critical: number;
  };
}

export interface QualityReport {
  overallScore: number;
  rating: QualityRating;
  columnScores: ColumnScore[];
  issues: Issue[];
  summary: QualitySummary;
  generatedAt: Date;
}