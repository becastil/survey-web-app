'use client';

export default function RegionalDistributionDonut() {
  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-semibold mb-2">Regional Distribution</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>So Cal</span>
          <span className="font-semibold">45%</span>
        </div>
        <div className="flex justify-between">
          <span>SF Bay Area</span>
          <span className="font-semibold">20%</span>
        </div>
        <div className="flex justify-between">
          <span>Rural</span>
          <span className="font-semibold">18%</span>
        </div>
        <div className="flex justify-between">
          <span>Sacramento</span>
          <span className="font-semibold">10%</span>
        </div>
        <div className="flex justify-between">
          <span>San Diego</span>
          <span className="font-semibold">8%</span>
        </div>
      </div>
    </div>
  );
}