import { observer } from 'mobx-react-lite'
import { AppBar, Toolbar, Typography, Button, Avatar, Stack } from '@mui/material'
import { Link } from 'react-router-dom'
import { useRootStore } from '../../stores/root.store'
import { DEFAULT_AVATAR } from '../../constants/ui'

const NavBar = observer(() => {
  const { auth } = useRootStore()

  return (
    <AppBar position="static">
      <Toolbar sx={{ gap: 1 }}>
        <Typography variant="h6" sx={{ flex: 1 }}>Popka</Typography>

        {auth.isAuthenticated && (
          <Stack direction="row" spacing={1} alignItems="center">
            {auth.isAdmin && (
              <Button
                component={Link}
                to="/admin"
                variant="outlined"
                color="inherit"
                sx={{ borderColor: 'rgba(255,255,255,.5)' }}
              >
                Админка
              </Button>
            )}

            <Avatar
              src={auth.user?.avatarUrl || DEFAULT_AVATAR}
              alt={auth.user?.name}
              sx={{ width: 32, height: 32 }}
            />

            <Button onClick={() => auth.logout()} variant="contained" color="error">
              Выйти
            </Button>
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  )
})

export default NavBar
