import React, { useState, useEffect } from 'react';
import { Grid, List, Filter, Users, AlertTriangle, TrendingUp, Target } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import PolicyPromotionCard from '../components/promotion/PolicyPromotionCard';
import FilterPresetCard from '../components/promotion/FilterPresetCard';
import FilterPanel from '../components/promotion/FilterPanel';
import Navbar from '../components/NavBar';
import { Policy, FilterPreset, FilterState } from '../types/promotion';

const PolicyPromotion: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [selectedPolicies, setSelectedPolicies] = useState<Policy[]>([]);
  const [filterPresets, setFilterPresets] = useState<FilterPreset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<FilterPreset | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolicies();
    loadSamplePresets();
  }, []);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/search_policies?q=');
      const data = await response.json();
      
      const transformedPolicies: Policy[] = data.map((policy: any) => ({
        policy_id: policy.policy_id,
        policy_name: policy.policy_name,
        policy_type: policy.policy_type,
        sum_assured: policy['sum_assured (INR)'] || 0,
        premium_amount: policy['premium_amount (INR)'] || 0,
        policy_duration_years: policy.policy_duration_years || 0,
        risk_category: policy.risk_category || 'Medium',
        customer_target_group: policy.customer_target_group ? 
          policy.customer_target_group.split(',').map((s: string) => s.trim()) : 
          ['General'],
        description: policy.description || '',
        keywords: policy.keywords ? 
          policy.keywords.split(',').map((s: string) => s.trim()) : 
          [],
        score: Math.floor(Math.random() * 40) + 60, // Mock score 60-100
        selected_for_promotion: false
      }));

      setPolicies(transformedPolicies);
    } catch (error) {
      console.error('Error fetching policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSamplePresets = () => {
    const samplePresets: FilterPreset[] = [
      {
        id: uuidv4(),
        name: 'Young Professionals',
        description: 'Target young working professionals aged 25-35',
        filters: {
          demographic: {
            age: { min: 25, max: 35, enabled: true },
            gender: [],
            income_bracket: ['250001-750000', '750001-1500000'],
            employment_status: ['Salaried'],
            marital_status: [],
            location_city: [],
          },
          policy: {
            policy_ownership_count: { min: 0, max: 2, enabled: true },
            last_policy_purchase: { from: '', to: '', enabled: false },
            credit_score: { min: 650, max: 900, enabled: true },
            preferred_policy_type: ['Term', 'ULIP'],
          },
          interaction: {
            clicked: true,
            purchased: false,
            abandoned_cart: null,
            viewed_duration: { min: 30, max: 120, enabled: true },
            comparison_count: { min: 1, max: 10, enabled: false },
          },
          persona: ['Tech-Savvy', 'Career-Focused'],
        },
        selected_policies: [],
        created_at: new Date().toISOString(),
        target_customer_count: 15420,
        is_active: true
      },
      {
        id: uuidv4(),
        name: 'Family Protectors',
        description: 'Married individuals with families looking for comprehensive coverage',
        filters: {
          demographic: {
            age: { min: 30, max: 50, enabled: true },
            gender: [],
            income_bracket: ['750001-1500000', '1500001+'],
            employment_status: ['Salaried', 'Business Owner'],
            marital_status: ['Married'],
            location_city: [],
          },
          policy: {
            policy_ownership_count: { min: 1, max: 5, enabled: true },
            last_policy_purchase: { from: '', to: '', enabled: false },
            credit_score: { min: 700, max: 900, enabled: true },
            preferred_policy_type: ['Health', 'Term'],
          },
          interaction: {
            clicked: null,
            purchased: null,
            abandoned_cart: false,
            viewed_duration: { min: 60, max: 120, enabled: true },
            comparison_count: { min: 2, max: 10, enabled: true },
          },
          persona: ['Family-Oriented', 'Security-Conscious'],
        },
        selected_policies: [],
        created_at: new Date(Date.now() - 86400000).toISOString(),
        target_customer_count: 8750,
        is_active: false
      },
      {
        id: uuidv4(),
        name: 'High Net Worth Investors',
        description: 'Affluent customers interested in investment-linked policies',
        filters: {
          demographic: {
            age: { min: 35, max: 60, enabled: true },
            gender: [],
            income_bracket: ['1500001+'],
            employment_status: ['Business Owner', 'Self-Employed'],
            marital_status: [],
            location_city: ['Mumbai', 'Delhi', 'Bengaluru'],
          },
          policy: {
            policy_ownership_count: { min: 2, max: 5, enabled: true },
            last_policy_purchase: { from: '', to: '', enabled: false },
            credit_score: { min: 750, max: 900, enabled: true },
            preferred_policy_type: ['ULIP', 'Endowment'],
          },
          interaction: {
            clicked: true,
            purchased: true,
            abandoned_cart: false,
            viewed_duration: { min: 90, max: 120, enabled: true },
            comparison_count: { min: 3, max: 10, enabled: true },
          },
          persona: ['Investment-Savvy', 'Wealth-Builder'],
        },
        selected_policies: [],
        created_at: new Date(Date.now() - 172800000).toISOString(),
        target_customer_count: 3240,
        is_active: true
      }
    ];

    setFilterPresets(samplePresets);
  };

  const handlePolicySelect = (policy: Policy) => {
    setSelectedPolicies(prev => {
      const isSelected = prev.some(p => p.policy_id === policy.policy_id);
      if (isSelected) {
        return prev.filter(p => p.policy_id !== policy.policy_id);
      }
      return [...prev, policy];
    });
  };

  const handlePolicyPromote = (policy: Policy) => {
    setPolicies(prev => 
      prev.map(p => 
        p.policy_id === policy.policy_id 
          ? { ...p, selected_for_promotion: !p.selected_for_promotion }
          : p
      )
    );
  };

  const handlePresetSelect = (preset: FilterPreset) => {
    setSelectedPreset(prev => prev?.id === preset.id ? null : preset);
  };

  const handlePresetEdit = (preset: FilterPreset) => {
    setShowFilters(true);
    setSelectedPreset(preset);
  };

  const handlePresetDelete = (presetId: string) => {
    setFilterPresets(prev => prev.filter(p => p.id !== presetId));
    if (selectedPreset?.id === presetId) {
      setSelectedPreset(null);
    }
  };

  const handleSavePreset = (name: string, filters: FilterState) => {
    const newPreset: FilterPreset = {
      id: uuidv4(),
      name,
      filters,
      selected_policies: selectedPolicies,
      created_at: new Date().toISOString(),
      target_customer_count: Math.floor(Math.random() * 10000) + 1000,
      is_active: false
    };

    setFilterPresets(prev => [...prev, newPreset]);
  };

  const handleFilterChange = (filters: FilterState) => {
    if (selectedPreset) {
      setFilterPresets(prev =>
        prev.map(p =>
          p.id === selectedPreset.id
            ? { ...p, filters }
            : p
        )
      );
      setSelectedPreset(prev => prev ? { ...prev, filters } : null);
    }
  };

  const getFilteredPolicies = () => {
    if (!selectedPreset) return policies;
    
    // Apply filters based on selected preset
    // This is a simplified implementation - in a real app, you'd filter based on customer data
    return policies.filter(policy => {
      const filters = selectedPreset.filters;
      
      // Filter by policy type if specified
      if (filters.policy.preferred_policy_type.length > 0) {
        return filters.policy.preferred_policy_type.includes(policy.policy_type);
      }
      
      return true;
    });
  };

  const filteredPolicies = getFilteredPolicies();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      <Navbar userType="admin" />
      
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-violet-700 mb-2">
              Policy Promotion Management
            </h1>
            <p className="text-gray-600">Create targeted campaigns and manage policy promotions</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mt-4 md:mt-0">
            <button
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center shadow-sm transition-colors ${
                showFilters 
                  ? 'bg-violet-600 text-white' 
                  : 'bg-white text-violet-700 border border-violet-200 hover:bg-violet-50'
              }`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} className="mr-1.5" /> 
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            
            <div className="flex rounded-lg overflow-hidden shadow-sm border border-gray-200">
              <button
                className={`px-3 py-1.5 flex items-center text-sm ${
                  viewMode === 'grid' 
                    ? 'bg-violet-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setViewMode('grid')}
              >
                <Grid size={16} className="mr-1" /> Grid
              </button>
              <button
                className={`px-3 py-1.5 flex items-center text-sm ${
                  viewMode === 'list' 
                    ? 'bg-violet-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setViewMode('list')}
              >
                <List size={16} className="mr-1" /> List
              </button>
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-500 mb-1">Total Policies</h3>
                <p className="text-2xl font-bold text-gray-800">{policies.length}</p>
              </div>
              <Target className="text-blue-500" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-500 mb-1">Selected for Promotion</h3>
                <p className="text-2xl font-bold text-violet-700">
                  {policies.filter(p => p.selected_for_promotion).length}
                </p>
              </div>
              <TrendingUp className="text-violet-500" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-500 mb-1">Active Presets</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {filterPresets.filter(p => p.is_active).length}
                </p>
              </div>
              <Filter className="text-blue-500" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-500 mb-1">Target Customers</h3>
                <p className="text-2xl font-bold text-amber-600">
                  {selectedPreset?.target_customer_count?.toLocaleString() || '0'}
                </p>
              </div>
              <Users className="text-amber-500" size={24} />
            </div>
          </div>
        </div>

        <div className={`grid grid-cols-1 ${showFilters ? 'lg:grid-cols-[320px,1fr]' : ''} gap-6`}>
          {/* Filter Panel */}
          {showFilters && (
            <div className="lg:sticky lg:top-6 lg:self-start space-y-4">
              <FilterPanel
                filters={selectedPreset?.filters || {
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
                }}
                onFilterChange={handleFilterChange}
                presets={filterPresets}
                onSavePreset={handleSavePreset}
                onLoadPreset={handlePresetSelect}
                onDeletePreset={handlePresetDelete}
              />

              {selectedPreset && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mr-2 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-amber-800">
                        Active Preset: {selectedPreset.name}
                      </h3>
                      <p className="text-xs text-amber-600 mt-1">
                        Showing {filteredPolicies.length} policies matching this preset
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Main Content */}
          <div>
            {/* Filter Presets Grid */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Filter Presets</h2>
              <div className={`grid ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              } gap-4`}>
                {filterPresets.map(preset => (
                  <FilterPresetCard
                    key={preset.id}
                    preset={preset}
                    selected={selectedPreset?.id === preset.id}
                    onSelect={handlePresetSelect}
                    onEdit={handlePresetEdit}
                    onDelete={handlePresetDelete}
                  />
                ))}
              </div>
            </div>

            {/* Policies Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Available Policies
                  {selectedPreset && (
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      ({filteredPolicies.length} matching "{selectedPreset.name}")
                    </span>
                  )}
                </h2>
                {selectedPolicies.length > 0 && (
                  <div className="text-sm text-gray-600">
                    {selectedPolicies.length} selected
                  </div>
                )}
              </div>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-700 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading policies...</p>
                </div>
              ) : (
                <div className={`grid ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                } gap-4`}>
                  {filteredPolicies.map(policy => (
                    <PolicyPromotionCard
                      key={policy.policy_id}
                      policy={policy}
                      selected={selectedPolicies.some(p => p.policy_id === policy.policy_id)}
                      onSelect={handlePolicySelect}
                      onPromote={handlePolicyPromote}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyPromotion;