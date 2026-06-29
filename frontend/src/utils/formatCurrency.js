export const fmt = (amount) =>
  '₹' + Math.round(amount).toLocaleString('en-IN')