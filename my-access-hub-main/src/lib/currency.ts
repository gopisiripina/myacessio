export const formatCurrency = (amount: number, currency: string = 'INR') => {
  // For INR, use Indian number formatting with rupee symbol
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
  
  // For other currencies, use standard formatting
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
  }).format(amount);
};