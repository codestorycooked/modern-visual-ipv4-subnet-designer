import React from 'react';
import { IPv4Subnet, SubnetDivisionMethod } from '../types';
import { ChevronRight, Divide, Zap, Hash, Network } from 'lucide-react';

interface SubnetNodeProps {
  subnet: IPv4Subnet;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDivideSubnet: (parentId: string, method: SubnetDivisionMethod, value: number | string) => void;
}

const SubnetNode: React.FC<SubnetNodeProps> = ({ subnet, isSelected, onSelect, onDivideSubnet }) => {
  const depthClass = `ml-${subnet.depth * 4}`; // Indent based on depth
  const bgColor = subnet.children.length > 0 ? 'bg-gradient-to-r from-surface to-surface/80' : 'bg-gradient-to-r from-background to-background/80';
  const borderColor = isSelected ? 'border-primary ring-2 ring-primary shadow-primary/20' : 'border-border hover:border-primary/50';
  const textColor = subnet.children.length > 0 ? 'text-text' : 'text-textSecondary';

  const handleQuickDivide = (e: React.MouseEvent, method: SubnetDivisionMethod, value: number | string) => {
    e.stopPropagation();
    onDivideSubnet(subnet.id, method, value);
  };

  return (
    <div
      className={`group flex flex-col items-start cursor-pointer transition-all duration-300 ease-in-out ${isSelected ? 'scale-[1.02] shadow-xl' : 'hover:scale-[1.01]'} ${depthClass}`}
      onClick={() => onSelect(subnet.id)}
    >
      <div
        className={`flex items-center justify-between w-full p-5 rounded-xl shadow-lg ${bgColor} ${borderColor} transition-all duration-300`}
      >
        <div className="flex items-center flex-1">
          {subnet.children.length > 0 && (
            <ChevronRight className="w-5 h-5 text-primary mr-3 transform group-hover:rotate-90 transition-transform duration-300" />
          )}
          <div className="flex flex-col">
            <span className={`font-mono text-xl font-bold ${textColor} ${isSelected ? 'text-primary' : ''}`}>
              {subnet.cidr}
            </span>
            <span className="text-xs text-textSecondary font-medium">
              {subnet.totalIps.toLocaleString()} IPs • {subnet.usableHosts.toLocaleString()} usable
            </span>
          </div>
        </div>

        {/* Prominent divide actions */}
        {subnet.children.length === 0 && (
          <div className="flex items-center space-x-2 ml-4">
            <div className="flex space-x-1">
              <button
                onClick={(e) => handleQuickDivide(e, 'mask', subnet.prefix + 1)}
                className="p-2 bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary/80 rounded-lg transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
                title="Split into 2 equal subnets"
              >
                <Hash className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => handleQuickDivide(e, 'numSubnets', 4)}
                className="p-2 bg-secondary/10 hover:bg-secondary/20 text-secondary hover:text-secondary/80 rounded-lg transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
                title="Create 4 equal subnets"
              >
                <Network className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => handleQuickDivide(e, 'numHosts', 30)}
                className="p-2 bg-accent/10 hover:bg-accent/20 text-accent hover:text-accent/80 rounded-lg transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
                title="Create subnets with 30 hosts each"
              >
                <Zap className="w-4 h-4" />
              </button>
            </div>
            <div className="w-px h-8 bg-border mx-2"></div>
            <button
              onClick={(e) => handleQuickDivide(e, 'mask', subnet.prefix + 1)}
              className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg flex items-center"
              title="Quick divide into 2 subnets"
            >
              <Divide className="w-4 h-4 mr-2" />
              Divide
            </button>
          </div>
        )}

        {/* Visual indicator for divided subnets */}
        {subnet.children.length > 0 && (
          <div className="ml-4 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
            {subnet.children.length} subnets
          </div>
        )}
      </div>

      {subnet.children.length > 0 && (
        <div className="mt-4 w-full space-y-4">
          {subnet.children.map(child => (
            <SubnetNode
              key={child.id}
              subnet={child}
              isSelected={false} // Children are not selected by default
              onSelect={onSelect}
              onDivideSubnet={onDivideSubnet}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface SubnetVisualizerProps {
  subnets: IPv4Subnet[];
  selectedSubnetId: string | null;
  onSelectSubnet: (id: string) => void;
  onDivideSubnet: (parentId: string, method: SubnetDivisionMethod, value: number | string) => void;
}

const SubnetVisualizer: React.FC<SubnetVisualizerProps> = ({ subnets, selectedSubnetId, onSelectSubnet, onDivideSubnet }) => {
  if (subnets.length === 0) {
    return (
      <div className="p-8 bg-gradient-to-br from-surface to-surface/95 rounded-2xl shadow-2xl border border-border/50 backdrop-blur-sm text-center">
        <Network className="w-16 h-16 text-textSecondary/50 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-textSecondary mb-2">No Networks Yet</h3>
        <p className="text-textSecondary">Enter a CIDR address above to start building your network hierarchy!</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-surface to-surface/95 rounded-2xl shadow-2xl border border-border/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text flex items-center">
          <Network className="w-6 h-6 text-primary mr-3" />
          Network Hierarchy
        </h2>
        <div className="text-sm text-textSecondary bg-background/50 px-3 py-1 rounded-full">
          {subnets.length} root {subnets.length === 1 ? 'network' : 'networks'}
        </div>
      </div>
      <div className="max-h-[500px] overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        {subnets.map(subnet => (
          <SubnetNode
            key={subnet.id}
            subnet={subnet}
            isSelected={subnet.id === selectedSubnetId}
            onSelect={onSelectSubnet}
            onDivideSubnet={onDivideSubnet}
          />
        ))}
      </div>
    </div>
  );
};

export default SubnetVisualizer;
