import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { fetchAnalyticsData } from '../store/dataSlice';
import Card from '../components/ui/Card';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

const Analytics = () => {
  const dispatch = useDispatch();

  const {
    analyticsData: analytics,
    loadingAnalytics,
    errorAnalytics
  } = useSelector((state) => state.data);

  useEffect(() => {
    dispatch(fetchAnalyticsData());
  }, [dispatch]);

  const isLoading = loadingAnalytics || !analytics;
  const error = errorAnalytics;

  if (isLoading) {
    return <Loader message="Compiling database analytics breakdowns..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={() => dispatch(fetchAnalyticsData())}
      />
    );
  }

  // Skills Distribution
  const skillsData = analytics.skillsDistribution?.map(item => ({
    name: item._id || 'General',
    count: item.count
  })).slice(0, 10) || [];

  // Timezone Distribution
  const timezoneData = analytics.timezoneAnalysis?.map(item => ({
    name: item._id || 'UTC',
    count: item.count
  })) || [];

  // Verification Breakdown
  const verificationData = analytics.verificationAnalysis?.map(item => ({
    name: item._id ? 'Verified' : 'Pending Verification',
    count: item.count
  })) || [];

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Analytics & Reports | EMS Portal</title>
        <meta name="description" content="View company analytics, skill frequencies, timezone divisions, and profile verification status statistics." />
      </Helmet>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-text tracking-tight">System Analytics Breakdown</h1>
        <p className="text-sm text-brand-textMuted mt-1">Deep-dive charts and organization distributions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills distribution */}
        <Card title="Skill Inventory Spread" subtitle="Frequency counts of primary skills across employees">
          {skillsData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillsData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
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
              No skills data available.
            </div>
          )}
        </Card>

        {/* Verification Status */}
        <Card title="Verification Coverage" subtitle="Ratio of verified profiles vs pending approvals">
          {verificationData.length > 0 ? (
            <div className="h-80 flex flex-col md:flex-row items-center justify-center gap-6">
              <div className="w-full md:w-1/2 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={verificationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {verificationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : '#F59E0B'} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--color-brand-card)', borderColor: 'var(--color-brand-textMuted)' }}
                      itemStyle={{ color: 'var(--color-brand-text)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full md:w-1/2 space-y-4">
                {verificationData.map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between p-3 bg-brand-bg border border-gray-800/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: idx === 0 ? '#10B981' : '#F59E0B' }} />
                      <span className="text-sm font-semibold text-brand-text">{item.name}</span>
                    </div>
                    <span className="text-xs text-brand-textMuted font-medium bg-brand-card px-2 py-1 rounded">
                      {item.count} Profiles
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-brand-textMuted text-sm">
              No verification statistics available.
            </div>
          )}
        </Card>
      </div>

      {/* Timezone Distribution */}
      <Card title="Timezone Distributions" subtitle="Active work zones of operations">
        {timezoneData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={timezoneData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                <XAxis type="number" stroke="var(--color-brand-textMuted)" fontSize={11} tickLine={false} />
                <YAxis type="category" dataKey="name" stroke="var(--color-brand-textMuted)" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--color-brand-card)', borderColor: 'var(--color-brand-textMuted)' }}
                  itemStyle={{ color: 'var(--color-brand-text)' }}
                />
                <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-brand-textMuted text-sm">
            No timezone records found.
          </div>
        )}
      </Card>
    </div>
  );
};

export default Analytics;

