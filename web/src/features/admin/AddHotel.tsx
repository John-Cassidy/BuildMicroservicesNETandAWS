import { Box, Button, Grid, Paper, Typography } from '@mui/material';
import { FieldValues, FormProvider, useForm } from 'react-hook-form';

import { AppDropzone } from '../../app/components/AppDropzone';
import { AppSelectList } from '../../app/components/AppSelectList';
import { AppTextInput } from '../../app/components/AppTextInput';
import { IHotel } from '../../app/models/hotel';
import { LoadingButton } from '@mui/lab';
import { agent } from '../../app/api/agent';
import { useEffect } from 'react';

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

interface Props {
  hotel?: IHotel;
  cancelEdit: () => void;
}

export const AddHotel = ({ hotel, cancelEdit }: Props) => {
  const methods = useForm({
    mode: 'onTouched',
  });

  const {
    control,
    reset,
    register,
    handleSubmit,
    watch,
    formState: { isDirty, isSubmitting },
  } = methods;
  const watchFile = watch('photo', null);

  useEffect(() => {
    if (hotel && !watchFile && !isDirty) reset(hotel);
    return () => {
      if (watchFile) URL.revokeObjectURL(watchFile.preview);
    };
  }, [hotel, reset, watchFile, isDirty]);

  const submitForm = async (data: FieldValues) => {
    if (!data.photo) {
      return;
    }
    try {
      let response: any; // IHotel
      if (hotel) {
        response = await agent.Admin.updateHotel(data);
        console.log(response);
      } else {
        response = await agent.Admin.createHotel(data);
        console.log(response);
      }
      cancelEdit();
    } catch (error) {
      console.log(error);
    }
  };

  const resetForm = () => {
    reset();
    // if (hotel) reset(hotel);
    // else reset();
  };

  return (
    <Box component={Paper} sx={{ p: 4 }}>
      <Typography variant='h4' gutterBottom sx={{ mb: 4 }}>
        Hotel Details
      </Typography>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(submitForm)} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={12}>
              <AppTextInput
                control={control}
                label='Hotel Name'
                {...register('hotelName', {
                  required: 'Hotel Name is required',
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <AppTextInput
                control={control}
                label='Hotel Rating'
                {...register('hotelRating', {
                  required: 'Hotel Rating is required',
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <AppSelectList
                items={cities}
                control={control}
                label='Hotel City'
                {...register('hotelCity', {
                  required: 'Hotel City is required',
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <AppTextInput
                type='number'
                control={control}
                label='Hotel Price'
                {...register('hotelPrice', {
                  required: 'Hotel Price is required',
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <Box
                display='flex'
                justifyContent='space-between'
                alignItems='center'
              >
                <AppDropzone
                  control={control}
                  {...register('photo', { required: 'Photo is required' })}
                  name='photo'
                />
                {watchFile ? (
                  <img
                    src={watchFile.preview}
                    alt='preview'
                    style={{ maxHeight: 200 }}
                  />
                ) : (
                  <img
                    src={hotel?.fileName}
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
        </form>
      </FormProvider>
    </Box>
  );
};
