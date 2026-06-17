export const API_URLs = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    profile: '/auth/profile',
  },
  employees: {
    base: '/employees',
    bulkCreate: '/employees/bulk-create',
    bulkDelete: '/employees/bulk-delete',
  },
  stats: {
    count: '/stats/employees/count',
    verifiedCount: '/stats/employees/verified-count',
    averageExperience: '/stats/employees/experience-average',
    projectCount: '/stats/employees/project-count',
    taskCount: '/stats/employees/task-count',
  },
  analytics: {
    skills: '/analytics/employees/skill-distribution',
    domains: '/analytics/employees/domain-distribution',
    experience: '/analytics/employees/experience-analysis',
    verification: '/analytics/employees/verification-analysis',
    timezones: '/analytics/employees/timezone-analysis',
    topSkills: '/analytics/employees/top-skills',
    topProjects: '/analytics/employees/top-projects',
  }
};

export const DOMAINS = [
  'Engineering',
  'Product',
  'Marketing',
  'Sales',
  'HR',
  'Design'
];

export const COUNTRIES = [
  'USA',
  'India',
  'Canada',
  'UK',
  'Germany',
  'Australia',
  'Singapore'
];

export const SKILL_PRESETS = [
  'JavaScript',
  'TypeScript',
  'Node.js',
  'React',
  'Vue',
  'Python',
  'Java',
  'Go',
  'Kubernetes',
  'AWS',
  'Docker',
  'MongoDB',
  'PostgreSQL',
  'GraphQL'
];
