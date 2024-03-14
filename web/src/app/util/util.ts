import { FieldValues } from 'react-hook-form';

export const currencyFormat = (amount: number) => {
  return '$' + (amount / 100).toFixed(2);
};

export function calculateTotalPrice(
  checkIn: Date | null | undefined,
  checkOut: Date | null | undefined,
  price: number
): number {
  if (checkIn && checkOut) {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const firstDate = new Date(checkIn);
    const secondDate = new Date(checkOut);

    const days = Math.round(
      Math.abs((firstDate.getTime() - secondDate.getTime()) / oneDay)
    );
    return days * price;
  }
  return 0;
}

export const formatDate = (date: Date | string | null) => {
  return date ? new Date(date).toLocaleDateString() : '';
};

// Utility function to convert string to camelCase
const toCamelCase = (str: string) => {
  return str.replace(/([-_][a-z])/gi, ($1) => {
    return $1.toUpperCase().replace('-', '').replace('_', '');
  });
};

// Function to recursively convert object keys to camelCase
export const convertKeysToCamelCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map((v) => convertKeysToCamelCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      result[toCamelCase(key)] = convertKeysToCamelCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
};

export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const isValidDate = (data: FieldValues, fieldName: string): boolean => {
  if (data[fieldName] === null || data[fieldName] === undefined) {
    return false;
  }

  const date = new Date(data[fieldName]);
  return !isNaN(date.getTime());
};
