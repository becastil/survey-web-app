'use client';

interface BarChartProps {
  data?: any[];
  title?: string;
}

export default function BarChart({ data, title }: BarChartProps) {
  return (
    <div className="p-4 border rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-4">{title || 'Bar Chart'}</h3>
      <div className="h-64 flex items-center justify-center text-gray-500">
        Bar chart visualization
      </div>
    </div>
  );
}