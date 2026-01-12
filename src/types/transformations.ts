/**
 * Data Transformation Type Definitions
 */

export type TransformationType =
  | 'fill_missing'
  | 'remove_duplicates'
  | 'filter_rows'
  | 'remove_columns'
  | 'convert_types'
  | 'text_transform'
  | 'numeric_transform'
  | 'rename_columns'
  | 'sort_rows';

export type FillStrategy = 'constant' | 'mean' | 'median' | 'mode' | 'forward_fill' | 'backward_fill';

export type TextTransformOperation = 'trim' | 'uppercase' | 'lowercase' | 'capitalize' | 'regex_replace';

export type NumericTransformOperation = 'round' | 'floor' | 'ceil' | 'abs' | 'scale' | 'normalize';

export type FilterOperator = 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'greater_than_or_equal' | 'less_than_or_equal' | 'contains' | 'not_contains' | 'in' | 'not_in';

export interface FillMissingConfig {
  column: string;
  strategy: FillStrategy;
  value?: string | number; // Required when strategy is 'constant'
}

export interface RemoveDuplicatesConfig {
  columns?: string[]; // If not provided, check all columns
  keep: 'first' | 'last' | 'none';
}

export interface FilterRowsConfig {
  column: string;
  operator: FilterOperator;
  value: string | number | (string | number)[];
  logicalOperator?: 'AND' | 'OR'; // For multiple conditions
  conditions?: FilterRowsConfig[]; // Nested conditions
}

export interface RemoveColumnsConfig {
  columns: string[];
}

export interface ConvertTypesConfig {
  column: string;
  targetType: 'string' | 'number' | 'boolean' | 'date';
  format?: string; // For date conversions
}

export interface TextTransformConfig {
  column: string;
  operation: TextTransformOperation;
  pattern?: string; // For regex_replace
  replacement?: string; // For regex_replace
}

export interface NumericTransformConfig {
  column: string;
  operation: NumericTransformOperation;
  precision?: number; // For round
  scale?: number; // For scale transformation
  min?: number; // For normalize
  max?: number; // For normalize
}

export interface RenameColumnsConfig {
  mappings: Record<string, string>; // oldName -> newName
}

export interface SortRowsConfig {
  columns: Array<{
    column: string;
    direction: 'asc' | 'desc';
  }>;
}

export type TransformationConfig =
  | FillMissingConfig
  | RemoveDuplicatesConfig
  | FilterRowsConfig
  | RemoveColumnsConfig
  | ConvertTypesConfig
  | TextTransformConfig
  | NumericTransformConfig
  | RenameColumnsConfig
  | SortRowsConfig;

export interface CleaningStep {
  id: string;
  type: TransformationType;
  config: TransformationConfig;
  enabled: boolean;
  preview?: {
    affectedRows: number;
    affectedColumns?: string[];
    beforeSample?: Record<string, unknown>[];
    afterSample?: Record<string, unknown>[];
  };
  appliedAt?: Date;
  error?: string;
}

export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  steps: CleaningStep[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PipelineExecutionResult {
  cleanedData: Record<string, unknown>[];
  appliedSteps: string[];
  skippedSteps: string[];
  errors: Array<{
    stepId: string;
    error: string;
  }>;
  executionTime: number; // in milliseconds
}