import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import {
  Avatar,
  Box,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { FieldValues, useForm } from 'react-hook-form';

import { Link } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { poolData } from './cognitoUserPool';
import { toast } from 'react-toastify';

console.log(poolData);

const userPool = new CognitoUserPool(poolData);

export const Login = () => {
  // const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors, isValid },
  } = useForm({
    mode: 'onTouched',
  });

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
        // console.log('access token + ' + result.getAccessToken().getJwtToken());
        // console.log('id token + ' + result.getIdToken().getJwtToken());
        // console.log('refresh token + ' + result.getRefreshToken().getToken());
        toast.success('Logged in');
      },
      onFailure: function (err) {
        console.error(err);
        toast.error(err);
      },
    });
  };

  const submitForm = async (data: FieldValues) => {
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
        <Grid container>
          <Grid item>
            <Link to='/register'>{"Don't have an account? Sign Up"}</Link>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};
