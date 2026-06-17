import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEmployeeDetail } from '../hooks/useEmployees';
import { useEmployeePersonalStats } from '../hooks/useAnalytics';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import { FiArrowLeft, FiMail, FiPhone, FiMapPin, FiClock, FiActivity, FiStar } from 'react-icons/fi';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: employeeData, isLoading: detailLoading, error: detailError } = useEmployeeDetail(id);
  const { data: statsData, isLoading: statsLoading, error: statsError } = useEmployeePersonalStats(id);

  if (detailLoading || statsLoading) {
    return <Loader message="Fetching employee profile..." />;
  }

  if (detailError || statsError) {
    return (
      <ErrorMessage 
        message={detailError?.response?.data?.message || statsError?.response?.data?.message || 'Failed to fetch employee details.'} 
        onRetry={() => navigate('/employees')}
      />
    );
  }

  const emp = employeeData?.data;
  const stats = statsData?.stats;
  const performance = statsData?.performance;

  if (!emp) {
    return <ErrorMessage message="Employee profile not found." onRetry={() => navigate('/employees')} />;
  }

  // Format charts for employee performance radar
  const performanceData = [
    { subject: 'Technical', value: performance?.metrics?.technicalSkill || 80, fullMark: 100 },
    { subject: 'Speed', value: performance?.metrics?.deliverySpeed || 75, fullMark: 100 },
    { subject: 'Quality', value: performance?.metrics?.codeQuality || 85, fullMark: 100 },
    { subject: 'Communication', value: performance?.metrics?.communication || 90, fullMark: 100 },
    { subject: 'Reliability', value: performance?.metrics?.reliability || 80, fullMark: 100 },
  ];

  const taskStatsData = [
    { name: 'Completed', count: stats?.completedTasks || emp.tasks?.length || 0 },
    { name: 'Active', count: stats?.activeTasks || 2 },
    { name: 'Pending', count: stats?.pendingTasks || 1 },
  ];

  return (
    <div className="space-y-6">
      {/* Back Button & Title */}
      <div className="flex items-center gap-4">
        <Button variant="secondary" onClick={() => navigate('/employees')} className="p-2">
          <FiArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Employee Profile</h1>
          <p className="text-sm text-brand-textMuted mt-0.5">Comprehensive view of skills, assignments, and ratings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Details Card */}
        <Card className="lg:col-span-1 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="text-center pb-6 border-b border-gray-800">
              <div className="h-20 w-20 rounded-full bg-brand-primary/10 border-2 border-brand-primary flex items-center justify-center text-brand-primary text-3xl font-bold mx-auto mb-4">
                {emp.name?.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-white flex justify-center items-center gap-2">
                {emp.name}
                {emp.isVerified && <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">Verified</span>}
              </h2>
              <p className="text-sm text-brand-textMuted capitalize mt-1">{emp.domain || 'Generalist'}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <FiMail className="text-brand-textMuted h-4.5 w-4.5 flex-shrink-0" />
                <span className="text-brand-text truncate">{emp.email}</span>
              </div>
              {emp.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <FiPhone className="text-brand-textMuted h-4.5 w-4.5 flex-shrink-0" />
                  <span className="text-brand-text">{emp.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <FiMapPin className="text-brand-textMuted h-4.5 w-4.5 flex-shrink-0" />
                <span className="text-brand-text">{emp.city ? `${emp.city}, ` : ''}{emp.state ? `${emp.state}, ` : ''}{emp.country || 'Global'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <FiClock className="text-brand-textMuted h-4.5 w-4.5 flex-shrink-0" />
                <span className="text-brand-text">Timezone: {emp.timezone || 'UTC'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <FiStar className="text-brand-textMuted h-4.5 w-4.5 flex-shrink-0" />
                <span className="text-brand-text">Experience: {emp.experience} Years</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Assignments & Skills Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skills Card */}
            <Card title="Skills & Certifications">
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-brand-textMuted uppercase mb-2">Core Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {emp.primarySkill && <Badge variant="info">Primary: {emp.primarySkill}</Badge>}
                    {emp.secondarySkill && <Badge variant="default">Secondary: {emp.secondarySkill}</Badge>}
                    {!emp.primarySkill && !emp.secondarySkill && <span className="text-xs text-brand-textMuted">No skills listed.</span>}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-brand-textMuted uppercase mb-2">Certifications</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {emp.certifications && emp.certifications.length > 0 ? (
                      emp.certifications.map((cert) => (
                        <Badge key={cert} variant="success">{cert}</Badge>
                      ))
                    ) : (
                      <span className="text-xs text-brand-textMuted">No certifications uploaded.</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Projects & Tasks Card */}
            <Card title="Current Allocation">
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-brand-textMuted uppercase mb-2">Projects</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {emp.projects && emp.projects.length > 0 ? (
                      emp.projects.map((proj) => (
                        <Badge key={proj} variant="info">{proj}</Badge>
                      ))
                    ) : (
                      <span className="text-xs text-brand-textMuted">No active projects.</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-brand-textMuted uppercase mb-2">Tasks</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {emp.tasks && emp.tasks.length > 0 ? (
                      emp.tasks.map((task) => (
                        <Badge key={task} variant="default">{task}</Badge>
                      ))
                    ) : (
                      <span className="text-xs text-brand-textMuted">No tasks pending.</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Performance Radar & Task Metrics Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Skill Metrics Assessment" subtitle="360 peer performance appraisal criteria">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={performanceData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="subject" stroke="#9CA3AF" fontSize={10} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#4B5563" fontSize={9} />
                    <Radar name={emp.name} dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.35} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Allocated Tasks Overview" subtitle="Breakdown of assigned tickets">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taskStatsData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }}
                      itemStyle={{ color: '#3B82F6' }}
                    />
                    <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;
