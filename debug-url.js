// Debug script to test URL state functionality
import { serializeSubnetState, deserializeSubnetState } from './src/utils/urlState.ts';
import { createSubnet } from './src/utils/ipv4Utils.ts';

// Create a test network
const rootNetwork = createSubnet('192.168.1.0/24');
const subnet1 = createSubnet('192.168.1.0/25');
const subnet2 = createSubnet('192.168.1.128/25');

// Simulate a tree structure
rootNetwork.children = [subnet1, subnet2];
subnet1.parentCidr = rootNetwork.cidr;
subnet2.parentCidr = rootNetwork.cidr;

// Test serialization
const serialized = serializeSubnetState(rootNetwork, [rootNetwork], rootNetwork.id);
console.log('Serialized state:', serialized);

// Test deserialization
const deserialized = deserializeSubnetState(serialized);
console.log('Deserialized state:', deserialized);
