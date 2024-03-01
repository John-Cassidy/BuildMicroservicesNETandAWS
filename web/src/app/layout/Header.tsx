import {
  AppBar,
  Box,
  Button,
  List,
  ListItem,
  Switch,
  Toolbar,
} from '@mui/material';

import { AuthContext } from '../context/AuthContext';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import { NavLink } from 'react-router-dom';
import { poolData } from '../../features/account/cognitoUserPool';
import { useContext } from 'react';

const midLinks = [
  { title: 'home', path: '/' },
  { title: 'about', path: '/about' },
  { title: 'search', path: '/catalog' },
];

const rightLinks = [
  { title: 'login', path: '/login' },
  { title: 'register', path: '/register' },
];

const navLinkStyles = {
  color: 'inherit',
  textDecoration: 'none',
  typography: 'h6',
  '&:hover': {
    color: 'grey.500',
  },
  '&.active': {
    color: 'text.secondary',
  },
};

interface Props {
  darkMode: boolean;
  handleThemeChange: () => void;
}

export const Header = ({ handleThemeChange, darkMode }: Props) => {
  const authContext = useContext(AuthContext);
  return (
    <AppBar position='static' sx={{ mb: 4 }}>
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box display='flex' alignItems='center'>
          <Switch checked={darkMode} onChange={handleThemeChange} />
        </Box>
        <Box>
          <List sx={{ display: 'flex' }}>
            {midLinks.map(({ title, path }) => (
              <ListItem
                component={NavLink}
                to={path}
                key={path}
                sx={{
                  ...navLinkStyles,
                  ...(title === 'book a hotel' && {
                    width: '100%',
                    whiteSpace: 'nowrap',
                  }),
                }}
              >
                {title.toUpperCase()}
              </ListItem>
            ))}
          </List>
        </Box>
        {authContext?.user ? (
          <Box display='flex' alignItems='center'>
            <List sx={{ display: 'flex' }}>
              <ListItem
                component={NavLink}
                to='/profile'
                key='/profile'
                sx={navLinkStyles}
              >
                {authContext.user.givenName.toUpperCase()}{' '}
                {authContext.user.familyName.toUpperCase()}
              </ListItem>
              <ListItem
                component={Button}
                onClick={() => {
                  if (authContext) {
                    const userPool = new CognitoUserPool(poolData);
                    const cognitoUser = userPool.getCurrentUser();
                    if (cognitoUser) {
                      cognitoUser.signOut();
                    }
                    authContext.clearToken();
                  }
                }}
                key='/logout'
                sx={navLinkStyles}
              >
                LOGOUT
              </ListItem>
            </List>
          </Box>
        ) : (
          <Box display='flex' alignItems='center'>
            <List sx={{ display: 'flex' }}>
              {rightLinks.map(({ title, path }) => (
                <ListItem
                  component={NavLink}
                  to={path}
                  key={path}
                  sx={navLinkStyles}
                >
                  {title.toUpperCase()}
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};
