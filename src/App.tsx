import React from 'react';
import Header from './components/Header';
import NetworkInputForm from './components/NetworkInputForm';
import SubnetVisualizer from './components/SubnetVisualizer';
import SubnetDetails from './components/SubnetDetails';
import OverallSummary from './components/OverallSummary';
import QuickActions from './components/QuickActions';
import { useSubnetting } from './hooks/useSubnetting';

const App: React.FC = () => {
  const {
    initialNetwork,
    subnets,
    selectedSubnetId,
    selectedSubnet,
    error,
    overallSummary,
    addInitialNetwork,
    divideSubnet,
    selectSubnet,
    clearError,
    resetConfiguration,
  } = useSubnetting();

  return (
    <div className="min-h-screen bg-background text-text font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <Header />

        <NetworkInputForm onAddNetwork={addInitialNetwork} onResetConfiguration={resetConfiguration} error={error} clearError={clearError} />

        {initialNetwork && (
          <QuickActions selectedSubnet={selectedSubnet} onDivideSubnet={divideSubnet} />
        )}

        {initialNetwork && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <OverallSummary {...overallSummary} />
              <SubnetVisualizer
                subnets={subnets}
                selectedSubnetId={selectedSubnetId}
                onSelectSubnet={selectSubnet}
                onDivideSubnet={divideSubnet}
              />
            </div>
            <div className="lg:col-span-1">
              {selectedSubnet ? (
                <SubnetDetails
                  subnet={selectedSubnet}
                  onDivideSubnet={divideSubnet}
                  error={error}
                  clearError={clearError}
                />
              ) : (
                <div className="p-6 bg-surface rounded-xl shadow-md border border-border text-center text-textSecondary">
                  Select a subnet from the hierarchy to view details and divide it.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
