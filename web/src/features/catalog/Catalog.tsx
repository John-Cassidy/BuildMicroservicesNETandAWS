import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Hotel, HotelListResponse } from '../../app/models/hotel';
import { useEffect, useState } from 'react';

import { AddBooking } from '../booking/AddBooking';
import { LoadingComponent } from '../../app/layout/LoadingComponent';
import { agent } from '../../app/api/agent';
import { currencyFormat } from '../../app/util/util';

export const Catalog = () => {
  const [reload, setReload] = useState(false); // new state variable
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');
  const [rating, setRating] = useState('');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | undefined>(
    undefined
  );
  useEffect(() => {
    agent.Member.searchHotels(city, rating)
      .then((response: HotelListResponse<Hotel>) => {
        const hotelsWithImageUrl = response.data.hotels.map((hotel) => {
          return {
            ...hotel,
            imageUrl: `https://hotel-booking-bucket-157.s3.amazonaws.com/${hotel.fileName}`,
            // imageUrl: `https://s3.us-east-1.amazonaws.com/hotel-booking-bucket-157/${hotel.fileName}`,
          };
        });
        setHotels(hotelsWithImageUrl);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => setLoading(false));
  }, [reload]);

  const searchHotels = () => {
    setReload(!reload);
  };

  const cancelBooking = () => {
    setSelectedHotel(undefined);
  };

  if (loading) return <LoadingComponent message='Loading hotels...' />;

  if (selectedHotel)
    return <AddBooking cancelBooking={cancelBooking} hotel={selectedHotel} />;

  return (
    <>
      <Box display='flex' justifyContent='space-between'>
        <Typography sx={{ p: 2 }} variant='h4'>
          Hotel Catalog
        </Typography>
        <Box display={'flex'} alignItems={'center'}>
          <TextField
            variant={'outlined'}
            label={'City'}
            fullWidth
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <TextField
            variant={'outlined'}
            label={'Rating'}
            fullWidth
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          />
        </Box>
        <Typography variant='body1'>
          <Button
            onClick={() => searchHotels()}
            variant='contained'
            color='inherit'
          >
            Search
          </Button>
        </Typography>
      </Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label='simple table'>
          <TableHead>
            <TableRow>
              <TableCell align='left'></TableCell>
              <TableCell align='right'>Hotel</TableCell>
              <TableCell align='right'>City</TableCell>
              <TableCell align='right'>Rating</TableCell>
              <TableCell align='right'>Price</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hotels.map((item) => (
              <TableRow
                key={item.name}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component='th' scope='row'>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <img
                      src={item.imageUrl}
                      alt={item.fileName}
                      style={{ width: 200, marginRight: 20 }}
                    />
                    <span>{item.name}</span>
                  </Box>
                </TableCell>
                <TableCell align='center'>{item.name}</TableCell>
                <TableCell align='center'>{item.city}</TableCell>
                <TableCell align='center'>{item.rating}</TableCell>
                <TableCell align='center'>
                  {currencyFormat(item.price)}
                </TableCell>
                <TableCell align='center'>
                  <Button
                    variant='contained'
                    color='primary'
                    onClick={() => setSelectedHotel(item)}
                  >
                    Book Now!
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};
