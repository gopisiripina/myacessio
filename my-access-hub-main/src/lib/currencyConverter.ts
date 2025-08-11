// Exchange rates - in a real app, these would come from an API
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1, // Base currency
  INR: 83.50, // 1 USD = 83.50 INR (approximate)
  EUR: 0.85,
  GBP: 0.73,
  AUD: 1.50,
  CAD: 1.35,
};

export interface CurrencyTotal {
  amount: number;
  currency: string;
}

export interface MultiCurrencyTotal {
  totals: CurrencyTotal[];
  convertedToUSD: number;
  convertedToINR: number;
}

export function convertToUSD(amount: number, fromCurrency: string): number {
  if (fromCurrency === 'USD') return amount;
  const rate = EXCHANGE_RATES[fromCurrency];
  if (!rate) return amount; // Fallback if currency not supported
  return amount / rate;
}

export function convertToINR(amount: number, fromCurrency: string): number {
  if (fromCurrency === 'INR') return amount;
  const usdAmount = convertToUSD(amount, fromCurrency);
  return usdAmount * EXCHANGE_RATES.INR;
}

export function aggregateMultiCurrencyAmounts(amounts: Array<{ amount: number; currency: string }>): MultiCurrencyTotal {
  // Group by currency
  const currencyTotals: Record<string, number> = {};
  
  amounts.forEach(({ amount, currency }) => {
    currencyTotals[currency] = (currencyTotals[currency] || 0) + amount;
  });

  const totals: CurrencyTotal[] = Object.entries(currencyTotals).map(([currency, amount]) => ({
    currency,
    amount
  }));

  // Convert to USD and INR for comparison
  const convertedToUSD = totals.reduce((sum, { amount, currency }) => {
    return sum + convertToUSD(amount, currency);
  }, 0);

  const convertedToINR = totals.reduce((sum, { amount, currency }) => {
    return sum + convertToINR(amount, currency);
  }, 0);

  return {
    totals,
    convertedToUSD,
    convertedToINR
  };
}