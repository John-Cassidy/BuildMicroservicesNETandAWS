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
  Typography,
} from '@mui/material';
import { Hotel, HotelListResponse } from '../../app/models/hotel';
import { useEffect, useState } from 'react';

import { AddHotel } from './AddHotel';
import { LoadingComponent } from '../../app/layout/LoadingComponent';
import { agent } from '../../app/api/agent';
import { currencyFormat } from '../../app/util/util';

export const HotelInventory = () => {
  const [editMode, setEditMode] = useState(false);
  const [reload, setReload] = useState(false); // new state variable
  const [selectedHotel, setSelectedHotel] = useState<Hotel | undefined>(
    undefined
  );

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    agent.Management.getHotels()
      .then((response: HotelListResponse<Hotel>) => {
        const hotelsWithImageUrl = response.data.hotels.map((hotel) => {
          return {
            ...hotel,
            imageUrl: `${agent.S3URLS.Hotel_Image_URL}/${hotel.fileName}`,
          };
        });
        setHotels(hotelsWithImageUrl);
      })
      .catch((error) => console.log(error))
      .finally(() => setLoading(false));
  }, [reload]);

  if (loading) return <LoadingComponent message='Loading hotels...' />;

  const cancelEdit = () => {
    setSelectedHotel(undefined);
    setEditMode(false);
    setReload(!reload); // toggle reload state to trigger useEffect
  };

  if (editMode)
    return <AddHotel cancelEdit={cancelEdit} hotel={selectedHotel} />;

  return (
    <>
      <Box display='flex' justifyContent='space-between'>
        <Typography sx={{ p: 2 }} variant='h4'>
          Hotel Inventory
        </Typography>
        <Typography variant='body1'>
          <Button
            onClick={() => setEditMode(true)}
            variant='contained'
            color='inherit'
          >
            Create Hotel
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};
