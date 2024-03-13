import { BookingDto, BookingDtoListResponse } from '../../app/models/booking';
import { useEffect, useState } from 'react';

import { BookingCard } from './BookingCard';
import { Grid } from '@mui/material';
import { LoadingComponent } from '../../app/layout/LoadingComponent';
import { agent } from '../../app/api/agent';

export const Bookings = () => {
  const [reload, setReload] = useState(false); // new state variable
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<
    BookingDto | undefined
  >(undefined);

  useEffect(() => {
    agent.Member.getBookings()
      .then((response: BookingDtoListResponse<BookingDto>) => {
        const bookingsWithStatus = response.data.bookings.map((booking) => {
          return {
            ...booking,
          };
        });
        setBookings(bookingsWithStatus);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => setLoading(false));
  }, [reload]);

  const cancelBooking = () => {
    setSelectedBooking(undefined);
  };

  if (loading) return <LoadingComponent message='Loading hotels...' />;

  // if (selectedBooking)
  //   return (
  //     <EditBooking cancelBooking={cancelBooking} hotel={selectedBooking} />
  //   );

  return (
    <Grid container spacing={3}>
      {bookings.map((booking) => (
        <Grid item xs={4} key={booking.id}>
          <BookingCard booking={booking} />
        </Grid>
      ))}
    </Grid>
  );
};
