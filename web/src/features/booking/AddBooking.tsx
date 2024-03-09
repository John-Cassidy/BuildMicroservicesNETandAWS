import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Paper,
  Toolbar,
  Typography,
} from '@mui/material';
import {
  Controller,
  FieldValues,
  FormProvider,
  useForm,
} from 'react-hook-form';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { useContext, useState } from 'react';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AuthContext } from '../../app/context/AuthContext';
import { Hotel } from '../../app/models/hotel';
import { LoadingButton } from '@mui/lab';
import { NewBooking } from '../../app/models/booking';
import { agent } from '../../app/api/agent';
import { currencyFormat } from '../../app/util/util';

interface Props {
  hotel: Hotel;
  cancelBooking: () => void;
}

export const AddBooking = ({ hotel, cancelBooking }: Props) => {
  const authContext = useContext(AuthContext);

  const newBooking: NewBooking = {
    userId: authContext?.user?.sub || '',
    firstName: authContext?.user?.givenName || '',
    lastName: authContext?.user?.familyName || '',
    email: authContext?.user?.email || '',
    address: authContext?.user?.address || '',
    hotelId: hotel.id,
    checkIn: null,
    checkOut: null,
  };

  const [booking, setBooking] = useState<NewBooking>(newBooking);

  const methods = useForm({
    defaultValues: {
      ...booking,
    },
    mode: 'onTouched',
  });
  const {
    control,
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const submitForm = async (data: FieldValues) => {
    try {
      let response: any; // IHotel
      if (data.checkIn && data.checkOut) {
        response = await agent.Member.createBooking(data);
        console.log(response);
        cancelBooking();
      }
    } catch (error) {
      console.log(error);
    }
  };
  const resetForm = () => {
    setBooking(newBooking);
    reset();
    // if (hotel) reset(hotel);
    // else reset();
  };

  return (
    <Box component={Paper} sx={{ p: 4 }}>
      <Typography sx={{ p: 2 }} variant='h4'>
        Book {hotel.name} for only {currencyFormat(hotel.price)}
      </Typography>
      <Box sx={{ p: 4 }}>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(submitForm)} noValidate>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={3}>
                  Checkin Date:
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Controller
                    control={control}
                    name='checkIn'
                    rules={{ required: true }}
                    render={({ field }) => {
                      return (
                        <DatePicker
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                        />
                      );
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  Checkout Date:
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Controller
                    control={control}
                    name='checkOut'
                    rules={{ required: true }}
                    render={({ field }) => {
                      return (
                        <DatePicker
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                        />
                      );
                    }}
                  />
                </Grid>
              </Grid>
              <Box display='flex' justifyContent='space-between' sx={{ mt: 3 }}>
                <Button
                  onClick={cancelBooking}
                  variant='contained'
                  color='inherit'
                >
                  Cancel
                </Button>
                <Button onClick={resetForm} variant='contained' color='inherit'>
                  Reset
                </Button>
                <LoadingButton
                  loading={isSubmitting}
                  type='submit'
                  variant='contained'
                  color='success'
                >
                  Submit
                </LoadingButton>
              </Box>
            </LocalizationProvider>
          </form>
        </FormProvider>
      </Box>
      <Card
        raised
        sx={{
          maxHeight: '800px',
          margin: '0 auto',
          padding: '0.1em',
        }}
      >
        <CardContent>
          <Toolbar
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.1em',
            }}
          >
            <Box display='flex' alignItems='center'>
              {hotel.name}
            </Box>
            <Box display='flex' alignItems='center'>
              {hotel.city}
            </Box>
            <Box display='flex' alignItems='center'>
              Rating: {hotel.rating}
            </Box>
            <Box display='flex' alignItems='center'>
              {currencyFormat(hotel.price)}
            </Box>
          </Toolbar>
        </CardContent>
        <CardMedia
          sx={{
            height: 0,
            paddingTop: '56.25%', // 16:9,
          }}
          image={hotel.imageUrl}
          title={hotel.name}
        />
      </Card>
    </Box>
  );
};
