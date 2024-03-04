import { Hotel } from './hotel';

export interface Booking {
  id: string;
  userId: string;
  hotel: Hotel;
  checkIn: Date | null;
  checkOut: Date | null;
}
