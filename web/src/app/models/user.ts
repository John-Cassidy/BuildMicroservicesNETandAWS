export interface IUser {
  username: string;
  password: string;
  email: string;
  givenName: string;
  familyName: string;
  address: string;
  billingAddress: string | null;
}
