import {
  AuthenticationDetails,
  CognitoAccessToken,
  CognitoIdToken,
  CognitoUser,
  CognitoUserPool,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import {
  Avatar,
  Box,
  Container,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { FieldValues, useForm } from 'react-hook-form';
import { useContext, useEffect } from 'react';

import { AuthContext } from '../../app/context/AuthContext';
import { LoadingButton } from '@mui/lab';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { poolData } from './cognitoUserPool';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const userPool = new CognitoUserPool(poolData);
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors, isValid },
  } = useForm({
    mode: 'onTouched',
  });

  useEffect(() => {
    if (authContext?.accessToken) {
      if (authContext?.isAdmin()) {
        navigate('/admin');
      } else if (authContext?.isManager()) {
        navigate('/manager');
      } else if (authContext?.isMember()) {
        navigate('/catalog');
      } else {
        navigate('/');
      }
    }
  }, [
    authContext,
    authContext?.accessToken,
    authContext?.isAdmin,
    authContext?.isManager,
    authContext?.isMember,
    navigate,
  ]);

  // Sign in
  const signIn = (username: string, password: string) => {
    const authenticationDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    });

    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: userPool,
    });

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function (result: CognitoUserSession) {
        toast.success('Logged in');
        const accessToken: CognitoAccessToken = result.getAccessToken();
        const idToken: CognitoIdToken = result.getIdToken();
        console.log(idToken);

        if (authContext) {
          authContext.setAccessToken(accessToken);
          authContext.setIdToken(idToken);
        }

        cognitoUser.getUserAttributes((err, attributes) => {
          if (err) {
            console.error(err);
          } else {
            if (authContext) {
              authContext.setUserDetails(attributes);
            }
          }
        });
      },
      onFailure: function (err) {
        console.error(err);
        toast.error(err);
      },
      mfaRequired: function (codeDeliveryDetails) {
        console.log('MFA required');
        console.log(codeDeliveryDetails);
      },
    });
  };

  const submitForm = (data: FieldValues) => {
    signIn(data.username, data.password);
  };

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
        Sign in
      </Typography>
      <Box
        component='form'
        onSubmit={handleSubmit(submitForm)}
        noValidate
        sx={{ mt: 1 }}
      >
        <TextField
          margin='normal'
          fullWidth
          label='Username'
          autoComplete='username'
          autoFocus
          {...register('username', { required: 'Username is required' })}
          error={!!errors.username}
          helperText={errors.username?.message as string}
        />
        <TextField
          margin='normal'
          fullWidth
          label='Password'
          type='password'
          autoComplete='password'
          {...register('password', { required: 'Password is required' })}
          error={!!errors.password}
          helperText={errors.password?.message as string}
        />
        <LoadingButton
          loading={isSubmitting}
          disabled={!isValid || isSubmitting}
          type='submit'
          fullWidth
          variant='contained'
          sx={{ mt: 3, mb: 2 }}
        >
          Sign In
        </LoadingButton>
      </Box>
    </Container>
  );
};
