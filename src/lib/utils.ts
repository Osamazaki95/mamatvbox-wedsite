import clsx, { type ClassValue } from 'clsx';

export const cn = (...inputs: ClassValue[]) => clsx(inputs);

const arDigits = '٠١٢٣٤٥٦٧٨٩';
export const toArabicDigits = (v: string | number) =>
  String(v).replace(/\d/g, (d) => arDigits[Number(d)]);

export const formatPrice = (amount: number, currency = 'ج.م') =>
  amount === 0 ? `٠,٠٠ ${currency}` : `${toArabicDigits(amount.toLocaleString('en-US'))} ${currency}`;
