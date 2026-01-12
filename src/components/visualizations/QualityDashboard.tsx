import {
  RadialBarChart,
  RadialBar,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import type { QualityReport } from '@/types/quality';

interface QualityDashboardProps {
  report: QualityReport;
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

export function QualityDashboard({ report }: QualityDashboardProps) {
  // Prepare data for Overall Score Gauge
  const gaugeData = [
    {
      name: 'Score',
      value: report.overallScore,
      fill: getRatingColor(report.rating),
    },
    {
      name: 'Remaining',
      value: 100 - report.overallScore,
      fill: '#E5E7EB',
    },
  ];

  // Prepare data for Column Scores Bar Chart (sorted by score, lowest first)
  const columnScoresData = [...report.columnScores]
    .sort((a, b) => a.score - b.score)
    .map((col) => ({
      column: col.column,
      score: col.score,
      rating: col.rating,
      fill: getRatingColor(col.rating),
    }));

  // Prepare data for Issue Distribution Donut Chart
  const issueTypeData = Object.entries(report.summary.issuesByType)
    .filter(([_, count]) => count > 0)
    .map(([type, count]) => ({
      name: type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      value: count,
      fill: type === 'missing_values' ? '#3B82F6' : 
            type === 'outliers' ? '#EF4444' : 
            type === 'duplicates' ? '#F59E0B' : 
            type === 'type_inconsistency' ? '#8B5CF6' : 
            type === 'format_issues' ? '#10B981' : '#6B7280',
    }));

  // Prepare data for Issue Severity Breakdown
  const severityData = [
    {
      name: 'Critical',
      value: report.issues.filter((i) => i.severity === 'critical').length,
      fill: COLORS.critical,
    },
    {
      name: 'High',
      value: report.issues.filter((i) => i.severity === 'high').length,
      fill: COLORS.poor,
    },
    {
      name: 'Medium',
      value: report.issues.filter((i) => i.severity === 'medium').length,
      fill: COLORS.fair,
    },
    {
      name: 'Low',
      value: report.issues.filter((i) => i.severity === 'low').length,
      fill: '#3B82F6',
    },
  ].filter((item) => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold">{payload[0].name || payload[0].payload.name}</p>
          <p className="text-sm text-gray-600">
            {payload[0].name === 'Score' ? 'Score' : payload[0].name}: {payload[0].value}
            {payload[0].name !== 'Score' && payload[0].name !== 'Remaining' && ' issues'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Overall Score Gauge */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Quality Score</h3>
        <div className="relative">
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="90%"
              data={gaugeData}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar dataKey="value" cornerRadius={10} />
              <Tooltip content={<CustomTooltip />} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-4xl font-bold" style={{ color: getRatingColor(report.rating) }}>
              {report.overallScore}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {report.rating.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Column Scores Bar Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Column Quality Scores</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={columnScoresData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis type="number" domain={[0, 100]} />
            <YAxis dataKey="column" type="category" width={100} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                      <p className="font-semibold">{data.column}</p>
                      <p className="text-sm text-gray-600">Score: {Math.round(data.score)}</p>
                      <p className="text-sm text-gray-600">Rating: {data.rating}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="score" radius={[0, 4, 4, 0]}>
              {columnScoresData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Issue Distribution Donut Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Distribution by Type</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={issueTypeData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={80}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
            >
              {issueTypeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Issue Severity Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Severity Breakdown</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={severityData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {severityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
