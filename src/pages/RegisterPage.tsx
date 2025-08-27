import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useNavigate, Link } from 'react-router-dom'
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { useRootStore } from '../stores/root.store'
import Loader from '../components/loader/Loader'
import type { RegisterDTO } from '../types'
import { FormWrap } from './LoginPage.styles'

const RegisterPage = observer(() => {
  const { auth } = useRootStore()
  const nav = useNavigate()
  const [form, setForm] = useState<RegisterDTO>({ name: '', email: '', password: '',   role: 'user', isBlocked: false, createdAt: new Date().toISOString()})

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await auth.register(form)
    nav(auth.isAdmin ? '/admin' : '/')
  }

  return (
    <FormWrap>
      <Paper sx={{ p: 4, width: 480, maxWidth: '100%' }} elevation={3}>
        <Typography variant="h5" mb={2}>Регистрация</Typography>
        {auth.error && <Alert severity="error" sx={{ mb: 2 }}>{auth.error}</Alert>}
        <Box component="form" onSubmit={onSubmit}>
          <Stack spacing={2}>
            <TextField label="Имя" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required/>
            <TextField label="E-mail" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required/>
            <TextField label="Пароль" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required/>
            <Button type="submit" variant="contained" disabled={auth.isLoading}>
              {auth.isLoading ? <Loader inline/> : 'Создать аккаунт'}
            </Button>
            <Typography variant="body2">
              Уже регистрировались? <Link to="/login">Войти</Link>
            </Typography>
          </Stack>
        </Box>
      </Paper>
    </FormWrap>
  )
})

export default RegisterPage
