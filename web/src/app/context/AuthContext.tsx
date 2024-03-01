import {
  CognitoAccessToken,
  CognitoIdToken,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';
import React, { PropsWithChildren, useCallback } from 'react';

import { IUser } from '../models/user';
import { setGetIdToken } from './authHelper';

interface AuthContextType {
  accessToken: CognitoAccessToken | null;
  idToken: CognitoIdToken | null;
  user: IUser | null;
  setAccessToken: (accessToken: CognitoAccessToken | null) => void;
  setIdToken: (idToken: CognitoIdToken | null) => void;
  setUserDetails: (attributes: CognitoUserAttribute[] | undefined) => void;
  clearToken: () => void;
  isAdmin: () => boolean;
  isManager: () => boolean;
  isMember: () => boolean;
}

export const AuthContext = React.createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: PropsWithChildren<unknown>) => {
  const [accessToken, setAccessToken] =
    React.useState<CognitoAccessToken | null>(null);
  const [idToken, setIdToken] = React.useState<CognitoIdToken | null>(null);
  const [user, setUser] = React.useState<IUser | null>(null);

  // Update this function inside the AuthProvider component
  setGetIdToken(() => {
    return idToken ?? null;
  });

  const setUserDetails = useCallback(
    (attributes: CognitoUserAttribute[] | undefined) => {
      if (attributes) {
        const user: IUser = {} as IUser;
        attributes.forEach((attribute) => {
          switch (attribute.getName()) {
            case 'sub':
              user.sub = attribute.getValue();
              break;
            case 'email':
              user.email = attribute.getValue();
              break;
            case 'email_verified':
              user.isEmailVerified = attribute.getValue() === 'true';
              break;
            case 'given_name':
              user.givenName = attribute.getValue();
              break;
            case 'family_name':
              user.familyName = attribute.getValue();
              break;
            case 'address':
              user.address = attribute.getValue();
              break;
            default:
              break;
          }
        });
        setUser(user);
      } else {
        setUser(null);
      }
    },
    [setUser]
  );

  const clearToken = useCallback(() => {
    setAccessToken(null);
    setIdToken(null);
    setUserDetails(undefined);
  }, [setAccessToken, setIdToken, setUserDetails]);

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
      return payload['cognito:groups']?.includes('HotelManager') ?? false;
    }
    return false;
  }, [accessToken]);

  const isMember = useCallback(() => {
    if (accessToken) {
      const payload = accessToken.decodePayload();
      return payload['cognito:groups']?.includes('Member') ?? false;
    }
    return false;
  }, [accessToken]);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        idToken,
        user,
        setAccessToken,
        setIdToken,
        setUserDetails,
        clearToken,
        isAdmin,
        isManager,
        isMember,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
