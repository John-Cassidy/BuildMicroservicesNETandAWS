import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';

export const RequireMember = () => {
  const authContext = useContext(AuthContext);
  const location = useLocation();

  if (
    authContext?.isMember() ||
    authContext?.isAdmin() ||
    authContext?.isManager()
  ) {
    return <Outlet />;
  }
  return <Navigate to='/login' state={{ from: location }} />;
};
