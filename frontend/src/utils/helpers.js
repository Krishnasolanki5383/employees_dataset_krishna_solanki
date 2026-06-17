/**
 * Formats an ISO date string to a human-readable format.
 * E.g., "2026-06-17T11:21:30Z" -> "Jun 17, 2026"
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

/**
 * Extracts initials from a full name.
 * E.g., "John Doe" -> "JD"
 */
export const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

/**
 * Formats currency or experience counts cleanly.
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return Number(num).toLocaleString();
};

/**
 * Truncates text with ellipses if it exceeds a specified limit.
 */
export const truncateText = (text, limit = 30) => {
  if (!text) return '';
  if (text.length <= limit) return text;
  return `${text.slice(0, limit)}...`;
};
