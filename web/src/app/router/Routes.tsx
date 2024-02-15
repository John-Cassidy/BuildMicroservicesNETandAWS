import { AboutPage } from '../../features/about/AboutPage';
import { App } from '../layout/App';
import { HomePage } from '../../features/home/HomePage';
import { Login } from '../../features/account/Login';
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
      { path: '/login', element: <Login /> },
    ],
  },
]);
