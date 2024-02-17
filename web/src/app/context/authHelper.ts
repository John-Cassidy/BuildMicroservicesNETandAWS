import { CognitoIdToken } from 'amazon-cognito-identity-js';

let getIdToken: () => CognitoIdToken | null = () => null;

export const setGetIdToken = (newGetIdToken: () => CognitoIdToken | null) => {
  getIdToken = newGetIdToken;
};

export { getIdToken };
