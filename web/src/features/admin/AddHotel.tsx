import { Box, Button, Grid, Paper, Typography } from '@mui/material';
import { FieldValues, useForm } from 'react-hook-form';
import { useContext, useEffect } from 'react';

import { AppDropzone } from '../../app/components/AppDropzone';
import { AppSelectList } from '../../app/components/AppSelectList';
import { AppTextInput } from '../../app/components/AppTextInput';
import { AuthContext } from '../../app/context/AuthContext';
import { IHotel } from '../../app/models/hotel';
import { LoadingButton } from '@mui/lab';
import { agent } from '../../app/api/agent';

const cities = [
  'New York',
  'London',
  'Tokyo',
  'Paris',
  'Berlin',
  'Sydney',
  'Rome',
  'Moscow',
  'Dubai',
  'Toronto',
];

interface IProps {
  hotel?: IHotel;
  cancelEdit: () => void;
}

export const AddHotel = ({ hotel, cancelEdit }: IProps) => {
  const authContext = useContext(AuthContext);
  if (!authContext) throw new Error('AuthContext is not defined');
  const {
    control,
    reset,
    handleSubmit,
    watch,
    formState: { isDirty, isSubmitting },
  } = useForm({
    mode: 'onTouched',
  });
  const watchFile = watch('file', null);

  useEffect(() => {
    if (hotel && !watchFile && !isDirty) reset(hotel);
    return () => {
      if (watchFile) URL.revokeObjectURL(watchFile.preview);
    };
  }, [hotel, reset, watchFile, isDirty]);

  const handleSubmitData = async (data: FieldValues) => {
    try {
      let response: any; // IHotel
      if (hotel) {
        response = await agent.Admin.updateHotel(
          data,
          authContext!.idToken!.getJwtToken()
        );
        console.log(response);
      } else {
        response = await agent.Admin.createHotel(
          data,
          authContext!.idToken!.getJwtToken()
        );
        console.log(response);
      }
      cancelEdit();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box component={Paper} sx={{ p: 4 }}>
      <Typography variant='h4' gutterBottom sx={{ mb: 4 }}>
        Hotel Details
      </Typography>
      <form onSubmit={handleSubmit(handleSubmitData)}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12}>
            <AppTextInput
              control={control}
              name='hotelName'
              label='Hotel Name'
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <AppTextInput
              control={control}
              name='hotelRating'
              label='Hotel Rating'
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <AppSelectList
              items={cities}
              control={control}
              name='hotelCity'
              label='Hotel City'
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <AppTextInput
              type='number'
              control={control}
              name='hotelPrice'
              label='Hotel Price'
            />
          </Grid>
          <Grid item xs={12}>
            <Box
              display='flex'
              justifyContent='space-between'
              alignItems='center'
            >
              <AppDropzone control={control} name='file' />
              {watchFile ? (
                <img
                  src={watchFile.preview}
                  alt='preview'
                  style={{ maxHeight: 200 }}
                />
              ) : (
                <img
                  src={hotel?.photoUrl}
                  alt={hotel?.hotelName}
                  style={{ maxHeight: 200 }}
                />
              )}
            </Box>
          </Grid>
        </Grid>
        <Box display='flex' justifyContent='space-between' sx={{ mt: 3 }}>
          <Button onClick={cancelEdit} variant='contained' color='inherit'>
            Cancel
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
      </form>
    </Box>
  );
};
