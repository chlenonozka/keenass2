import { Outlet, NavLink } from 'react-router-dom'
import { Box, Stack, Typography } from '@mui/material'
import { Side, NavItem } from './UserLayout.styles'

export default function UserLayout() {
  return (
    <Stack direction="row" spacing={2}>
      <Side elevation={2}>
        <Typography variant="subtitle2" sx={{ mb: 1.5, opacity: .7, px: 1 }}>Навигация</Typography>
        <nav>
          <Stack spacing={0.5}>
            <NavItem as={NavLink} to="/feed" end>Лента</NavItem>
            <NavItem as={NavLink} to="/messages">Сообщения</NavItem>
            <NavItem as={NavLink} to="/profile">Профиль</NavItem>
          </Stack>
        </nav>
      </Side>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Outlet />
      </Box>
    </Stack>
  )
}
