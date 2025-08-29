import { IPv4Subnet } from '../types';

/**
 * Validates an IPv4 address format.
 * @param ip The IP address string.
 * @returns True if valid, false otherwise.
 */
const isValidIp = (ip: string): boolean => {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  return parts.every(part => {
    const num = parseInt(part, 10);
    return !isNaN(num) && num >= 0 && num <= 255 && String(num) === part;
  });
};

/**
 * Validates a CIDR prefix.
 * @param prefix The prefix number.
 * @returns True if valid, false otherwise.
 */
export const isValidPrefix = (prefix: number): boolean => {
  return prefix >= 0 && prefix <= 32;
};

/**
 * Parses a CIDR string into its IP address and prefix.
 * @param cidr The CIDR string (e.g., "192.168.1.0/24").
 * @returns An object with ip and prefix, or throws an error.
 */
export const parseCidr = (cidr: string): { ip: string; prefix: number } => {
  const parts = cidr.split('/');
  if (parts.length !== 2) {
    throw new Error('Invalid CIDR format. Expected "IP/Prefix".');
  }

  const ip = parts[0];
  const prefix = parseInt(parts[1], 10);

  if (!isValidIp(ip)) {
    throw new Error('Invalid IPv4 address in CIDR.');
  }
  if (!isValidPrefix(prefix)) {
    throw new Error('Invalid CIDR prefix. Must be between 0 and 32.');
  }

  return { ip, prefix };
};

/**
 * Converts an IPv4 address to its 32-bit binary string representation.
 * @param ip The IPv4 address.
 * @returns The 32-bit binary string.
 */
export const ipToBinary = (ip: string): string => {
  return ip.split('.')
    .map(octet => parseInt(octet, 10).toString(2).padStart(8, '0'))
    .join('');
};

/**
 * Converts a 32-bit binary string to an IPv4 address.
 * @param binary The 32-bit binary string.
 * @returns The IPv4 address.
 */
export const binaryToIp = (binary: string): string => {
  const octets = [];
  for (let i = 0; i < 32; i += 8) {
    octets.push(parseInt(binary.substring(i, i + 8), 2));
  }
  return octets.join('.');
};

/**
 * Calculates the network address for a given IP and prefix.
 * @param ip The IP address.
 * @param prefix The CIDR prefix.
 * @returns The network address.
 */
export const calculateNetworkAddress = (ip: string, prefix: number): string => {
  const ipBinary = ipToBinary(ip);
  const networkBinary = ipBinary.substring(0, prefix).padEnd(32, '0');
  return binaryToIp(networkBinary);
};

/**
 * Calculates the broadcast address for a given network address and prefix.
 * @param networkAddress The network address.
 * @param prefix The CIDR prefix.
 * @returns The broadcast address.
 */
export const calculateBroadcastAddress = (networkAddress: string, prefix: number): string => {
  const networkBinary = ipToBinary(networkAddress);
  const broadcastBinary = networkBinary.substring(0, prefix).padEnd(32, '1');
  return binaryToIp(broadcastBinary);
};

/**
 * Calculates the subnet mask in dotted decimal format.
 * @param prefix The CIDR prefix.
 * @returns The subnet mask.
 */
export const calculateSubnetMask = (prefix: number): string => {
  const maskBinary = '1'.repeat(prefix).padEnd(32, '0');
  return binaryToIp(maskBinary);
};

/**
 * Calculates the first usable host address.
 * @param networkAddress The network address.
 * @returns The first usable host address.
 */
export const calculateFirstUsableHost = (networkAddress: string): string => {
  const parts = networkAddress.split('.').map(Number);
  parts[3]++; // Increment the last octet
  return parts.join('.');
};

/**
 * Calculates the last usable host address.
 * @param broadcastAddress The broadcast address.
 * @returns The last usable host address.
 */
export const calculateLastUsableHost = (broadcastAddress: string): string => {
  const parts = broadcastAddress.split('.').map(Number);
  parts[3]--; // Decrement the last octet
  return parts.join('.');
};

/**
 * Calculates the total number of IP addresses in a subnet.
 * @param prefix The CIDR prefix.
 * @returns The total number of IP addresses.
 */
export const calculateTotalIps = (prefix: number): number => {
  return Math.pow(2, (32 - prefix));
};

/**
 * Calculates the number of usable hosts in a subnet.
 * @param prefix The CIDR prefix.
 * @returns The number of usable hosts.
 */
export const calculateUsableHosts = (prefix: number): number => {
  const totalIps = calculateTotalIps(prefix);
  if (totalIps < 2) return 0; // Network and Broadcast addresses
  return totalIps - 2;
};

