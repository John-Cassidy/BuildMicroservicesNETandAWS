import { AboutPage } from '../../features/about/AboutPage';
import { AddHotel } from '../../features/admin/AddHotel';
import { AdminBooking } from '../../features/admin/AdminBooking';
import { App } from '../layout/App';
import { ConfirmRegistration } from '../../features/account/ConfirmRegistration';
import { HomePage } from '../../features/home/HomePage';
import { Login } from '../../features/account/Login';
import { Register } from '../../features/account/Register';
import { RequireAdmin } from './RequireAdmin';
import { createBrowserRouter } from 'react-router-dom';

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
          { path: 'admin', element: <AdminBooking /> },
          {
            path: 'admin/add-hotel',
            element: <AddHotel cancelEdit={() => {}} />,
          },
        ],
      },
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/confirm-registration', element: <ConfirmRegistration /> },
    ],
  },
]);
