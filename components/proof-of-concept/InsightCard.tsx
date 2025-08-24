'use client';

interface InsightCardProps {
  title: string;
  description: string;
  type: 'critical' | 'warning' | 'positive' | 'info';
  value?: string;
}

export default function InsightCard({ title, description, type, value }: InsightCardProps) {
  const bgColor = {
    critical: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    positive: 'bg-green-50 border-green-200',
    info: 'bg-blue-50 border-blue-200'
  }[type];

  return (
    <div className={`p-4 border rounded-lg ${bgColor}`}>
      <h3 className="font-semibold text-sm mb-1">{title}</h3>
      {value && <p className="text-2xl font-bold mb-2">{value}</p>}
      <p className="text-sm text-gray-700">{description}</p>
    </div>
  );
}