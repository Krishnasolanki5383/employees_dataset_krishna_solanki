import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { fetchStatsOverview, fetchAnalyticsData } from '../store/dataSlice';
import Card from '../components/ui/Card';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import { FiUsers, FiCheckCircle, FiAward, FiLayers, FiCheckSquare } from 'react-icons/fi';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const dispatch = useDispatch();

  const {
    statsOverview: stats,
    analyticsData: analytics,
    loadingStats,
    loadingAnalytics,
    errorStats,
    errorAnalytics
  } = useSelector((state) => state.data);

  useEffect(() => {
    dispatch(fetchStatsOverview());
    dispatch(fetchAnalyticsData());
  }, [dispatch]);

  const isLoading = loadingStats || loadingAnalytics || !stats || !analytics;
  const error = errorStats || errorAnalytics;

  if (isLoading) {
    return <Loader fullPage={false} message="Loading dashboard overview..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={() => {
          dispatch(fetchStatsOverview());
          dispatch(fetchAnalyticsData());
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
  const domainChartData = analytics.domainDistribution?.map((item) => ({
    name: item._id || 'Unknown',
    count: item.count
  })) || [];

  const expChartData = analytics.experienceAnalysis?.map((item) => ({
    name: item._id || 'Unknown',
    count: item.count
  })) || [];

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Dashboard | EMS Portal</title>
        <meta name="description" content="Overview dashboard showing employee demographics, experience stats, project metrics, and skill tallies." />
      </Helmet>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-text tracking-tight">Overview Dashboard</h1>
        <p className="text-sm text-brand-textMuted mt-1">Real-time statistics & visual department distribution</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.name} className="bg-brand-card border border-gray-800/10 rounded-xl p-5 shadow-lg flex items-center gap-4 transition-colors">
              <div className={`p-3 rounded-lg ${m.bg} ${m.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-brand-textMuted font-medium">{m.name}</p>
                <h3 className="text-xl font-bold text-brand-text mt-1">{m.value}</h3>
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
                  <XAxis dataKey="name" stroke="var(--color-brand-textMuted)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--color-brand-textMuted)" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-brand-card)', borderColor: 'var(--color-brand-textMuted)' }}
                    labelStyle={{ color: 'var(--color-brand-text)', fontWeight: 'bold' }}
                    itemStyle={{ color: 'var(--color-brand-primary)' }}
                  />
                  <Bar dataKey="count" fill="var(--color-brand-primary)" radius={[4, 4, 0, 0]} />
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
                      contentStyle={{ backgroundColor: 'var(--color-brand-card)', borderColor: 'var(--color-brand-textMuted)' }}
                      itemStyle={{ color: 'var(--color-brand-text)' }}
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
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-brand-bg border border-gray-800/10">
                  <div className="flex items-center gap-3">
                    <span className="h-6 w-6 rounded-md bg-brand-primary/10 text-brand-primary font-bold text-xs flex items-center justify-center border border-brand-primary/20">
                      {index + 1}
                    </span>
                    <span className="text-sm font-semibold text-brand-text">{skill._id || 'General'}</span>
                  </div>
                  <span className="text-xs text-brand-textMuted bg-brand-card px-2 py-1 rounded font-medium">
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
              <div key={index} className="flex flex-col gap-1.5 p-3 rounded-lg bg-brand-bg border border-gray-800/10">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-brand-text">{proj._id || 'Core System'}</span>
                  <span className="text-xs text-brand-primary font-medium">{proj.count} Active</span>
                </div>
                <div className="w-full bg-brand-card h-1.5 rounded-full overflow-hidden">
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

