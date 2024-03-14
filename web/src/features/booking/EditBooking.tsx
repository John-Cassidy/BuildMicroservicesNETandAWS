import { BookingDto, getBookingStatus } from '../../app/models/booking';
import {
  Box,
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
  Controller,
  FieldValues,
  FormProvider,
  useForm,
} from 'react-hook-form';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {
  calculateTotalPrice,
  currencyFormat,
  isValidDate,
} from '../../app/util/util';
import { useEffect, useState } from 'react';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LoadingButton } from '@mui/lab';
import { agent } from '../../app/api/agent';
import dayjs from 'dayjs';

interface Props {
  booking: BookingDto | null | undefined;
  cancelEdit: () => void;
}

export const EditBooking = ({ booking, cancelEdit }: Props) => {
  useEffect(() => {
    if (!booking) {
      cancelEdit();
    }
  }, [booking, cancelEdit]);

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [editBooking, setEditBooking] = useState<BookingDto>({
    ...booking!,
  });

  const methods = useForm({
    defaultValues: {
      ...editBooking,
      checkIn: dayjs(editBooking.checkIn), // set initial value
      checkOut: dayjs(editBooking.checkOut), // set initial value
    },
    mode: 'onTouched',
  });
  const {
    control,
    watch,
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const checkIn = watch('checkIn')?.toDate();
  const checkOut = watch('checkOut')?.toDate();
  const hotelPrice = watch('hotelPrice');

  const submitForm = async (data: FieldValues) => {
    try {
      let response: any; // IHotel
      if (isValidDate(data, 'checkIn') && isValidDate(data, 'checkOut')) {
        setErrorMessage('');
        response = await agent.Member.updateBooking(data);
        console.log(response);
        cancelEdit();
      } else {
        setErrorMessage('Invalid date(s) selected. Please try again.');
      }
    } catch (error: any) {
      console.log(error);
      setErrorMessage(error.data.error);
    }
  };
  const resetForm = () => {
    setEditBooking({
      ...booking!,
    });
    reset();
  };

  return (
    <Box sx={{ p: 4 }}>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(submitForm)} noValidate>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box display='flex' justifyContent='space-between' sx={{ mt: 3 }}>
              <Button onClick={cancelEdit} variant='contained' color='inherit'>
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
            <Grid container spacing={6}>
              <Grid item xs={12}>
                {errorMessage && (
                  <Typography sx={{ p: 2 }} variant='body1' color='error'>
                    {errorMessage}
                  </Typography>
                )}
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
                        <TableCell>Check Out</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Total Price</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
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
                        </TableCell>
                        <TableCell>
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
                        </TableCell>
                        <TableCell>
                          {getBookingStatus(editBooking.status)}
                        </TableCell>
                        <TableCell>
                          {currencyFormat(
                            calculateTotalPrice(checkIn, checkOut, hotelPrice)
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={12}>
                <Typography variant='h4'>Hotel Information</Typography>
                <Divider sx={{ mb: 2 }} />
                <TableContainer>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell>Hotel</TableCell>
                        <TableCell>City</TableCell>
                        <TableCell>Rating</TableCell>
                        <TableCell>Price (per night)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>{editBooking.hotelName}</TableCell>
                        <TableCell>{editBooking.hotelCity}</TableCell>
                        <TableCell>{editBooking.hotelRating}</TableCell>
                        <TableCell>
                          {currencyFormat(editBooking.hotelPrice)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={12}>
                <Typography variant='h4'>Customer Information</Typography>
                <Divider sx={{ mb: 2 }} />
                <TableContainer>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Address</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          {editBooking.firstName} {editBooking.lastName}
                        </TableCell>
                        <TableCell>{editBooking.email}</TableCell>
                        <TableCell>{editBooking.address}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </LocalizationProvider>
        </form>
      </FormProvider>
    </Box>
  );
};
