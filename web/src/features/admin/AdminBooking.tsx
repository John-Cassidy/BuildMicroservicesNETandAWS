import { Box, Typography } from '@mui/material';

import { Link } from 'react-router-dom';

export const AdminBooking = () => {
  return (
    <>
      <Box display='flex' justifyContent='space-between'>
        <Typography sx={{ p: 2 }} variant='h4'>
          Inventory
        </Typography>
        <Typography variant='body1'>
          <Link to='/admin/add-hotel'>Create Hotel</Link>
        </Typography>
      </Box>
    </>
  );
};
