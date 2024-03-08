import { Hotel } from './hotel';

export interface Booking {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  hotel: Hotel;
  checkIn: Date | null;
  checkOut: Date | null;
}
