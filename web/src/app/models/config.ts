export const config = {
  COGNITO: {
    USER_POOL_ID: import.meta.env.VITE_USER_POOL_ID || '',
    CLIENT_ID: import.meta.env.VITE_CLIENT_ID || '',
    COGNITO_DOMAIN: import.meta.env.VITE_COGNITO_DOMAIN || '',
  },
};
