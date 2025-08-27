import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useNavigate, Link } from 'react-router-dom'
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { useRootStore } from '../stores/root.store'
import Loader from '../components/loader/Loader'
import { FormWrap } from './LoginPage.styles'

const LoginPage = observer(() => {
  const { auth } = useRootStore()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

    const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
        await auth.login({ email, password })
        nav('/feed')
    } catch {
    }
    }

  return (
    <FormWrap>
      <Paper sx={{ p: 4, width: 420, maxWidth: '100%' }} elevation={3}>
        <Typography variant="h5" mb={2}>Вход</Typography>
        {auth.error && <Alert severity="error" sx={{ mb: 2 }}>{auth.error}</Alert>}
        <Box component="form" onSubmit={onSubmit}>
          <Stack spacing={2}>
            <TextField label="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} required/>
            <TextField label="Пароль" type="password" value={password} onChange={e => setPassword(e.target.value)} required/>
            <Button type="submit" variant="contained" disabled={auth.isLoading}>
              {auth.isLoading ? <Loader inline/> : 'Войти'}
            </Button>
            <Typography variant="body2">
              Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
            </Typography>
          </Stack>
        </Box>
      </Paper>
    </FormWrap>
  )
})

export default LoginPage
