import { useState } from 'react';
import { FileUpload, FileMetadata } from './components/FileUpload';
import { FileText, Calendar, Database, HardDrive } from 'lucide-react';
import type { QualityReport } from './types/quality';

function App() {
  const [data, setData] = useState<any[]>([]);
  const [report, setReport] = useState<QualityReport | null>(null);
  const [metadata, setMetadata] = useState<FileMetadata | null>(null);

  const handleAnalysisComplete = (parsedData: any[], qualityReport: QualityReport, fileMetadata: FileMetadata) => {
    setData(parsedData);
    setReport(qualityReport);
    setMetadata(fileMetadata);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">DataCleanIQ</h1>
          <p className="mt-2 text-lg text-gray-600">
            AI-powered data quality analysis and cleaning
          </p>
        </header>

        {/* File Upload */}
        {!report && (
          <FileUpload onAnalysisComplete={handleAnalysisComplete} />
        )}

        {/* Results */}
        {report && metadata && (
          <div className="space-y-6">
            {/* Dataset Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{metadata.filename}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                      <HardDrive className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">File Size</div>
                        <div className="text-lg font-semibold text-gray-900">{formatFileSize(metadata.fileSize)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Database className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Dimensions</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {metadata.rowCount.toLocaleString()} rows × {metadata.columnCount} columns
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Uploaded</div>
                        <div className="text-lg font-semibold text-gray-900">{formatDate(metadata.uploadedAt)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Overall Score */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold mb-4">Quality Score</h2>
              <div className="flex items-center gap-4">
                <div className={`text-6xl font-bold ${
                  report.rating === 'excellent' ? 'text-green-600' :
                  report.rating === 'good' ? 'text-green-500' :
                  report.rating === 'fair' ? 'text-yellow-500' :
                  report.rating === 'poor' ? 'text-orange-500' :
                  'text-red-600'
                }`}>
                  {report.overallScore}
                </div>
                <div>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    report.rating === 'excellent' ? 'bg-green-100 text-green-800' :
                    report.rating === 'good' ? 'bg-green-50 text-green-700' :
                    report.rating === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                    report.rating === 'poor' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {report.rating.toUpperCase()}
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {report.issues.length} issue{report.issues.length !== 1 ? 's' : ''} detected
                  </p>
                </div>
              </div>
            </div>

            {/* Issues List */}
            {report.issues.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-semibold mb-4">Detected Issues</h2>
                <div className="space-y-3">
                  {report.issues.map((issue, idx) => (
                    <div key={idx} className="border-l-4 border-yellow-400 pl-4 py-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium px-2 py-1 rounded ${
                          issue.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          issue.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {issue.severity}
                        </span>
                        <span className="text-sm text-gray-600">{issue.type.replace('_', ' ')}</span>
                      </div>
                      <p className="mt-1 text-gray-900">{issue.description}</p>
                      <p className="text-sm text-gray-600">Column: {issue.column}</p>
                      {issue.suggestion && (
                        <p className="mt-1 text-sm text-gray-500 italic">{issue.suggestion}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Data Preview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold mb-4">Data Preview</h2>
              <p className="text-sm text-gray-600 mb-4">
                Showing first 10 rows of {data.length} total
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(data[0] || {}).map(col => (
                        <th key={col} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.slice(0, 10).map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).map((val: any, i) => (
                          <td key={i} className="px-4 py-2 text-sm text-gray-900">
                            {val === null || val === undefined ? (
                              <span className="text-gray-400 italic">null</span>
                            ) : (
                              String(val)
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                setData([]);
                setReport(null);
                setMetadata(null);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Upload Another File
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
