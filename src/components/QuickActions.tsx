import React, { useState } from 'react';
import { IPv4Subnet, SubnetDivisionMethod } from '../types';
import { Divide, Zap, Hash, Network, Settings } from 'lucide-react';

interface QuickActionsProps {
  selectedSubnet: IPv4Subnet | null;
  onDivideSubnet: (parentId: string, method: SubnetDivisionMethod, value: number | string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ selectedSubnet, onDivideSubnet }) => {
  const [customMethod, setCustomMethod] = useState<SubnetDivisionMethod>('mask');
  const [customValue, setCustomValue] = useState<string>('');
  const [showCustom, setShowCustom] = useState(false);

  if (!selectedSubnet || selectedSubnet.children.length > 0) {
    return null;
  }

  const handleQuickDivide = (method: SubnetDivisionMethod, value: number | string) => {
    onDivideSubnet(selectedSubnet.id, method, value);
  };

  const handleCustomDivide = (e: React.FormEvent) => {
    e.preventDefault();
    if (customValue.trim()) {
      let value: number | string = customValue;
      if (customMethod === 'mask') {
        value = parseInt(customValue.replace('/', ''), 10);
      } else {
        value = parseInt(customValue, 10);
      }
      onDivideSubnet(selectedSubnet.id, customMethod, value);
      setCustomValue('');
      setShowCustom(false);
    }
  };

  return (
    <div className="p-6 bg-surface rounded-xl shadow-md border border-border">
      <h3 className="text-lg font-semibold text-text mb-4 flex items-center">
        <Divide className="w-5 h-5 text-accent mr-2" />
        Quick Divide Actions
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <button
          onClick={() => handleQuickDivide('mask', selectedSubnet.prefix + 1)}
          className="p-3 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg transition-colors duration-200 flex flex-col items-center text-center"
        >
          <Hash className="w-5 h-5 text-primary mb-2" />
          <span className="text-sm font-medium text-primary">Split in Half</span>
          <span className="text-xs text-textSecondary">/{selectedSubnet.prefix + 1}</span>
        </button>

        <button
          onClick={() => handleQuickDivide('numSubnets', 4)}
          className="p-3 bg-secondary/10 hover:bg-secondary/20 border border-secondary/20 rounded-lg transition-colors duration-200 flex flex-col items-center text-center"
        >
          <Network className="w-5 h-5 text-secondary mb-2" />
          <span className="text-sm font-medium text-secondary">4 Subnets</span>
          <span className="text-xs text-textSecondary">Equal split</span>
        </button>

        <button
          onClick={() => handleQuickDivide('numHosts', 30)}
          className="p-3 bg-accent/10 hover:bg-accent/20 border border-accent/20 rounded-lg transition-colors duration-200 flex flex-col items-center text-center"
        >
          <Zap className="w-5 h-5 text-accent mb-2" />
          <span className="text-sm font-medium text-accent">30 Hosts</span>
          <span className="text-xs text-textSecondary">Per subnet</span>
        </button>

        <button
          onClick={() => setShowCustom(!showCustom)}
          className="p-3 bg-surface hover:bg-background border border-border rounded-lg transition-colors duration-200 flex flex-col items-center text-center"
        >
          <Settings className="w-5 h-5 text-textSecondary mb-2" />
          <span className="text-sm font-medium text-textSecondary">Custom</span>
          <span className="text-xs text-textSecondary">Advanced</span>
        </button>
      </div>

      {showCustom && (
        <div className="mt-4 pt-4 border-t border-border">
          <form onSubmit={handleCustomDivide} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1">
                  Division Method
                </label>
                <select
                  value={customMethod}
                  onChange={(e) => setCustomMethod(e.target.value as SubnetDivisionMethod)}
                  className="w-full p-2 bg-background text-text border border-border rounded-md focus:ring-2 focus:ring-accent focus:border-transparent outline-none text-sm"
                >
                  <option value="mask">By New Prefix (/mask)</option>
                  <option value="numSubnets">By Number of Subnets</option>
                  <option value="numHosts">By Number of Usable Hosts</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1">
                  {customMethod === 'mask' && 'New Prefix (e.g., 26)'}
                  {customMethod === 'numSubnets' && 'Number of Subnets (e.g., 4)'}
                  {customMethod === 'numHosts' && 'Number of Usable Hosts (e.g., 30)'}
                </label>
                <input
                  type="number"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  placeholder={
                    customMethod === 'mask' ? '26' :
                    customMethod === 'numSubnets' ? '4' :
                    '30'
                  }
                  className="w-full p-2 bg-background text-text border border-border rounded-md focus:ring-2 focus:ring-accent focus:border-transparent outline-none text-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-accent text-white py-2 px-4 rounded-md font-medium hover:bg-accent/90 transition-colors duration-200 text-sm"
            >
              Apply Custom Division
            </button>
          </form>
        </div>
      )}
      <div className="mt-3 text-center">
        <span className="text-xs text-textSecondary">
          Selected: <span className="font-mono text-primary">{selectedSubnet.cidr}</span>
        </span>
      </div>
    </div>
  );
};

export default QuickActions;
