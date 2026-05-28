const amountFormatter = new Intl.NumberFormat('ar', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('ar', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

export function formatAmount(value: number | string | null | undefined) {
  const numericValue = Number(value || 0);
  return amountFormatter.format(numericValue);
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return 'بدون تاريخ';
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'تاريخ غير صالح';
  }

  return dateFormatter.format(date);
}
