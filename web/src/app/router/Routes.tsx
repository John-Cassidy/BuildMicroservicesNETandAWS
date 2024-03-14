import { Navigate, createBrowserRouter } from 'react-router-dom';

import { AboutPage } from '../../features/about/AboutPage';
import { AddBooking } from '../../features/booking/AddBooking';
import { AddHotel } from '../../features/admin/AddHotel';
import { App } from '../layout/App';
import { BookingDetails } from '../../features/booking/BookingDetails';
import { Bookings } from '../../features/booking/Bookings';
import { Catalog } from '../../features/catalog/Catalog';
import { ConfirmRegistration } from '../../features/account/ConfirmRegistration';
import { HomePage } from '../../features/home/HomePage';
import { HotelInventory } from '../../features/admin/AdminBooking';
import { Login } from '../../features/account/Login';
import NotFound from '../errors/NotFound';
import { Register } from '../../features/account/Register';
import { RequireAdmin } from './RequireAdmin';
import { RequireMember } from './RequireMember';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '',
        element: <HomePage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        element: <RequireAdmin />,
        children: [
          { path: 'admin', element: <HotelInventory /> },
          {
            path: 'admin/add-hotel',
            element: <AddHotel cancelEdit={() => {}} />,
          },
        ],
      },
      {
        element: <RequireMember />,
        children: [{ path: 'catalog', element: <Catalog /> }],
      },
      {
        element: <RequireMember />,
        children: [
          { path: 'booking', element: <Bookings /> },
          {
            path: 'booking/:id',
            element: <BookingDetails />,
          },
          {
            path: 'booking/add-booking',
            element: <AddBooking cancelBooking={() => {}} hotel={undefined} />,
          },
        ],
      },
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/confirm-registration', element: <ConfirmRegistration /> },
      { path: '/not-found', element: <NotFound /> },
      { path: '*', element: <Navigate replace to='/not-found' /> },
    ],
  },
]);
