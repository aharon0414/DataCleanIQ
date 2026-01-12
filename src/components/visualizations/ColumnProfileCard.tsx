import type { ColumnScore } from '@/types/quality';

interface ColumnProfileCardProps {
  columnScore: ColumnScore;
}

// Color palette from README
const COLORS = {
  excellent: '#107C10',
  good: '#7FBA00',
  fair: '#FFB900',
  poor: '#FF8C00',
  critical: '#D13438',
};

const getRatingColor = (rating: string): string => {
  return COLORS[rating as keyof typeof COLORS] || COLORS.critical;
};

const getRatingBgColor = (rating: string): string => {
  const bgColors = {
    excellent: 'bg-green-100 text-green-800',
    good: 'bg-green-50 text-green-700',
    fair: 'bg-yellow-100 text-yellow-800',
    poor: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };
  return bgColors[rating as keyof typeof bgColors] || bgColors.critical;
};

export function ColumnProfileCard({ columnScore }: ColumnProfileCardProps) {
  const fillColor = getRatingColor(columnScore.rating);

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
      {/* Column Name */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-bold text-gray-900 truncate">{columnScore.column}</h4>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getRatingBgColor(columnScore.rating)}`}>
          {columnScore.rating}
        </span>
      </div>

      {/* Score Badge */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Quality Score</span>
          <span className="text-2xl font-bold" style={{ color: fillColor }}>
            {Math.round(columnScore.score)}
          </span>
        </div>
        {/* Mini bar showing score visually */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all"
            style={{
              width: `${columnScore.score}%`,
              backgroundColor: fillColor,
            }}
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="space-y-2 text-sm">
        {columnScore.missingPercent > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Missing Values:</span>
            <span className="font-medium text-gray-900">
              {columnScore.missingPercent.toFixed(1)}%
            </span>
          </div>
        )}
        {columnScore.outlierPercent > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Outliers:</span>
            <span className="font-medium text-gray-900">
              {columnScore.outlierPercent.toFixed(1)}%
            </span>
          </div>
        )}
        {columnScore.duplicatePercent > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Duplicates:</span>
            <span className="font-medium text-gray-900">
              {columnScore.duplicatePercent.toFixed(1)}%
            </span>
          </div>
        )}
        {columnScore.typeInconsistencies > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Type Issues:</span>
            <span className="font-medium text-gray-900">
              {columnScore.typeInconsistencies}
            </span>
          </div>
        )}
        {columnScore.formatIssuePercent > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Format Issues:</span>
            <span className="font-medium text-gray-900">
              {columnScore.formatIssuePercent.toFixed(1)}%
            </span>
          </div>
        )}
        {columnScore.issues.length === 0 && (
          <div className="text-center py-2 text-green-600 text-sm font-medium">
            ✓ No issues detected
          </div>
        )}
      </div>
    </div>
  );
}
