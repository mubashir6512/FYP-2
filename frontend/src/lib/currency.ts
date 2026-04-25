// Currency utility for Pakistan (PKR)
export const formatCurrency = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `Rs ${num.toLocaleString('en-PK')}`;
};

export const CURRENCY_SYMBOL = 'Rs';
export const CURRENCY_CODE = 'PKR';
