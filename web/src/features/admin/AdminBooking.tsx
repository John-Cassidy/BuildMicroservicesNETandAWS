import { Box, Button, Typography } from '@mui/material';

import { AddHotel } from './AddHotel';
import { IHotel } from '../../app/models/hotel';
import { agent } from '../../app/api/agent';
import { useState } from 'react';

export const HotelInventory = () => {
  const [editMode, setEditMode] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<IHotel | undefined>(
    undefined
  );

  const testAPI = async () => {
    try {
      // const response = await agent.TestAPI.post({ test: 'test' });
      const response = await agent.TestAPI.get();
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  const cancelEdit = () => {
    setSelectedHotel(undefined);
    setEditMode(false);
  };

  if (editMode)
    return <AddHotel cancelEdit={cancelEdit} hotel={selectedHotel} />;

  return (
    <>
      <Box display='flex' justifyContent='space-between'>
        <Typography sx={{ p: 2 }} variant='h4'>
          Hotel Inventory
        </Typography>
        <Typography variant='body1'>
          <Button
            onClick={() => setEditMode(true)}
            variant='contained'
            color='inherit'
          >
            Create Hotel
          </Button>
          <Button onClick={testAPI} variant='contained' color='inherit'>
            Test API Post
          </Button>
        </Typography>
      </Box>
    </>
  );
};
