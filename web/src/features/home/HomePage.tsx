import { Box, Typography } from '@mui/material';

import Slider from 'react-slick';

export const HomePage = () => {
  const settings = {
    dots: true,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    speed: 5000,
    autoplaySpeed: 2000,
    cssEase: 'linear',
  };
  return (
    <>
      <div className='slider-container'>
        <Slider {...settings}>
          <div>
            <img
              src='/images/001_stayawhile.jpg'
              alt='StayAwhile'
              style={{ display: 'block', width: '100%', maxHeight: 500 }}
            />
          </div>
          <div>
            <img
              src='/images/002_stayawhile.jpg'
              alt='StayAwhile'
              style={{ display: 'block', width: '100%', maxHeight: 500 }}
            />
          </div>
          <div>
            <img
              src='/images/003_stayawhile.jpg'
              alt='StayAwhile'
              style={{ display: 'block', width: '100%', maxHeight: 500 }}
            />
          </div>
          <div>
            <img
              src='/images/004_stayawhile.jpg'
              alt='StayAwhile'
              style={{ display: 'block', width: '100%', maxHeight: 500 }}
            />
          </div>
        </Slider>
      </div>

      <Typography variant='h3' component='div' gutterBottom>
        Welcome to StayAwhile
      </Typography>
      <Typography variant='body1' component='div' gutterBottom>
        <strong>StayAwhile</strong> is the ultimate hotel booking experience at
        your fingertips! Our platform is designed for travelers who value
        convenience, choice, and control over their accommodation arrangements.
      </Typography>
      <Typography variant='body1' gutterBottom>
        <strong>Become a Member</strong> Join our community of explorers and
        gain instant access to a world of exclusive benefits. Registration is
        quick and easy, and as a member, you’ll enjoy personalized services
        tailored to your travel preferences.
      </Typography>
      <Typography variant='body1' gutterBottom>
        <strong>Find Your Perfect Stay</strong> Whether you’re looking for a
        luxurious suite in the heart of the city or a cozy retreat in a quiet
        neighborhood, our app has you covered. Search for hotels by location,
        rating, or amenities, and find the perfect match for your next
        adventure.
      </Typography>
      <Typography variant='body1' gutterBottom>
        <strong>Seamless Booking and Management</strong> Booking your ideal
        hotel room has never been easier. With just a few taps, you can secure
        your stay at any of our partner hotels. Plus, our intuitive interface
        allows you to view and update your bookings anytime, anywhere, ensuring
        your travel plans are always at your command.
      </Typography>

      <Box display='flex' justifyContent='center' sx={{ p: 12 }}>
        <Typography variant='h6' component='div' gutterBottom>
          Embark on your journey with StayAwhile, where every stay is tailored
          to be as unique as you are. Discover, book, and manage your
          accommodations with ease and start exploring the world with us today!
        </Typography>
      </Box>
    </>
  );
};
