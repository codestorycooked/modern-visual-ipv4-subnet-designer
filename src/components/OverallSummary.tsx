import React from 'react';
import { Gauge, PieChart, HardDrive, Percent } from 'lucide-react';

interface OverallSummaryProps {
  initialCidr: string;
  totalIps: number;
  allocatedIps: number;
  usableHosts: number;
  remainingSpace: string[];
  allocationPercentage: number;
}

const OverallSummary: React.FC<OverallSummaryProps> = ({
  initialCidr,
  totalIps,
  allocatedIps,
  usableHosts,
  remainingSpace,
  allocationPercentage,
}) => {
  return (
    <div className="p-6 bg-surface rounded-xl shadow-md border border-border">
      <h2 className="text-xl font-semibold text-text mb-4 flex items-center">
        <Gauge className="w-5 h-5 text-secondary mr-2" />
        Overall Network Summary
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SummaryItem icon={<HardDrive />} label="Initial Network" value={initialCidr} />
        <SummaryItem icon={<PieChart />} label="Total IPs in Initial Network" value={totalIps.toLocaleString()} />
        <SummaryItem icon={<HardDrive />} label="Allocated IPs" value={allocatedIps.toLocaleString()} />
        <SummaryItem icon={<Gauge />} label="Total Usable Hosts" value={usableHosts.toLocaleString()} />
        <SummaryItem icon={<Percent />} label="Allocation Percentage" value={`${allocationPercentage}%`} />
      </div>

      {remainingSpace.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="text-lg font-semibold text-text mb-3">Remaining Unallocated Space:</h3>
          <ul className="list-disc list-inside text-textSecondary space-y-1">
            {remainingSpace.map((cidr, index) => (
              <li key={index} className="font-mono">{cidr}</li>
            ))}
          </ul>
        </div>
      )}
      {remainingSpace.length === 0 && allocatedIps > 0 && (
        <div className="mt-6 pt-6 border-t border-border text-textSecondary text-center">
          All IP space has been allocated!
        </div>
      )}
    </div>
  );
};

interface SummaryItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const SummaryItem: React.FC<SummaryItemProps> = ({ icon, label, value }) => (
  <div className="flex items-center bg-background p-3 rounded-md border border-border">
    <div className="text-textSecondary mr-3">{icon}</div>
    <div>
      <p className="text-sm font-medium text-textSecondary">{label}</p>
      <p className="font-mono text-text text-base">{value}</p>
    </div>
  </div>
);

export default OverallSummary;
