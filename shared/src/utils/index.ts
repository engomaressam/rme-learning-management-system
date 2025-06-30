// Date utilities
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  return date >= startDate && date <= endDate;
};

// String utilities
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str: string): string => {
  return str.split(' ').map(capitalize).join(' ');
};

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Number utilities
export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

// Array utilities
export const groupBy = <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

export const uniqueBy = <T, K extends keyof T>(array: T[], key: K): T[] => {
  const seen = new Set();
  return array.filter(item => {
    const val = item[key];
    if (seen.has(val)) return false;
    seen.add(val);
    return true;
  });
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidTime = (time: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

// Attendance utilities
export const calculateAttendancePercentage = (presentCount: number, totalSessions: number): number => {
  if (totalSessions === 0) return 0;
  return Math.round((presentCount / totalSessions) * 100);
};

export const isAttendanceCompliant = (attendancePercentage: number, requiredPercentage = 70): boolean => {
  return attendancePercentage >= requiredPercentage;
};

// ID generation utilities
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const generateCertificateNumber = (courseId: string, userId: string): string => {
  const timestamp = Date.now().toString(36);
  const coursePrefix = courseId.substring(0, 4).toUpperCase();
  const userSuffix = userId.substring(userId.length - 4).toUpperCase();
  return `CERT-${coursePrefix}-${timestamp}-${userSuffix}`;
};

// File utilities
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

export const isImageFile = (filename: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  return imageExtensions.includes(getFileExtension(filename));
};

export const isPdfFile = (filename: string): boolean => {
  return getFileExtension(filename) === 'pdf';
};

export const isCsvFile = (filename: string): boolean => {
  return getFileExtension(filename) === 'csv';
};

export const isExcelFile = (filename: string): boolean => {
  const excelExtensions = ['xls', 'xlsx'];
  return excelExtensions.includes(getFileExtension(filename));
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Notification utilities
export const getNotificationIcon = (type: string): string => {
  const icons: Record<string, string> = {
    PLAN_ASSIGNED: '📚',
    COURSE_ASSIGNED: '📖',
    ROUND_ADDED: '🎯',
    ENROLLED: '✅',
    REMINDER: '⏰',
    COURSE_COMPLETED: '🎉',
    CERTIFICATE_READY: '🏆',
    SURVEY_DUE: '📝'
  };
  
  return icons[type] || '📢';
};

// Status utilities
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    ACTIVE: 'green',
    DRAFT: 'yellow',
    ARCHIVED: 'gray',
    SCHEDULED: 'blue',
    ONGOING: 'orange',
    COMPLETED: 'green',
    CANCELLED: 'red',
    ENROLLED: 'blue',
    DROPPED: 'red',
    WAITLISTED: 'yellow',
    ASSIGNED: 'blue',
    IN_PROGRESS: 'orange',
    OVERDUE: 'red',
    PENDING: 'yellow',
    EXPIRED: 'gray'
  };
  
  return colors[status] || 'gray';
};

// Search utilities
export const highlightSearchTerm = (text: string, searchTerm: string): string => {
  if (!searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

export const fuzzySearch = <T>(items: T[], searchTerm: string, searchKeys: (keyof T)[]): T[] => {
  if (!searchTerm) return items;
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  return items.filter(item => 
    searchKeys.some(key => {
      const value = String(item[key]).toLowerCase();
      return value.includes(lowerSearchTerm);
    })
  );
};

// Export utilities
export const downloadFile = (data: string, filename: string, type = 'text/plain'): void => {
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const exportToCSV = <T extends Record<string, any>>(data: T[], filename: string): void => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    )
  ].join('\n');
  
  downloadFile(csvContent, filename, 'text/csv');
};

// Constants
export const ATTENDANCE_THRESHOLD = 70;
export const SURVEY_DELAY_MONTHS = 3;
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

// Time constants
export const TIME_FORMATS = {
  DATE_SHORT: 'MMM dd, yyyy',
  DATE_LONG: 'MMMM dd, yyyy',
  DATETIME_SHORT: 'MMM dd, yyyy h:mm a',
  DATETIME_LONG: 'MMMM dd, yyyy h:mm:ss a',
  TIME_12H: 'h:mm a',
  TIME_24H: 'HH:mm'
}; 