import { IPv4Subnet } from '../types';
import { createSubnet } from './ipv4Utils';

interface SerializedSubnetState {
  initial: string;
  initialId: string;
  selected: string | null;
  subnets: SerializedSubnet[];
}

interface SerializedSubnet {
  id: string;
  cidr: string;
  depth: number;
  parentId?: string;
}

/**
 * Serializes the subnet state into URL-safe parameters
 */
export const serializeSubnetState = (initialNetwork: IPv4Subnet | null, subnets: IPv4Subnet[], selectedSubnetId: string | null): string => {
  if (!initialNetwork) return '';

  const state: SerializedSubnetState = {
    initial: initialNetwork.cidr,
    initialId: initialNetwork.id,
    selected: selectedSubnetId,
    subnets: serializeSubnetTree(subnets)
  };

  const serialized = btoa(JSON.stringify(state));
  return serialized;
};

/**
 * Deserializes URL parameters back into subnet state
 */
export const deserializeSubnetState = (encodedState: string): {
  initialNetwork: IPv4Subnet | null;
  subnets: IPv4Subnet[];
  selectedSubnetId: string | null;
} | null => {
  try {
    const decoded: SerializedSubnetState = JSON.parse(atob(encodedState));

    if (!decoded.initial) return null;

    // Create the initial network
    const initialNetwork = createSubnet(decoded.initial);
    // Preserve the original ID for parent relationship mapping (with backward compatibility)
    initialNetwork.id = decoded.initialId || initialNetwork.id;

    // Check if we have any subnets to deserialize
    if (!decoded.subnets || decoded.subnets.length === 0) {
      return {
        initialNetwork,
        subnets: [initialNetwork],
        selectedSubnetId: decoded.selected || initialNetwork.id
      };
    }

    // Rebuild the subnet tree
    const subnets = deserializeSubnetTree(decoded.subnets, initialNetwork);

    const result = {
      initialNetwork,
      subnets: subnets.length > 0 ? subnets : [initialNetwork],
      selectedSubnetId: decoded.selected || initialNetwork.id
    };

    return result;
  } catch (error) {
    console.error('Failed to deserialize subnet state:', error);
    return null;
  }
};

/**
 * Serializes a subnet tree into a flat structure with parent relationships
 */
const serializeSubnetTree = (subnets: IPv4Subnet[]): SerializedSubnet[] => {
  const flat: SerializedSubnet[] = [];

  const traverse = (subnet: IPv4Subnet, parentId?: string) => {
    // Only serialize children, not the root network
    if (parentId !== undefined) {
      flat.push({
        id: subnet.id,
        cidr: subnet.cidr,
        depth: subnet.depth,
        parentId
      });
    }

    subnet.children.forEach(child => traverse(child, subnet.id));
  };

  subnets.forEach(subnet => traverse(subnet));
  return flat;
};

/**
 * Deserializes a flat subnet structure back into a tree
 */
const deserializeSubnetTree = (flatSubnets: SerializedSubnet[], rootNetwork: IPv4Subnet): IPv4Subnet[] => {
  const subnetMap = new Map<string, IPv4Subnet>();
  const parentMap = new Map<string, string>();

  // Add the root network to the map
  subnetMap.set(rootNetwork.id, rootNetwork);

  // Create all subnets from the flat structure
  flatSubnets.forEach(item => {
    const subnet = createSubnet(item.cidr, undefined, item.depth || 0);
    subnet.id = item.id; // Preserve original ID
    subnetMap.set(item.id, subnet);

    if (item.parentId) {
      parentMap.set(item.id, item.parentId);
    }
  });

  // Build the tree structure
  const buildTree = (subnetId: string): IPv4Subnet => {
    const subnet = subnetMap.get(subnetId)!;
    const children: IPv4Subnet[] = [];

    // Find all children of this subnet
    parentMap.forEach((parentId, childId) => {
      if (parentId === subnetId) {
        children.push(buildTree(childId));
      }
    });

    return { ...subnet, children };
  };

  // Return the root network with its children attached
  return [buildTree(rootNetwork.id)];
};

/**
 * Gets the current URL with state parameters
 */
export const getShareableUrl = (initialNetwork: IPv4Subnet | null, subnets: IPv4Subnet[], selectedSubnetId: string | null): string => {
  const baseUrl = window.location.origin + window.location.pathname;
  const stateParam = serializeSubnetState(initialNetwork, subnets, selectedSubnetId);

  if (!stateParam) return baseUrl;

  return `${baseUrl}?state=${encodeURIComponent(stateParam)}`;
};

/**
 * Extracts state from URL parameters
 */
export const getStateFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('state');
};
