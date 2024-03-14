import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Typography,
} from '@mui/material';
import { BookingDto, getBookingStatus } from '../../app/models/booking';
import {
  calculateTotalPrice,
  currencyFormat,
  formatDate,
} from '../../app/util/util';

import { Link } from 'react-router-dom';
import { agent } from '../../app/api/agent';

interface Props {
  booking: BookingDto;
}
export const BookingCard = ({ booking }: Props) => {
  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'secondary.main' }}>
            {booking.hotelName.charAt(0).toUpperCase()}
          </Avatar>
        }
        title={booking.hotelName}
        titleTypographyProps={{
          sx: { fontWeight: 'bold', color: 'primary.main' },
        }}
      />
      <CardMedia
        sx={{
          height: 218,
          backgroundSize: 'contain',
          bgcolor: 'primary.light',
        }}
        image={`${agent.S3URLS.Hotel_Image_URL}/${booking.hotelFileName}`}
        title={booking.hotelName}
      />
      <CardContent>
        <Typography gutterBottom color='secondary' variant='h5'>
          {getBookingStatus(booking.status)}
        </Typography>
        <Typography gutterBottom color='secondary' variant='h5'>
          {currencyFormat(
            calculateTotalPrice(
              booking.checkIn,
              booking.checkOut,
              booking.hotelPrice
            )
          )}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          {booking.hotelCity} - {booking.hotelRating} stars
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Check In: {formatDate(booking.checkIn)} - Check Out:{' '}
          {formatDate(booking.checkOut)}
        </Typography>
      </CardContent>
      <CardActions>
        <Button component={Link} to={`/booking/${booking.id}`} size='small'>
          VIEW
        </Button>
      </CardActions>
    </Card>
  );
};
