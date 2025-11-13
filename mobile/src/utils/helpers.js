/**
 * Helper Utilities
 * Common helper functions
 */

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  return `${formatDate(dateString)} at ${formatTime(dateString)}`;
};

export const getMoodEmoji = (score) => {
  if (score <= 3) return '😢';
  if (score <= 5) return '😐';
  if (score <= 7) return '🙂';
  return '😊';
};

export const getMoodLabel = (score) => {
  if (score <= 3) return 'Not well';
  if (score <= 5) return 'Okay';
  if (score <= 7) return 'Good';
  return 'Great';
};

export const getSessionTypeLabel = (type) => {
  const labels = {
    'check-in': 'Check-in',
    'gentle_deep': 'Gentle Deep',
    'micro_practice': 'Micro Practice',
  };
  return labels[type] || type;
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

