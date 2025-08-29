import { useState, useCallback, useMemo, useEffect } from 'react';
import { IPv4Subnet, SubnetDivisionMethod } from '../types';
import {
  createSubnet,
  divideByMask,
  divideByNumSubnets,
  divideByNumHosts,
  calculateRemainingSpace,
  parseCidr,
  isValidIp,
  isValidPrefix
} from '../utils/ipv4Utils';
import { deserializeSubnetState, getShareableUrl } from '../utils/urlState';

interface SubnettingState {
  initialNetwork: IPv4Subnet | null;
  subnets: IPv4Subnet[]; // Flat list for easier lookup
  selectedSubnetId: string | null;
  error: string | null;
}

const initialState: SubnettingState = {
  initialNetwork: null,
  subnets: [],
  selectedSubnetId: null,
  error: null,
};

export const useSubnetting = () => {
  const [state, setState] = useState<SubnettingState>(initialState);

  // Load state from URL on initialization
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlState = urlParams.get('state');

    if (urlState) {
      const deserializedState = deserializeSubnetState(urlState);

      if (deserializedState) {
        setState({
          initialNetwork: deserializedState.initialNetwork,
          subnets: deserializedState.subnets,
          selectedSubnetId: deserializedState.selectedSubnetId,
          error: null,
        });
      } else {
        console.log('Failed to deserialize state from URL');
      }
    } else {
      console.log('No state parameter found in URL');
    }
  }, []);

  const addInitialNetwork = useCallback((cidr: string) => {
    try {
      const { ip, prefix } = parseCidr(cidr);
      const newInitialNetwork = createSubnet(`${ip}/${prefix}`);
      setState({
        initialNetwork: newInitialNetwork,
        subnets: [newInitialNetwork],
        selectedSubnetId: newInitialNetwork.id,
        error: null,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid CIDR notation';
      setState(s => ({ ...s, error: errorMessage }));
    }
  }, []);

  const findSubnetById = useCallback((id: string, currentSubnets: IPv4Subnet[]): IPv4Subnet | null => {
    for (const subnet of currentSubnets) {
      if (subnet.id === id) {
        return subnet;
      }
      const foundInChildren = findSubnetById(id, subnet.children);
      if (foundInChildren) {
        return foundInChildren;
      }
    }
    return null;
  }, []);

  const updateSubnetTree = useCallback((
    currentSubnets: IPv4Subnet[],
    parentId: string,
    newChildren: IPv4Subnet[]
  ): IPv4Subnet[] => {
    return currentSubnets.map(subnet => {
      if (subnet.id === parentId) {
        return { ...subnet, children: newChildren };
      }
      if (subnet.children.length > 0) {
        return { ...subnet, children: updateSubnetTree(subnet.children, parentId, newChildren) };
      }
      return subnet;
    });
  }, []);

  const divideSubnet = useCallback((
    parentId: string,
    method: SubnetDivisionMethod,
    value: number | string
  ) => {
    setState(s => {
      const parentSubnet = findSubnetById(parentId, s.subnets);
      if (!parentSubnet) {
        return { ...s, error: 'Parent subnet not found.' };
      }
      if (parentSubnet.children.length > 0) {
        return { ...s, error: 'Cannot divide a subnet that already has children. Please undo its division first.' };
      }

      try {
        let newChildren: IPv4Subnet[] = [];
        if (method === 'mask') {
          const newPrefix = typeof value === 'string' ? parseInt(value.replace('/', ''), 10) : value as number;
          if (isNaN(newPrefix) || !isValidPrefix(newPrefix)) {
            throw new Error('Invalid new prefix for division.');
          }
          newChildren = divideByMask(parentSubnet, newPrefix);
        } else if (method === 'numSubnets') {
          const numSubnets = value as number;
          if (isNaN(numSubnets) || numSubnets <= 0) {
            throw new Error('Number of subnets must be a positive integer.');
          }
          newChildren = divideByNumSubnets(parentSubnet, numSubnets);
        } else if (method === 'numHosts') {
          const numHosts = value as number;
          if (isNaN(numHosts) || numHosts < 0) {
            throw new Error('Number of usable hosts must be a non-negative integer.');
          }
          newChildren = divideByNumHosts(parentSubnet, numHosts);
        }

        const updatedSubnets = updateSubnetTree(s.subnets, parentId, newChildren);
        return { ...s, subnets: updatedSubnets, error: null };
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to divide subnet';
        return { ...s, error: errorMessage };
      }
    });
  }, [findSubnetById, updateSubnetTree]);

  const selectSubnet = useCallback((id: string | null) => {
    setState(s => ({ ...s, selectedSubnetId: id, error: null }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const resetConfiguration = useCallback(() => {
    setState(initialState);
  }, []);

  const selectedSubnet = useMemo(() => {
    if (!state.selectedSubnetId) return null;
    return findSubnetById(state.selectedSubnetId, state.subnets);
  }, [state.selectedSubnetId, state.subnets, findSubnetById]);

  const allSubnetsFlat = useMemo(() => {
    const flatList: IPv4Subnet[] = [];
    const traverse = (subnet: IPv4Subnet) => {
      flatList.push(subnet);
      subnet.children.forEach(traverse);
    };
    state.subnets.forEach(traverse);
    return flatList;
  }, [state.subnets]);

  const overallSummary = useMemo(() => {
    if (!state.initialNetwork) {
      return {
        initialCidr: 'N/A',
        totalIps: 0,
        allocatedIps: 0,
        usableHosts: 0,
        remainingSpace: [],
        allocationPercentage: 0,
      };
    }

    const initialTotalIps = state.initialNetwork.totalIps;
    let allocatedIps = 0;
    let usableHosts = 0;

    // Only count IPs from the lowest-level subnets that have no children
    const leafSubnets = allSubnetsFlat.filter(s => s.children.length === 0);

    leafSubnets.forEach(subnet => {
      allocatedIps += subnet.totalIps;
      usableHosts += subnet.usableHosts;
    });

    const allocationPercentage = initialTotalIps > 0 ? (allocatedIps / initialTotalIps) * 100 : 0;

    // Calculate remaining space based on the initial network and its direct children
    const remainingSpace = calculateRemainingSpace(state.initialNetwork, state.initialNetwork.children);

    return {
      initialCidr: state.initialNetwork.cidr,
      totalIps: initialTotalIps,
      allocatedIps,
      usableHosts,
      remainingSpace,
      allocationPercentage: parseFloat(allocationPercentage.toFixed(2)),
    };
  }, [state.initialNetwork, allSubnetsFlat]);

  return {
    initialNetwork: state.initialNetwork,
    subnets: state.subnets,
    selectedSubnetId: state.selectedSubnetId,
    selectedSubnet,
    error: state.error,
    overallSummary,
    addInitialNetwork,
    divideSubnet,
    selectSubnet,
    clearError,
    resetConfiguration,
    getShareableUrl: () => getShareableUrl(state.initialNetwork, state.subnets, state.selectedSubnetId),
  };
};
