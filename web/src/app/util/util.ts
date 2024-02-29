export const currencyFormat = (amount: number) => {
  return '$' + (amount / 100).toFixed(2);
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