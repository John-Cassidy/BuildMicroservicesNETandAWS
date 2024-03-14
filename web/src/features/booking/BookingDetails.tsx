import {
  BookingDto,
  BookingStatus,
  getBookingStatus,
} from '../../app/models/booking';
import {
  Button,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material';
import {
  calculateTotalPrice,
  currencyFormat,
  formatDate,
} from '../../app/util/util';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { EditBooking } from './EditBooking';
import { LoadingComponent } from '../../app/layout/LoadingComponent';
import { agent } from '../../app/api/agent';

export const BookingDetails = () => {
  const [reload, setReload] = useState(false); // new state variable
  const [booking, setBooking] = useState<BookingDto>({} as BookingDto);
  const [selectedBooking, setSelectedBooking] = useState<
    BookingDto | undefined
  >(undefined);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (!id) {
      navigation('/booking');
    }
    agent.Member.getBooking(id!)
      .then((response: any) => {
        // response.data.booking.checkIn = new Date(response.data.booking.checkIn);
        // response.data.booking.checkOut = new Date(
        //   response.data.booking.checkOut
        // );
        setBooking(response.data.booking);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => setLoading(false));
  }, [id, navigation, reload]);

  if (loading)
    return <LoadingComponent message='Loading booking information...' />;

  const cancelEdit = () => {
    setSelectedBooking(undefined);
    setReload(!reload); // toggle reload state to trigger useEffect
  };

  if (selectedBooking)
    return <EditBooking cancelEdit={cancelEdit} booking={selectedBooking} />;

  return (
    <Grid container spacing={6}>
      <Grid item xs={6}>
        <Typography variant='h4'>
          Hotel Information
          <Button
            variant='contained'
            color='primary'
            sx={{ ml: 2 }}
            disabled={booking.status == BookingStatus.Pending ? true : false}
            onClick={() => {
              setSelectedBooking(booking);
            }}
          >
            EDIT
          </Button>
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <TableContainer>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Hotel</TableCell>
                <TableCell>{booking.hotelName}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>City</TableCell>
                <TableCell>{booking.hotelCity}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Rating</TableCell>
                <TableCell>{booking.hotelRating}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Price (per night)</TableCell>
                <TableCell>{currencyFormat(booking.hotelPrice)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      <Grid item xs={6}>
        <img
          src={`${agent.S3URLS.Hotel_Image_URL}/${booking.hotelFileName}`}
          alt={booking.hotelName}
          style={{ width: '100%' }}
        />
      </Grid>
      <Grid item xs={12}>
        <Typography variant='h4'>Customer Information</Typography>
        <Divider sx={{ mb: 2 }} />
        <TableContainer>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>
                  {booking.firstName} {booking.lastName}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>{booking.email}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Address</TableCell>
                <TableCell>{booking.address}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      <Grid item xs={12}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant='h4'>Booking Information</Typography>
        <Divider sx={{ mb: 2 }} />
        <TableContainer>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Check In</TableCell>
                <TableCell>{formatDate(booking.checkIn)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Check Out</TableCell>
                <TableCell>{formatDate(booking.checkOut)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell>{getBookingStatus(booking.status)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Total Price</TableCell>
                <TableCell>
                  {currencyFormat(
                    calculateTotalPrice(
                      booking.checkIn,
                      booking.checkOut,
                      booking.hotelPrice
                    )
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );
};
