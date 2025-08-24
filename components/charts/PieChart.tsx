'use client';

interface PieChartProps {
  data?: any[];
  title?: string;
}

export default function PieChart({ data, title }: PieChartProps) {
  return (
    <div className="p-4 border rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-4">{title || 'Pie Chart'}</h3>
      <div className="h-64 flex items-center justify-center text-gray-500">
        Pie chart visualization
      </div>
    </div>
  );
}