import React, { useEffect, useState } from 'react';
import { BarChart, PieChart, LineChart } from '../components/dashboard/Charts';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import TrackingInsights from '../components/dashboard/TrackingInsights';
import Navbar from '../components/NavBar';
import { FiRefreshCw, FiAlertCircle, FiActivity, FiUsers, FiTrendingUp, FiDollarSign } from 'react-icons/fi';

interface DashboardData {
  metrics?: {
    total_policies: number;
    total_customers: number;
    conversion_rate: number;
    avg_premium: number;
  };
  policy_performance?: any;
  customer_segments?: any;
  sales_trend?: any;
  recent_activities?: any;
  top_policies?: any;
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardData>({});
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:5000/analytics?range=${timeRange}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const formatNumber = (value?: number, fallback = '--') => {
    return value?.toLocaleString() ?? fallback;
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '₹--';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading && !data.metrics) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar userType="admin" />
        <div className="p-8 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !data.metrics) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar userType="admin" />
        <div className="p-8 text-center text-red-500">
          <FiAlertCircle className="inline-block text-2xl mb-2" />
          <p>Error loading dashboard: {error}</p>
          <button 
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userType="admin" />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">SBI Life Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
              {loading && <span className="ml-2 text-blue-600">• Refreshing...</span>}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <button 
              className="bg-violet-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-violet-700 transition-colors text-sm"
              onClick={fetchData}
              disabled={loading}
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-violet-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">Total Policies</h3>
                <p className="text-3xl font-bold mt-2 text-gray-900">
                  {formatNumber(data.metrics?.total_policies)}
                </p>
              </div>
              <FiActivity className="text-violet-500 text-2xl" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">Active Customers</h3>
                <p className="text-3xl font-bold mt-2 text-gray-900">
                  {formatNumber(data.metrics?.total_customers)}
                </p>
              </div>
              <FiUsers className="text-blue-500 text-2xl" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">Conversion Rate</h3>
                <p className="text-3xl font-bold mt-2 text-gray-900">
                  {data.metrics?.conversion_rate ? `${data.metrics.conversion_rate.toFixed(1)}%` : '--'}
                </p>
              </div>
              <FiTrendingUp className="text-green-500 text-2xl" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">Avg. Premium</h3>
                <p className="text-3xl font-bold mt-2 text-gray-900">
                  {formatCurrency(data.metrics?.avg_premium)}
                </p>
              </div>
              <FiDollarSign className="text-yellow-500 text-2xl" />
            </div>
          </div>
        </div>

        {/* Tracking Insights */}
        <div className="mb-8">
          <TrackingInsights 
  recentActivities={data.recent_activities || []}
  topPolicies={data.top_policies || []}
/>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Policy Performance</h2>
            {data.policy_performance ? (
              <div className="h-80">
                <BarChart data={data.policy_performance} />
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <FiActivity className="mx-auto text-3xl mb-2" />
                  <p>No policy performance data</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Customer Segments</h2>
            {data.customer_segments ? (
              <div className="h-80">
                <PieChart data={data.customer_segments} />
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <FiUsers className="mx-auto text-3xl mb-2" />
                  <p>No customer segment data</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Sales Trend</h2>
            {data.sales_trend ? (
              <div className="h-64">
                <LineChart data={data.sales_trend} />
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <FiTrendingUp className="mx-auto text-3xl mb-2" />
                  <p>No sales trend data</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Recent Customer Activity</h2>
            <div className="h-64 overflow-y-auto">
              {data.recent_activities ? (
                <RecentActivity activities={data.recent_activities} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <FiActivity className="mx-auto text-3xl mb-2" />
                    <p>No recent activity</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;