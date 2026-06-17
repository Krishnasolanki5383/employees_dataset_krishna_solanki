import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';

export const useStatsOverview = () => {
  return useQuery({
    queryKey: ['stats-overview'],
    queryFn: async () => {
      const [totalRes, verifiedRes, avgExpRes, totalProjectsRes, totalTasksRes] = await Promise.all([
        axiosInstance.get('/stats/employees/count'),
        axiosInstance.get('/stats/employees/verified-count'),
        axiosInstance.get('/stats/employees/experience-average'),
        axiosInstance.get('/stats/employees/project-count'),
        axiosInstance.get('/stats/employees/task-count'),
      ]);

      return {
        total: totalRes.data.data.count,
        verified: verifiedRes.data.data.count,
        averageExperience: avgExpRes.data.data.averageExperience,
        totalProjects: totalProjectsRes.data.data.count,
        totalTasks: totalTasksRes.data.data.count,
      };
    }
  });
};

export const useAnalyticsData = () => {
  return useQuery({
    queryKey: ['analytics-data'],
    queryFn: async () => {
      const [
        skillsDist,
        domainDist,
        expAnalysis,
        verificationAnalysis,
        timezoneAnalysis,
        topSkills,
        topProjects
      ] = await Promise.all([
        axiosInstance.get('/analytics/employees/skill-distribution'),
        axiosInstance.get('/analytics/employees/domain-distribution'),
        axiosInstance.get('/analytics/employees/experience-analysis'),
        axiosInstance.get('/analytics/employees/verification-analysis'),
        axiosInstance.get('/analytics/employees/timezone-analysis'),
        axiosInstance.get('/analytics/employees/top-skills'),
        axiosInstance.get('/analytics/employees/top-projects')
      ]);

      return {
        skillsDistribution: skillsDist.data.data,
        domainDistribution: domainDist.data.data,
        experienceAnalysis: expAnalysis.data.data,
        verificationAnalysis: verificationAnalysis.data.data,
        timezoneAnalysis: timezoneAnalysis.data.data,
        topSkills: topSkills.data.data,
        topProjects: topProjects.data.data
      };
    }
  });
};

export const useEmployeePersonalStats = (id) => {
  return useQuery({
    queryKey: ['employee-personal-stats', id],
    queryFn: async () => {
      const [perfRes, statsRes] = await Promise.all([
        axiosInstance.get(`/employees/performance/${id}`),
        axiosInstance.get(`/employees/stats/${id}`),
      ]);
      return {
        performance: perfRes.data.data,
        stats: statsRes.data.data,
      };
    },
    enabled: !!id
  });
};
