'use client';

interface LineChartProps {
  data?: any[];
  title?: string;
}

export default function LineChart({ data, title }: LineChartProps) {
  return (
    <div className="p-4 border rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-4">{title || 'Line Chart'}</h3>
      <div className="h-64 flex items-center justify-center text-gray-500">
        Line chart visualization
      </div>
    </div>
  );
}