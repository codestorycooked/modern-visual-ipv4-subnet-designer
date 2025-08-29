import React from 'react';
import { Network } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-center p-4 bg-surface border-b border-border shadow-lg rounded-t-xl">
      <Network className="w-8 h-8 text-primary mr-3" />
      <h1 className="text-2xl font-serif font-bold text-text tracking-wide">
        IPv4 Subnet Designer
      </h1>
    </header>
  );
};

export default Header;
