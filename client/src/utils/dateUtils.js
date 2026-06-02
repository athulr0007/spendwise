import { format, parseISO, isValid } from 'date-fns';

/**
 * Formats a Date object or ISO string into a human-readable format.
 * @param {string|Date} dateString - The target date.
 * @param {string} formatStr - The date-fns format string.
 * @returns {string} - Formatted date string (e.g. 15 Jun 2026).
 */
export const formatDate = (dateString, formatStr = 'dd MMM yyyy') => {
  if (!dateString) return '';
  
  const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
  return isValid(date) ? format(date, formatStr) : 'Invalid Date';
};

/**
 * Formats a Date object or ISO string into an HTML date input compatible format (YYYY-MM-DD).
 * @param {string|Date} dateString - The target date.
 * @returns {string} - Formatted date string (e.g. 2026-06-15).
 */
export const formatInputDate = (dateString) => {
  if (!dateString) return '';
  
  const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
  return isValid(date) ? format(date, 'yyyy-MM-dd') : '';
};
