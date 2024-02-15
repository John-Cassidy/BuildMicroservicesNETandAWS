import { AboutPage } from '../../features/about/AboutPage';
import { App } from '../layout/App';
import { HomePage } from '../../features/home/HomePage';
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
    ],
  },
]);
