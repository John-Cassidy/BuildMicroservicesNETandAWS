import { config } from '../../app/models/config';

export const poolData = {
  UserPoolId: config.COGNITO.USER_POOL_ID,
  ClientId: config.COGNITO.CLIENT_ID,
  CognitoDomain: config.COGNITO.COGNITO_DOMAIN,
  TokenScopesArray: ['email', 'openid', 'profile'],
  RedirectUriSignIn: 'http://localhost:5092/',
  RedirectUriSignOut: 'http://localhost:5092/',
  AdvancedSecurityDataCollectionFlag: false,
  Storage: window.localStorage,
};
