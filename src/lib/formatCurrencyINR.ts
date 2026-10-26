const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function formatCurrencyINR(amountINR: number): string {
  return inrFormatter.format(amountINR);
}

export function formatISTDateLabel(dateIST: string): string {
  const parts = dateIST.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return dateIST;
  const dateObj = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 6, 0, 0));
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(dateObj);
}

export function formatISTShortDay(dateIST: string): { weekday: string; dayNum: string; monthShort: string } {
  const parts = dateIST.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    return { weekday: 'Day', dayNum: dateIST, monthShort: '' };
  }
  const dateObj = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 6, 0, 0));
  const weekday = new Intl.DateTimeFormat('en-IN', { weekday: 'short', timeZone: 'Asia/Kolkata' }).format(dateObj);
  const dayNum = new Intl.DateTimeFormat('en-IN', { day: '2-digit', timeZone: 'Asia/Kolkata' }).format(dateObj);
  const monthShort = new Intl.DateTimeFormat('en-IN', { month: 'short', timeZone: 'Asia/Kolkata' }).format(dateObj);
  return { weekday, dayNum, monthShort };
}
