import { Box, Button, Typography } from '@mui/material';

import { AuthContext } from '../../app/context/AuthContext';
import { Link } from 'react-router-dom';
import { agent } from '../../app/api/agent';
import { useContext } from 'react';

export const AdminBooking = () => {
  const authContext = useContext(AuthContext);
  if (!authContext) throw new Error('AuthContext is not defined');

  const testAPI = async () => {
    try {
      const response = await agent.TestAPI.post(
        { test: 'test' },
        authContext!.idToken!.getJwtToken()
      );
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Box display='flex' justifyContent='space-between'>
        <Typography sx={{ p: 2 }} variant='h4'>
          Inventory
        </Typography>
        <Typography variant='body1'>
          <Link to='/admin/add-hotel'>Create Hotel</Link>
          <Button onClick={testAPI} variant='contained' color='inherit'>
            Test API Post
          </Button>
        </Typography>
      </Box>
    </>
  );
};
