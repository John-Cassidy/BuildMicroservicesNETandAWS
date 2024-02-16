import {
  Avatar,
  Box,
  Container,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import {
  CognitoUserAttribute,
  CognitoUserPool,
  ISignUpResult,
} from 'amazon-cognito-identity-js';
import { FieldValues, useForm } from 'react-hook-form';

import { Link } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { poolData } from './cognitoUserPool';
import { toast } from 'react-toastify';
import { useState } from 'react';

export const Register = () => {
  const userPool = new CognitoUserPool(poolData);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors, isValid },
    getValues,
  } = useForm({
    mode: 'onTouched',
  });

  const submitForm = (data: FieldValues) => {
    const attributeList = [
      new CognitoUserAttribute({ Name: 'email', Value: data.email }),
      new CognitoUserAttribute({ Name: 'given_name', Value: data.givenName }),
      new CognitoUserAttribute({ Name: 'family_name', Value: data.familyName }),
      new CognitoUserAttribute({ Name: 'address', Value: data.address }),
    ];

    userPool.signUp(
      data.email,
      data.password,
      attributeList,
      [],
      (err, result: ISignUpResult | undefined) => {
        if (err) {
          console.error(err);
          setError(err.message);
          return;
        }
        if (result) {
          // user: CognitoUser;
          // userConfirmed: boolean;
          // userSub: string;
          // codeDeliveryDetails: CodeDeliveryDetails;

          console.log('user is ' + result.user);
          console.log('user confirmed is ' + result.userConfirmed);
          console.log('user sub is ' + result.userSub);
          console.log('code delivery details is ' + result.codeDeliveryDetails);

          toast.success('Registration Successful! Please check your email.');
          setSuccess(true);
        }
      }
    );
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
          SignUp successful!
        </Typography>
        <Typography variant='body1'>
          You should receive an confirmation email from Cognito.
          <br />
          Please check your email for the confirmation code.
          <br />
          And <Link to='/confirm-registration'>Confirm Registration</Link>{' '}
          before logging in.
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
      <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component='h1' variant='h5'>
        User Registration Form
      </Typography>
      {error && <Typography color='error'>{error}</Typography>}
      <Box
        component='form'
        onSubmit={handleSubmit(submitForm)}
        noValidate
        sx={{ mt: 1 }}
      >
        <TextField
          margin='normal'
          fullWidth
          label='Email'
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Not a valid email address',
            },
          })}
          error={!!errors.email}
          helperText={errors.email?.message as string}
        />
        <TextField
          margin='normal'
          fullWidth
          label='First Name'
          {...register('givenName', { required: 'First Name is required' })}
          error={!!errors.givenName}
          helperText={errors.givenName?.message as string}
        />
        <TextField
          margin='normal'
          fullWidth
          label='Last Name'
          {...register('familyName')}
          error={!!errors.familyName}
          helperText={errors.familyName?.message as string}
        />
        <TextField
          margin='normal'
          fullWidth
          label='Address'
          {...register('address', { required: 'Address is required' })}
          error={!!errors.address}
          helperText={errors.address?.message as string}
        />
        <TextField
          margin='normal'
          fullWidth
          label='Password'
          type='password'
          {...register('password', {
            required: 'Password is required',
            pattern: {
              value:
                /(?=^.{6,10}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&amp;*()_+}{&quot;:;'?/&gt;.&lt;,])(?!.*\s).*$/,
              message: 'Password does not meet complexity requirements',
            },
          })}
          error={!!errors.password}
          helperText={errors.password?.message as string}
        />
        <TextField
          margin='normal'
          fullWidth
          label='Confirm Password'
          type='password'
          {...register('confirmPassword', {
            required: 'Confirm Password is required',
            validate: {
              matchesPreviousPassword: (value: string) => {
                const { password } = getValues();
                return password === value || 'Passwords should match!';
              },
            },
          })}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message as string}
        />
        <LoadingButton
          loading={isSubmitting}
          disabled={!isValid || isSubmitting}
          type='submit'
          fullWidth
          variant='contained'
          sx={{ mt: 3, mb: 2 }}
        >
          Sign Up
        </LoadingButton>
      </Box>
    </Container>
  );
};
