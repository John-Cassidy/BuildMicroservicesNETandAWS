import { Box, Container, Paper, TextField, Typography } from '@mui/material';
import {
  CognitoUser,
  CognitoUserPool,
  ICognitoUserData,
} from 'amazon-cognito-identity-js';
import { FieldValues, useForm } from 'react-hook-form';

import { Link } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import { poolData } from './cognitoUserPool';
import { toast } from 'react-toastify';
import { useState } from 'react';

export const ConfirmRegistration = () => {
  const userPool = new CognitoUserPool(poolData);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors, isValid },
  } = useForm({
    mode: 'onTouched',
  });

  const confirmForm = (data: FieldValues) => {
    const userData: ICognitoUserData = {
      Username: data.email,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.confirmRegistration(data.code, true, (err, result) => {
      if (err) {
        console.error(err);
        setError(err.message);
        return;
      }
      if (result === 'SUCCESS') {
        toast.success('Confirmation successful!');
        setSuccess(true);
      }
    });
  };

  if (success) {
    return (
      <Container
        component={Paper}
        maxWidth='sm'
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 4,
        }}
      >
        <Typography variant='h3' color='success'>
          Confirmation successful!
        </Typography>
        <Typography variant='body1'>
          You can now <Link to='/login'>Login</Link> to your account.
        </Typography>
      </Container>
    );
  }

  return (
    <Container
      component={Paper}
      maxWidth='sm'
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 4,
      }}
    >
      <Typography component='h1' variant='h5'>
        Confirm Registration
      </Typography>
      <Typography variant='body1'>
        You should have receive an confirmation email from Cognito.
        <br />
        Please check your email for the confirmation code.
        <br />
        And Enter it below to confirm your email.
      </Typography>
      {error && <Typography color='error'>{error}</Typography>}
      <Box
        component='form'
        onSubmit={handleSubmit(confirmForm)}
        noValidate
        sx={{ mt: 1 }}
      >
        <TextField
          margin='normal'
          fullWidth
          label='Email'
          {...register('email', { required: 'Email is required' })}
          error={!!errors.email}
          helperText={errors.email?.message as string}
        />
        <TextField
          margin='normal'
          fullWidth
          label='Confirmation Code'
          {...register('code', { required: 'Confirmation Code is required' })}
          error={!!errors.code}
          helperText={errors.code?.message as string}
        />
        <LoadingButton
          loading={isSubmitting}
          disabled={!isValid || isSubmitting}
          type='submit'
          fullWidth
          variant='contained'
          sx={{ mt: 3, mb: 2 }}
        >
          Confirm
        </LoadingButton>
      </Box>
    </Container>
  );
};
