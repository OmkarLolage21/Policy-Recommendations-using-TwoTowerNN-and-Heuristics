import React from 'react';
import { Policy } from '../data/policies';
import { Shield, Clock, IndianRupee } from 'lucide-react';

interface PolicyCardProps {
  policy: Policy;
}

const PolicyCard: React.FC<PolicyCardProps> = ({ policy }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <h3 className="text-xl font-semibold text-sbi-purple mb-4">{policy.name}</h3>
      
      <div className="space-y-3 mb-4">
        <div className="flex items-center text-gray-700">
          <IndianRupee size={18} className="mr-2 text-sbi-pink" />
          <span>Premium: {policy.premium}</span>
        </div>
        <div className="flex items-center text-gray-700">
          <Shield size={18} className="mr-2 text-sbi-blue" />
          <span>Coverage: {policy.coverage}</span>
        </div>
        <div className="flex items-center text-gray-700">
          <Clock size={18} className="mr-2 text-sbi-purple" />
          <span>Duration: {policy.duration}</span>
        </div>
      </div>

      <p className="text-gray-600 mb-4">{policy.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {policy.tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 bg-sbi-light-purple text-sbi-purple rounded-full text-sm"
          >
            {tag}
          </span>
        ))}
      </div>

      <button className="w-full bg-sbi-purple text-white py-2 rounded-lg hover:bg-sbi-pink transition-colors duration-200">
        View Details
      </button>
    </div>
  );
};

export default PolicyCard;