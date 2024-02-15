import { AppBar, Box, List, ListItem, Switch, Toolbar } from '@mui/material';

import { NavLink } from 'react-router-dom';

const midLinks = [
  { title: 'home', path: '/' },
  { title: 'about', path: '/about' },
  { title: 'book a hotel', path: '/bookhotel' },
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
      </Toolbar>
    </AppBar>
  );
};
