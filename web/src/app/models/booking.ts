export interface Booking {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  hotelId: string;
  checkIn: Date | null;
  checkOut: Date | null;
  status: BookingStatus;
}

export interface BookingListResponse<T extends object> {
  data: {
    bookings: T[];
  };
}

export interface NewBooking {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  hotelId: string;
  checkIn: Date | null;
  checkOut: Date | null;
}

export enum BookingStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Cancelled = 'Cancelled',
}

export interface BookingDto {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  hotelId: string;
  hotelName: string;
  hotelCity: string;
  hotelPrice: number;
  hotelRating: string;
  hotelFileName: string;
  checkIn: Date | null;
  checkOut: Date | null;
  status: BookingStatus;
}

export interface BookingDtoListResponse<T extends object> {
  data: {
    bookings: T[];
  };
}

export const getBookingStatus = (statusNumber: BookingStatus): string => {
  switch (statusNumber as unknown as number) {
    case 1:
      return BookingStatus.Pending;
    case 2:
      return BookingStatus.Confirmed;
    case 3:
      return BookingStatus.Cancelled;
    default:
      return '';
  }
};
