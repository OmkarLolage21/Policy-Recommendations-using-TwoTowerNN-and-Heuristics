import React from 'react';
import { useParams } from 'react-router-dom';
import { customers } from '../data/customers';
import { policies } from '../data/policies';
import PolicyCard from '../components/PolicyCard';

const CustomerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const customer = customers.find(c => c.id === id);
  const customerPolicies = policies[id || ''] || [];

  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-8">
        <div className="text-center text-gray-600">Customer not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Profile for {customer.name}
          </h1>
          <div className="flex gap-4 text-gray-600">
            <span>Age: {customer.age}</span>
            <span>•</span>
            <span>Income: {customer.income}</span>
            <span>•</span>
            <span>Family Size: {customer.familySize}</span>
          </div>
        </header>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Recommended Policies
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customerPolicies.map((policy) => (
              <PolicyCard key={policy.id} policy={policy} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CustomerProfile;