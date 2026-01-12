import { CheckCircle2, Circle, Eye, Download } from 'lucide-react';
import type { Transformation } from '@/lib/transformations/transformation-engine';

interface SuggestedFixesProps {
  suggestions: Transformation[];
  onToggle: (id: string) => void;
  onPreview: (id: string) => void;
  onSelectAll: () => void;
  onApplyAll: () => void;
  onExport: () => void;
  hasAppliedFixes: boolean;
}

export function SuggestedFixes({ 
  suggestions, 
  onToggle, 
  onPreview, 
  onSelectAll,
  onApplyAll,
  onExport,
  hasAppliedFixes 
}: SuggestedFixesProps) {
  const selectedCount = suggestions.filter(s => s.applied).length;
  const allSelected = suggestions.length > 0 && suggestions.every(s => s.applied);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-900">Suggested Fixes</h2>
        <div className="flex gap-2">
          <button
            onClick={onSelectAll}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>
          <button
            onClick={onApplyAll}
            disabled={selectedCount === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Apply Selected Fixes ({selectedCount})
          </button>
          {hasAppliedFixes && (
            <button
              onClick={onExport}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Cleaned Data
            </button>
          )}
        </div>
      </div>

      {suggestions.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No issues detected. Your data is clean! 🎉
        </p>
      ) : (
        <div className="space-y-3">
          {suggestions.map(suggestion => (
            <div
              key={suggestion.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => onToggle(suggestion.id)}
                    className="flex-shrink-0"
                    aria-label={suggestion.applied ? 'Deselect fix' : 'Select fix'}
                  >
                    {suggestion.applied ? (
                      <CheckCircle2 className="w-6 h-6 text-blue-600" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-300" />
                    )}
                  </button>
                  <div>
                    <p className="font-medium text-gray-900">
                      {suggestion.description}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Type: {suggestion.type.replace(/-/g, ' ')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onPreview(suggestion.id)}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-100 transition-colors flex items-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
