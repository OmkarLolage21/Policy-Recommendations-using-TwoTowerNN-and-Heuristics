import React from 'react';
import DashboardFilters from '../components/dashboard/DashboardFilters';
import PolicyPerformance from '../components/dashboard/PolicyPerformance';
import CustomerInsights from '../components/dashboard/CustomerInsights';
import ConversionMetrics from '../components/dashboard/ConversionMetrics';
import RelationshipGraph from '../components/dashboard/RelationshipGraph';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SBI Life Analytics Dashboard</h1>
          <p className="text-gray-600">Track performance metrics and customer insights</p>
        </header>

        <DashboardFilters />

        <div className="space-y-6">
          <ConversionMetrics />
          <RelationshipGraph />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PolicyPerformance />
            <CustomerInsights />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;