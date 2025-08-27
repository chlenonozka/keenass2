import { useEffect, useState, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../stores/root.store'
import {
  Alert, Avatar, Box, Button, Paper, Stack, TextField, Typography
} from '@mui/material'
import Loader from '../components/loader/Loader'
import { DEFAULT_AVATAR } from '../constants/ui'

type ProfileForm = {
  name: string
}

const ProfilePage = observer(() => {
  const { auth, posts } = useRootStore() 
  const [form, setForm] = useState<ProfileForm>({ name: '' })
  const [saving, setSaving] = useState(false)
  const [savedOk, setSavedOk] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (auth.user) {
      setForm({ name: auth.user.name })
    }
  }, [auth.user])

  if (!auth.isAuthenticated) {
    return <Alert severity="warning">Нужно войти в систему</Alert>
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError(null); setSavedOk(false)
    try {
      await auth.updateMe({ name: form.name })
      setSavedOk(true)
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Не удалось сохранить')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true); setError(null); setSavedOk(false);
    try {
      const { url } = await auth.changeAvatar(file);           
      await posts.updateAvatarOnServer(auth.user!.id, url);    
      setSavedOk(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Не удалось обновить аватар');
    } finally {
      setSaving(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };


  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Профиль</Typography>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Avatar
            src={auth.user?.avatarUrl || DEFAULT_AVATAR}
            alt={auth.user?.name}
            sx={{ width: 96, height: 96 }}
        />

        <Stack direction="row" spacing={1}>
            <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleAvatarChange}
            />

            <Button variant="outlined" onClick={() => fileRef.current?.click()}>
            Изменить аватар
            </Button>

            {auth.user?.avatarUrl && (
            <Button variant="text" color="error" onClick={() => auth.removeAvatar()}>
                Удалить
            </Button>
            )}
        </Stack>
        </Stack>
      <Box component="form" onSubmit={onSubmit}>
        <Stack spacing={2} maxWidth={480}>
          <TextField
            label="Имя"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <TextField
            label="E-mail"
            value={auth.user?.email || ''}
            disabled
            helperText="E-mail менять нельзя"
          />

          <Stack direction="row" spacing={1}>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? <Loader inline /> : 'Сохранить'}
            </Button>
          </Stack>

          {savedOk && <Alert severity="success">Сохранено</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
        Роль: <b>{auth.user?.role}</b>{' '}
        {auth.isAdmin ? '(админ)' : ''}
      </Typography>
    </Paper>
  )
})

export default ProfilePage
