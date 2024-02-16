export interface IUser {
  sub: string; // sub guid
  email: string;
  isEmailVerified: boolean; // email_verified 'true' | 'false'
  givenName: string; // given_name
  familyName: string; // family_name
  address: string; // address
  billingAddress?: string | null; // custom:billing_address
}

export interface ICreateUser {
  email: string;
  givenName: string; // given_name
  familyName: string; // family_name
  address: string; // address
  password: string;
  confirmPassword: string;
}
