import { useState } from 'react';
import type { MouseEvent } from 'react';
import { Link as RouterLink, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../context/useAuth';

export default function AppLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/expenses', label: 'Expenses' },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
  ];

  const openMenu = (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={openMenu}
            aria-label="Open navigation menu"
            sx={{ mr: 1, display: { xs: 'inline-flex', md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            component={RouterLink}
            to="/dashboard"
            sx={{ color: 'inherit', textDecoration: 'none', fontWeight: 700, mr: 3 }}
          >
            Retain
          </Typography>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, flexGrow: 1 }}>
            {links.map((link) => (
              <Button
                key={link.to}
                component={NavLink}
                to={link.to}
                color="inherit"
                sx={{ '&.active': { bgcolor: 'rgba(255, 255, 255, 0.18)' } }}
              >
                {link.label}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: { xs: 1, md: 0 } }} />

          <Typography variant="body2" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
            {user?.name}
            {isAdmin ? ' (admin)' : ''}
          </Typography>
          <Button color="inherit" variant="outlined" size="small" onClick={handleLogout}>
            Sign out
          </Button>
        </Toolbar>
      </AppBar>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        {links.map((link) => (
          <MenuItem key={link.to} component={RouterLink} to={link.to} onClick={closeMenu}>
            {link.label}
          </MenuItem>
        ))}
      </Menu>

      <Container component="main" maxWidth="lg" sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </Box>
  );
}