/**
 * Generates a full IPv4Subnet object from a CIDR string.
 * @param cidr The CIDR string.
 * @param parentCidr Optional parent CIDR for hierarchical tracking.
 * @param depth The depth of the subnet in the hierarchy.
 * @returns A complete IPv4Subnet object.
 */
export const createSubnet = (cidr: string, parentCidr?: string, depth: number = 0): IPv4Subnet => {
  const { ip, prefix } = parseCidr(cidr);
  const networkAddress = calculateNetworkAddress(ip, prefix);
  const broadcastAddress = calculateBroadcastAddress(networkAddress, prefix);
  const subnetMask = calculateSubnetMask(prefix);
  const totalIps = calculateTotalIps(prefix);
  const usableHosts = calculateUsableHosts(prefix);

  let firstUsableHost = '';
  let lastUsableHost = '';

  if (usableHosts > 0) {
    firstUsableHost = calculateFirstUsableHost(networkAddress);
    lastUsableHost = calculateLastUsableHost(broadcastAddress);
  } else if (totalIps === 2) { // /31 networks have 2 IPs, no usable hosts
    firstUsableHost = networkAddress;
    lastUsableHost = broadcastAddress;
  } else { // /32 networks have 1 IP, no usable hosts
    firstUsableHost = networkAddress;
    lastUsableHost = networkAddress;
  }


  return {
    id: `${networkAddress}/${prefix}-${Date.now()}`, // Unique ID
    cidr: `${networkAddress}/${prefix}`,
    ipAddress: ip,
    prefix,
    networkAddress,
    broadcastAddress,
    subnetMask,
    firstUsableHost,
    lastUsableHost,
    totalIps,
    usableHosts,
    parentCidr,
    children: [],
    depth,
  };
};

/**
 * Checks if a new prefix is valid for a given parent prefix.
 * @param parentPrefix The prefix of the parent subnet.
 * @param newPrefix The proposed new prefix for child subnets.
 * @returns True if valid, false otherwise.
 */
export const isValidNewPrefix = (parentPrefix: number, newPrefix: number): boolean => {
  return newPrefix > parentPrefix && newPrefix <= 32;
};

/**
 * Divides a parent subnet into smaller subnets based on a new prefix.
 * @param parentSubnet The parent IPv4Subnet object.
 * @param newPrefix The new CIDR prefix for the child subnets.
 * @returns An array of new IPv4Subnet objects.
 */
export const divideByMask = (parentSubnet: IPv4Subnet, newPrefix: number): IPv4Subnet[] => {
  if (!isValidNewPrefix(parentSubnet.prefix, newPrefix)) {
    throw new Error(`New prefix /${newPrefix} must be greater than parent prefix /${parentSubnet.prefix} and less than or equal to /32.`);
  }

  const children: IPv4Subnet[] = [];
  let currentNetworkInt = parseInt(ipToBinary(parentSubnet.networkAddress), 2);
  const childSubnetSize = calculateTotalIps(newPrefix); // Size of each new child subnet

  // The number of subnets to create is determined by how many childSubnetSize blocks fit into the parent.
  const numSubnetsToCreate = Math.pow(2, (newPrefix - parentSubnet.prefix));

  for (let i = 0; i < numSubnetsToCreate; i++) {
    const childNetworkIp = binaryToIp(currentNetworkInt.toString(2).padStart(32, '0'));
    const childCidr = `${childNetworkIp}/${newPrefix}`;
    children.push(createSubnet(childCidr, parentSubnet.cidr, parentSubnet.depth + 1));

    // Move to the start of the next subnet
    currentNetworkInt += childSubnetSize;
  }
  return children;
};

/**
 * Divides a parent subnet into a specified number of subnets.
 * @param parentSubnet The parent IPv4Subnet object.
 * @param numSubnets The desired number of subnets.
 * @returns An array of new IPv4Subnet objects.
 */
export const divideByNumSubnets = (parentSubnet: IPv4Subnet, numSubnets: number): IPv4Subnet[] => {
  if (numSubnets <= 0 || !Number.isInteger(numSubnets)) {
    throw new Error('Number of subnets must be a positive integer.');
  }

  // Find the smallest new prefix that can accommodate numSubnets
  let newPrefix = parentSubnet.prefix;
  let possibleSubnets = 1;
  while (possibleSubnets < numSubnets && newPrefix < 32) {
    newPrefix++;
    possibleSubnets = Math.pow(2, (newPrefix - parentSubnet.prefix));
  }

  if (newPrefix > 32 || possibleSubnets < numSubnets) {
    throw new Error(`Cannot create ${numSubnets} subnets from /${parentSubnet.prefix}. Max possible is ${Math.pow(2, (32 - parentSubnet.prefix))}.`);
  }

  return divideByMask(parentSubnet, newPrefix);
};

