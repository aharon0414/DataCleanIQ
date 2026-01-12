import { useCallback, useState } from 'react';
import Papa from 'papaparse';
import { Upload, FileText, Loader2, AlertCircle } from 'lucide-react';
import type { QualityReport } from '@/types/quality';
import { analyzeDataQuality } from '@/lib/analysis/quality-analyzer';

export interface FileMetadata {
  filename: string;
  fileSize: number;
  rowCount: number;
  columnCount: number;
  uploadedAt: Date;
}

interface FileUploadProps {
  onAnalysisComplete: (data: any[], report: QualityReport, metadata: FileMetadata) => void;
}

export function FileUpload({ onAnalysisComplete }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [warning, setWarning] = useState<string>('');

  const handleFile = useCallback((file: File, isMultiple?: boolean) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setUploading(true);
    setFileName(file.name);
    setError('');
    setWarning('');

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[];
        const report = analyzeDataQuality(data);
        
        const metadata: FileMetadata = {
          filename: file.name,
          fileSize: file.size,
          rowCount: data.length,
          columnCount: Object.keys(data[0] || {}).length,
          uploadedAt: new Date(),
        };

        onAnalysisComplete(data, report, metadata);
        setUploading(false);
      },
      error: (err) => {
        setError(`Error parsing file: ${err.message}`);
        setUploading(false);
      }
    });

    if (isMultiple) {
      setWarning(`Multiple files selected. Processing: ${file.name}. Upload files one at a time.`);
    }
  }, [onAnalysisComplete]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      handleFile(file, files.length > 1);
    }
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      handleFile(file, files.length > 1);
    }
  }, [handleFile]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors cursor-pointer"
      >
        <input
          type="file"
          id="file-upload"
          accept=".csv"
          onChange={handleChange}
          className="hidden"
          multiple
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          {uploading ? (
            <Loader2 className="w-12 h-12 mx-auto text-blue-500 animate-spin" />
          ) : (
            <Upload className="w-12 h-12 mx-auto text-gray-400" />
          )}
          <p className="mt-4 text-lg font-medium text-gray-700">
            {uploading ? 'Analyzing...' : 'Click to upload or drag and drop'}
          </p>
          <p className="mt-2 text-sm text-gray-500">CSV files only</p>
          {fileName && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
              <FileText className="w-4 h-4" />
              {fileName}
            </div>
          )}
          {warning && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded p-2">
              <AlertCircle className="w-4 h-4" />
              {warning}
            </div>
          )}
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </label>
      </div>
    </div>
  );
}
