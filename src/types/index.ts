export interface IPv4Subnet {
  id: string;
  cidr: string;
  ipAddress: string;
  prefix: number;
  networkAddress: string;
  broadcastAddress: string;
  subnetMask: string; // Dotted decimal
  firstUsableHost: string;
  lastUsableHost: string;
  totalIps: number;
  usableHosts: number;
  parentCidr?: string;
  children: IPv4Subnet[];
  depth: number;
}

export type SubnetDivisionMethod = 'mask' | 'numSubnets' | 'numHosts';
