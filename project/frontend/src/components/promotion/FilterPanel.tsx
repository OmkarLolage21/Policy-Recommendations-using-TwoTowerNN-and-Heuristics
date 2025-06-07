import React, { useState } from 'react';
import { Save, Filter, X, Plus } from 'lucide-react';
import { FilterState, FilterPreset } from '../../types/promotion';

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  presets: FilterPreset[];
  onSavePreset: (name: string, filters: FilterState) => void;
  onLoadPreset: (preset: FilterPreset) => void;
  onDeletePreset: (presetId: string) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  presets,
  onSavePreset,
  onLoadPreset,
  onDeletePreset
}) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    demographic: true,
    policy: false,
    interaction: false,
    persona: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateFilters = (section: keyof FilterState, field: string, value: any) => {
    const newFilters = {
      ...filters,
      [section]: {
        ...filters[section],
        [field]: value
      }
    };
    onFilterChange(newFilters);
  };

  const handleSavePreset = () => {
    if (presetName.trim()) {
      onSavePreset(presetName.trim(), filters);
      setPresetName('');
      setShowSaveDialog(false);
    }
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterState = {
      demographic: {
        age: { min: 18, max: 65, enabled: false },
        gender: [],
        income_bracket: [],
        employment_status: [],
        marital_status: [],
        location_city: [],
      },
      policy: {
        policy_ownership_count: { min: 0, max: 5, enabled: false },
        last_policy_purchase: { from: '', to: '', enabled: false },
        credit_score: { min: 300, max: 900, enabled: false },
        preferred_policy_type: [],
      },
      interaction: {
        clicked: null,
        purchased: null,
        abandoned_cart: null,
        viewed_duration: { min: 0, max: 120, enabled: false },
        comparison_count: { min: 0, max: 10, enabled: false },
      },
      persona: [],
    };
    onFilterChange(clearedFilters);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center">
          <Filter className="mr-2" size={20} />
          Customer Filters
        </h2>
        <button
          onClick={clearAllFilters}
          className="text-sm text-gray-500 hover:text-red-600 flex items-center"
        >
          <X size={16} className="mr-1" />
          Clear All
        </button>
      </div>

      {/* Demographic Filters */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection('demographic')}
          className="w-full p-4 text-left font-medium bg-gray-50 hover:bg-gray-100 rounded-t-lg flex items-center justify-between"
        >
          <span>Demographic Filters</span>
          <span className={`transform transition-transform ${expandedSections.demographic ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        {expandedSections.demographic && (
          <div className="p-4 space-y-4">
            {/* Age Range */}
            <div>
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={filters.demographic.age.enabled}
                  onChange={(e) => updateFilters('demographic', 'age', {
                    ...filters.demographic.age,
                    enabled: e.target.checked
                  })}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Age Range</span>
              </label>
              {filters.demographic.age.enabled && (
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.demographic.age.min}
                    onChange={(e) => updateFilters('demographic', 'age', {
                      ...filters.demographic.age,
                      min: parseInt(e.target.value) || 18
                    })}
                    className="w-20 px-2 py-1 border rounded text-sm"
                  />
                  <span className="py-1">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.demographic.age.max}
                    onChange={(e) => updateFilters('demographic', 'age', {
                      ...filters.demographic.age,
                      max: parseInt(e.target.value) || 65
                    })}
                    className="w-20 px-2 py-1 border rounded text-sm"
                  />
                </div>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="text-sm font-medium mb-2 block">Gender</label>
              <div className="space-y-1">
                {['Male', 'Female', 'Other'].map(gender => (
                  <label key={gender} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.demographic.gender.includes(gender)}
                      onChange={(e) => {
                        const newGenders = e.target.checked
                          ? [...filters.demographic.gender, gender]
                          : filters.demographic.gender.filter(g => g !== gender);
                        updateFilters('demographic', 'gender', newGenders);
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{gender}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Income Bracket */}
            <div>
              <label className="text-sm font-medium mb-2 block">Income Bracket</label>
              <div className="space-y-1">
                {['0-250000', '250001-750000', '750001-1500000', '1500001+'].map(bracket => (
                  <label key={bracket} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.demographic.income_bracket.includes(bracket)}
                      onChange={(e) => {
                        const newBrackets = e.target.checked
                          ? [...filters.demographic.income_bracket, bracket]
                          : filters.demographic.income_bracket.filter(b => b !== bracket);
                        updateFilters('demographic', 'income_bracket', newBrackets);
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">₹{bracket}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Policy Filters */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection('policy')}
          className="w-full p-4 text-left font-medium bg-gray-50 hover:bg-gray-100 rounded-t-lg flex items-center justify-between"
        >
          <span>Policy Filters</span>
          <span className={`transform transition-transform ${expandedSections.policy ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        {expandedSections.policy && (
          <div className="p-4 space-y-4">
            {/* Credit Score */}
            <div>
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={filters.policy.credit_score.enabled}
                  onChange={(e) => updateFilters('policy', 'credit_score', {
                    ...filters.policy.credit_score,
                    enabled: e.target.checked
                  })}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Credit Score Range</span>
              </label>
              {filters.policy.credit_score.enabled && (
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.policy.credit_score.min}
                    onChange={(e) => updateFilters('policy', 'credit_score', {
                      ...filters.policy.credit_score,
                      min: parseInt(e.target.value) || 300
                    })}
                    className="w-20 px-2 py-1 border rounded text-sm"
                  />
                  <span className="py-1">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.policy.credit_score.max}
                    onChange={(e) => updateFilters('policy', 'credit_score', {
                      ...filters.policy.credit_score,
                      max: parseInt(e.target.value) || 900
                    })}
                    className="w-20 px-2 py-1 border rounded text-sm"
                  />
                </div>
              )}
            </div>

            {/* Preferred Policy Type */}
            <div>
              <label className="text-sm font-medium mb-2 block">Preferred Policy Type</label>
              <div className="space-y-1">
                {['Term', 'ULIP', 'Health', 'Endowment', 'Money Back', 'Pension'].map(type => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.policy.preferred_policy_type.includes(type)}
                      onChange={(e) => {
                        const newTypes = e.target.checked
                          ? [...filters.policy.preferred_policy_type, type]
                          : filters.policy.preferred_policy_type.filter(t => t !== type);
                        updateFilters('policy', 'preferred_policy_type', newTypes);
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interaction Filters */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection('interaction')}
          className="w-full p-4 text-left font-medium bg-gray-50 hover:bg-gray-100 rounded-t-lg flex items-center justify-between"
        >
          <span>Interaction Filters</span>
          <span className={`transform transition-transform ${expandedSections.interaction ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        {expandedSections.interaction && (
          <div className="p-4 space-y-4">
            {/* Clicked */}
            <div>
              <label className="text-sm font-medium mb-2 block">Has Clicked Policies</label>
              <select
                value={filters.interaction.clicked === null ? '' : filters.interaction.clicked.toString()}
                onChange={(e) => {
                  const value = e.target.value === '' ? null : e.target.value === 'true';
                  updateFilters('interaction', 'clicked', value);
                }}
                className="w-full px-3 py-2 border rounded text-sm"
              >
                <option value="">Any</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            {/* Purchased */}
            <div>
              <label className="text-sm font-medium mb-2 block">Has Purchased</label>
              <select
                value={filters.interaction.purchased === null ? '' : filters.interaction.purchased.toString()}
                onChange={(e) => {
                  const value = e.target.value === '' ? null : e.target.value === 'true';
                  updateFilters('interaction', 'purchased', value);
                }}
                className="w-full px-3 py-2 border rounded text-sm"
              >
                <option value="">Any</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Save Preset */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={() => setShowSaveDialog(true)}
          className="w-full bg-violet-600 text-white py-2 px-4 rounded-lg hover:bg-violet-700 flex items-center justify-center"
        >
          <Save size={16} className="mr-2" />
          Save as Preset
        </button>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Save Filter Preset</h3>
            <input
              type="text"
              placeholder="Enter preset name..."
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              className="w-full px-3 py-2 border rounded mb-4"
              autoFocus
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreset}
                disabled={!presetName.trim()}
                className="flex-1 px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;