/**
 * Divides a parent subnet to accommodate a specified number of usable hosts per subnet.
 * @param parentSubnet The parent IPv4Subnet object.
 * @param numHosts The desired number of usable hosts per child subnet.
 * @returns An array of new IPv4Subnet objects.
 */
export const divideByNumHosts = (parentSubnet: IPv4Subnet, numHosts: number): IPv4Subnet[] => {
  if (numHosts < 0 || !Number.isInteger(numHosts)) {
    throw new Error('Number of usable hosts must be a non-negative integer.');
  }

  // Calculate the smallest prefix that can accommodate numHosts + 2 (network + broadcast)
  let requiredTotalIps = numHosts + 2;
  if (numHosts === 0) requiredTotalIps = 1; // For /32, 1 IP, 0 usable hosts
  if (numHosts === 1) requiredTotalIps = 2; // For /31, 2 IPs, 0 usable hosts (or 2 if point-to-point)

  let newPrefix = 32;
  while (calculateTotalIps(newPrefix) < requiredTotalIps && newPrefix > 0) {
    newPrefix--;
  }

  if (newPrefix <= parentSubnet.prefix) {
    throw new Error(`Cannot create subnets with ${numHosts} usable hosts from /${parentSubnet.prefix}. The parent subnet is too small.`);
  }

  return divideByMask(parentSubnet, newPrefix);
};

/**
 * Calculates the remaining unallocated IP space from a parent network after children are allocated.
 * This is a simplified calculation assuming contiguous allocation.
 * @param parentSubnet The parent subnet.
 * @param allocatedChildren The children subnets that have been allocated.
 * @returns An array of CIDR strings representing the unallocated blocks.
 */
export const calculateRemainingSpace = (parentSubnet: IPv4Subnet, allocatedChildren: IPv4Subnet[]): string[] => {
  if (allocatedChildren.length === 0) {
    return [parentSubnet.cidr];
  }

  const parentNetworkInt = parseInt(ipToBinary(parentSubnet.networkAddress), 2);
  const parentBroadcastInt = parseInt(ipToBinary(parentSubnet.broadcastAddress), 2);

  // Sort children by their network address
  const sortedChildren = [...allocatedChildren].sort((a, b) => {
    const aBinary = ipToBinary(a.networkAddress);
    const bBinary = ipToBinary(b.networkAddress);
    return parseInt(aBinary, 2) - parseInt(bBinary, 2);
  });

  const remainingBlocks: string[] = [];
  let currentPointerInt = parentNetworkInt;

  for (const child of sortedChildren) {
    const childNetworkInt = parseInt(ipToBinary(child.networkAddress), 2);
    const childBroadcastInt = parseInt(ipToBinary(child.broadcastAddress), 2);

    // If there's a gap before the current child
    if (currentPointerInt < childNetworkInt) {
      const gapStartIp = binaryToIp(currentPointerInt.toString(2).padStart(32, '0'));
      const gapEndIp = binaryToIp((childNetworkInt - 1).toString(2).padStart(32, '0'));
      const gapCidr = findLargestCidrBlock(gapStartIp, gapEndIp);
      if (gapCidr) {
        remainingBlocks.push(gapCidr);
      }
    }
    // Move pointer past the current child's broadcast address
    currentPointerInt = childBroadcastInt + 1;
  }

  // If there's remaining space after the last child
  if (currentPointerInt <= parentBroadcastInt) {
    const remainingStartIp = binaryToIp(currentPointerInt.toString(2).padStart(32, '0'));
    const remainingEndIp = binaryToIp(parentBroadcastInt.toString(2).padStart(32, '0'));
    const remainingCidr = findLargestCidrBlock(remainingStartIp, remainingEndIp);
    if (remainingCidr) {
      remainingBlocks.push(remainingCidr);
    }
  }

  return remainingBlocks;
};

/**
 * Helper to find the largest CIDR block that fits within a given IP range.
 * This is a simplified approach and might not find all optimal blocks for complex gaps.
 * @param startIp The starting IP of the range.
 * @param endIp The ending IP of the range.
 * @returns The CIDR string of the largest block, or null if no valid block.
 */
const findLargestCidrBlock = (startIp: string, endIp: string): string | null => {
  const startInt = parseInt(ipToBinary(startIp), 2);
  const endInt = parseInt(ipToBinary(endIp), 2);

  if (startInt > endInt) return null;

  for (let prefix = 32; prefix >= 0; prefix--) {
    const totalIps = Math.pow(2, (32 - prefix));
    if (startInt % totalIps === 0 && (startInt + totalIps - 1) <= endInt) {
      return `${startIp}/${prefix}`;
    }
  }
  return null;
};
