import React from 'react';
import { useStatsOverview, useAnalyticsData } from '../hooks/useAnalytics';
import Card from '../components/ui/Card';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import { FiUsers, FiCheckCircle, FiAward, FiLayers, FiCheckSquare } from 'react-icons/fi';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useStatsOverview();
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError, refetch: refetchAnalytics } = useAnalyticsData();

  if (statsLoading || analyticsLoading) {
    return <Loader fullPage={false} message="Loading dashboard overview..." />;
  }

  if (statsError || analyticsError) {
    const errorMsg = statsError?.response?.data?.message || analyticsError?.response?.data?.message || 'Failed to fetch dashboard data.';
    return (
      <ErrorMessage 
        message={errorMsg} 
        onRetry={() => {
          refetchStats();
          refetchAnalytics();
        }} 
      />
    );
  }

  // Cards stats mapping
  const metrics = [
    { name: 'Total Headcount', value: stats.total, icon: FiUsers, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: 'Verified Employees', value: stats.verified, icon: FiCheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { name: 'Avg. Experience', value: `${stats.averageExperience?.toFixed(1) || 0} Yrs`, icon: FiAward, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { name: 'Total Projects', value: stats.totalProjects, icon: FiLayers, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { name: 'Assigned Tasks', value: stats.totalTasks, icon: FiCheckSquare, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  ];

  // Recharts color presets
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#374151'];

  // Format charts data
  const domainChartData = analytics.domainDistribution?.map((item, idx) => ({
    name: item._id || 'Unknown',
    count: item.count
  })) || [];

  const expChartData = analytics.experienceAnalysis?.map((item) => ({
    name: item._id || 'Unknown',
    count: item.count
  })) || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Overview Dashboard</h1>
        <p className="text-sm text-brand-textMuted mt-1">Real-time statistics & visual department distribution</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.name} className="bg-brand-card border border-gray-800 rounded-xl p-5 shadow-lg flex items-center gap-4">
              <div className={`p-3 rounded-lg ${m.bg} ${m.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-brand-textMuted font-medium">{m.name}</p>
                <h3 className="text-xl font-bold text-white mt-1">{m.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain Distribution Bar Chart */}
        <Card title="Employees by Domain" subtitle="Count of employees grouped by specialization">
          {domainChartData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={domainChartData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }}
                    labelStyle={{ color: '#F9FAFB', fontWeight: 'bold' }}
                    itemStyle={{ color: '#3B82F6' }}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-brand-textMuted text-sm">
              No domain distribution data available.
            </div>
          )}
        </Card>

        {/* Experience Levels Pie Chart */}
        <Card title="Experience Distribution" subtitle="Seniority bands across the organization">
          {expChartData.length > 0 ? (
            <div className="h-80 flex flex-col md:flex-row items-center justify-center gap-6">
              <div className="w-full md:w-1/2 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {expChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }}
                      itemStyle={{ color: '#F9FAFB' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend List */}
              <div className="w-full md:w-1/2 space-y-2.5">
                {expChartData.map((item, idx) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <span 
                      className="h-3 w-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }} 
                    />
                    <div className="flex justify-between w-full text-sm">
                      <span className="text-brand-text font-medium capitalize">{item.name}</span>
                      <span className="text-brand-textMuted">{item.count} Employees</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-brand-textMuted text-sm">
              No experience level distribution data available.
            </div>
          )}
        </Card>
      </div>

      {/* Top Performing Skills list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Top Core Skills" subtitle="Most common skill sets in demand" className="lg:col-span-2">
          <div className="overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {analytics.topSkills?.slice(0, 6).map((skill, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-brand-bg border border-gray-800">
                  <div className="flex items-center gap-3">
                    <span className="h-6 w-6 rounded-md bg-brand-primary/10 text-brand-primary font-bold text-xs flex items-center justify-center border border-brand-primary/20">
                      {index + 1}
                    </span>
                    <span className="text-sm font-semibold text-white">{skill._id || 'General'}</span>
                  </div>
                  <span className="text-xs text-brand-textMuted bg-gray-800 px-2 py-1 rounded font-medium">
                    {skill.count} Experts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card title="Project Portfolios" subtitle="Active client/internal projects">
          <div className="space-y-3">
            {analytics.topProjects?.slice(0, 4).map((proj, index) => (
              <div key={index} className="flex flex-col gap-1.5 p-3 rounded-lg bg-brand-bg border border-gray-800">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-white">{proj._id || 'Core System'}</span>
                  <span className="text-xs text-brand-primary font-medium">{proj.count} Active</span>
                </div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-brand-primary h-full rounded-full" 
                    style={{ width: `${Math.min(100, (proj.count / (stats.total || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
