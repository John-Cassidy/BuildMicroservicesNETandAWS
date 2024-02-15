import {
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from '@mui/material';

import { AuthProvider } from '../context/AuthContext';
import { Header } from './Header';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';

export const App = () => {
  const [darkMode, setDarkMode] = useState(true);
  const palleteType = darkMode ? 'dark' : 'light';
  const theme = createTheme({
    palette: {
      mode: palleteType,
      background: {
        default: palleteType === 'light' ? '#eaeaea' : '#121212',
      },
    },
  });

  const handleThemeChange = () => {
    setDarkMode(!darkMode);
  };

  return (
    <AuthProvider>
      <div>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Header darkMode={darkMode} handleThemeChange={handleThemeChange} />
          <Container>
            <Outlet />
          </Container>
        </ThemeProvider>
      </div>
    </AuthProvider>
  );
};
