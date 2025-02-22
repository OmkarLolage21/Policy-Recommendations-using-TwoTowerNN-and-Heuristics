import React from 'react';
import { allPolicies } from '../data/policies';
import PolicyCard from './policy/PolicyCard';

const PolicyList: React.FC = () => {
  return (
    <div className="min-h-screen bg-sbi-light-purple p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-sbi-purple mb-8">All Insurance Plans</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allPolicies.map((policy) => (
            <PolicyCard key={policy.id} policy={policy} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PolicyList;