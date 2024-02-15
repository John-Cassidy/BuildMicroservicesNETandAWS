import React, { PropsWithChildren, useCallback } from 'react';

import { CognitoAccessToken } from 'amazon-cognito-identity-js';

interface AuthContextType {
  accessToken: CognitoAccessToken | null;
  setToken: (accessToken: CognitoAccessToken | null) => void;
  clearToken: () => void;
  isAdmin: () => boolean;
  isManager: () => boolean;
}

export const AuthContext = React.createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: PropsWithChildren<unknown>) => {
  const [accessToken, setAccessToken] =
    React.useState<CognitoAccessToken | null>(null);

  const setToken = useCallback(
    (token: CognitoAccessToken | null) => {
      setAccessToken(token);
    },
    [setAccessToken]
  );

  const clearToken = useCallback(() => {
    setAccessToken(null);
  }, [setAccessToken]);

  const isAdmin = useCallback(() => {
    if (accessToken) {
      const payload = accessToken.decodePayload();
      return payload['cognito:groups']?.includes('Admin') ?? false;
    }
    return false;
  }, [accessToken]);

  const isManager = useCallback(() => {
    if (accessToken) {
      const payload = accessToken.decodePayload();
      return payload['cognito:groups']?.includes('Manager') ?? false;
    }
    return false;
  }, [accessToken]);

  return (
    <AuthContext.Provider
      value={{ accessToken, setToken, clearToken, isAdmin, isManager }}
    >
      {children}
    </AuthContext.Provider>
  );
};
