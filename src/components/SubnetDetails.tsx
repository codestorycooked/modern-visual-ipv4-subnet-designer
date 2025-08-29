import React from 'react';
import { IPv4Subnet, SubnetDivisionMethod } from '../types';
import {
  Info,
  Network,
  Radio,
  SquareStack, // Changed from Mask to SquareStack to resolve SyntaxError
  Server,
  Divide,
  Hash,
  Zap,
  Globe,
  MinusCircle,
  PlusCircle
} from 'lucide-react';

interface SubnetDetailsProps {
  subnet: IPv4Subnet;
  onDivideSubnet: (parentId: string, method: SubnetDivisionMethod, value: number | string) => void;
  error: string | null;
  clearError: () => void;
}

const SubnetDetails: React.FC<SubnetDetailsProps> = ({ subnet, onDivideSubnet, error, clearError }) => {
  const [divisionMethod, setDivisionMethod] = React.useState<SubnetDivisionMethod>('mask');
  const [divisionValue, setDivisionValue] = React.useState<string>('');

  const handleDivide = (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    let value: number | string = divisionValue;
    if (divisionMethod === 'mask') {
      value = parseInt(divisionValue.replace('/', ''), 10);
    } else {
      value = parseInt(divisionValue, 10);
    }
    onDivideSubnet(subnet.id, divisionMethod, value);
    setDivisionValue(''); // Clear input after division
  };

  const isDivisible = subnet.children.length === 0;

  return (
    <div className="p-6 bg-surface rounded-xl shadow-md border border-border">
      <h2 className="text-xl font-semibold text-text mb-4 flex items-center">
        <Info className="w-5 h-5 text-primary mr-2" />
        Subnet Details: <span className="font-mono text-secondary ml-2">{subnet.cidr}</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <DetailItem icon={<Globe />} label="IP Address" value={subnet.ipAddress} />
        <DetailItem icon={<Hash />} label="Prefix" value={`/${subnet.prefix}`} />
        <DetailItem icon={<Network />} label="Network Address" value={subnet.networkAddress} />
        <DetailItem icon={<Radio />} label="Broadcast Address" value={subnet.broadcastAddress} />
        <DetailItem icon={<SquareStack />} label="Subnet Mask" value={subnet.subnetMask} /> {/* Using SquareStack icon */}
        <DetailItem icon={<Server />} label="Total IPs" value={subnet.totalIps.toLocaleString()} />
        <DetailItem icon={<Zap />} label="Usable Hosts" value={subnet.usableHosts.toLocaleString()} />
        {subnet.usableHosts > 0 && (
          <>
            <DetailItem icon={<PlusCircle />} label="First Usable Host" value={subnet.firstUsableHost} />
            <DetailItem icon={<MinusCircle />} label="Last Usable Host" value={subnet.lastUsableHost} />
          </>
        )}
      </div>

      {isDivisible && (
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="text-lg font-semibold text-text mb-3 flex items-center">
            <Divide className="w-5 h-5 text-accent mr-2" />
            Divide Subnet
          </h3>
          <form onSubmit={handleDivide} className="space-y-4">
            <div>
              <label htmlFor="division-method" className="block text-sm font-medium text-textSecondary mb-1">
                Division Method
              </label>
              <select
                id="division-method"
                value={divisionMethod}
                onChange={(e) => {
                  setDivisionMethod(e.target.value as SubnetDivisionMethod);
                  setDivisionValue(''); // Clear value when method changes
                  clearError();
                }}
                className="w-full p-3 bg-background text-text border border-border rounded-md focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all duration-200"
              >
                <option value="mask">By New Prefix (/mask)</option>
                <option value="numSubnets">By Number of Subnets</option>
                <option value="numHosts">By Number of Usable Hosts</option>
              </select>
            </div>
            <div>
              <label htmlFor="division-value" className="block text-sm font-medium text-textSecondary mb-1">
                {divisionMethod === 'mask' && 'New Prefix (e.g., 26 for /26)'}
                {divisionMethod === 'numSubnets' && 'Number of Subnets (e.g., 4)'}
                {divisionMethod === 'numHosts' && 'Number of Usable Hosts (e.g., 30)'}
              </label>
              <input
                id="division-value"
                type="number"
                value={divisionValue}
                onChange={(e) => setDivisionValue(e.target.value)}
                placeholder={
                  divisionMethod === 'mask' ? 'e.g., 26' :
                  divisionMethod === 'numSubnets' ? 'e.g., 4' :
                  'e.g., 30'
                }
                className={`w-full p-3 bg-background text-text border ${error ? 'border-error' : 'border-border'} rounded-md focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all duration-200`}
                aria-invalid={error ? "true" : "false"}
                aria-describedby={error ? "division-error" : undefined}
              />
              {error && (
                <p id="division-error" className="mt-2 text-sm text-error">
                  {error}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-accent text-white py-3 px-4 rounded-md font-medium hover:bg-accent/90 transition-colors duration-200 shadow-md"
            >
              Divide Subnet
            </button>
          </form>
        </div>
      )}

      {!isDivisible && (
        <div className="mt-6 pt-6 border-t border-border text-textSecondary text-center">
          This subnet has already been divided.
        </div>
      )}
    </div>
  );
};

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon, label, value }) => (
  <div className="flex items-center bg-background p-3 rounded-md border border-border">
    <div className="text-textSecondary mr-3">{icon}</div>
    <div>
      <p className="text-sm font-medium text-textSecondary">{label}</p>
      <p className="font-mono text-text text-base">{value}</p>
    </div>
  </div>
);

export default SubnetDetails;
