/**
 * Data Model Type Definitions
 */

export type DataType = 'string' | 'number' | 'boolean' | 'date' | 'null' | 'unknown';

export interface Column {
  name: string;
  type: DataType;
  inferredType: DataType;
  nullable: boolean;
  unique: boolean;
  sampleValues: (string | number | boolean | null)[];
  statistics?: ColumnStatistics;
}

export interface ColumnStatistics {
  // Numeric statistics
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  stdDev?: number;
  quartiles?: {
    q1: number;
    q2: number;
    q3: number;
  };

  // Categorical statistics
  uniqueCount?: number;
  topValues?: Array<{
    value: string | number | boolean;
    count: number;
    percentage: number;
  }>;

  // General statistics
  nullCount: number;
  nullPercentage: number;
  nonNullCount: number;
  totalCount: number;
}

export interface Row {
  index: number;
  data: Record<string, unknown>;
}

export interface Dataset {
  id: string;
  name: string;
  fileName?: string;
  columns: Column[];
  rows: Row[];
  totalRows: number;
  totalColumns: number;
  metadata?: {
    source: 'upload' | 'database' | 'api';
    uploadedAt?: Date;
    fileSize?: number;
    encoding?: string;
    delimiter?: string;
    sheetName?: string; // For Excel files
  };
}

export interface DataPreview {
  columns: string[];
  rows: Record<string, unknown>[];
  totalRows: number;
  showingRows: number;
  hasMore: boolean;
}