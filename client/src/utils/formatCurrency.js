/**
 * Formats a numeric value into a localized Indian Rupee currency representation.
 * @param {number} amount - The expense amount.
 * @returns {string} - Formatted currency string (e.g. ₹12,430.00).
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0.00';
  }
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};
