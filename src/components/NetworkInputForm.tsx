import React, { useState } from 'react';
import { Edit, RotateCcw } from 'lucide-react'; // Changed from Input to Edit to resolve SyntaxError

interface NetworkInputFormProps {
  onAddNetwork: (cidr: string) => void;
  onResetConfiguration: () => void;
  error: string | null;
  clearError: () => void;
}

const NetworkInputForm: React.FC<NetworkInputFormProps> = ({ onAddNetwork, onResetConfiguration, error, clearError }) => {
  const [cidr, setCidr] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    onAddNetwork(cidr.trim());
  };

  return (
    <div className="p-6 bg-surface rounded-xl shadow-md border border-border mb-6">
      <h2 className="text-xl font-semibold text-text mb-4 flex items-center">
        <Edit className="w-5 h-5 text-secondary mr-2" /> {/* Using Edit icon */}
        Initial Network
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="cidr-input" className="block text-sm font-medium text-textSecondary mb-1">
            Enter IPv4 Network (CIDR)
          </label>
          <input
            id="cidr-input"
            type="text"
            value={cidr}
            onChange={(e) => setCidr(e.target.value)}
            placeholder="e.g., 192.168.1.0/24"
            className={`w-full p-3 bg-background text-text border ${error ? 'border-error' : 'border-border'} rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200`}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? "cidr-error" : undefined}
          />
          {error && (
            <p id="cidr-error" className="mt-2 text-sm text-error">
              {error}
            </p>
          )}
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 bg-primary text-white py-3 px-4 rounded-md font-medium hover:bg-primary/90 transition-colors duration-200 shadow-md"
          >
            Add Network
          </button>
          <button
            type="button"
            onClick={onResetConfiguration}
            className="flex-1 bg-secondary text-white py-3 px-4 rounded-md font-medium hover:bg-secondary/90 transition-colors duration-200 shadow-md flex items-center justify-center"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Configuration
          </button>
        </div>
      </form>
    </div>
  );
};

export default NetworkInputForm;
