import { useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../stores/root.store'
import { Alert, Box, Button, Stack, TextField } from '@mui/material'
import Loader from '../loader/Loader'

const PostForm = observer(() => {
  const { posts, auth } = useRootStore()
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined)
  const [imageName, setImageName] = useState<string | undefined>(undefined)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const pickFile = () => inputRef.current?.click()

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    try {
      const { url, name } = await posts.uploadImage(file)
      setImageUrl(url)
      setImageName(name)
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Не удалось загрузить файл')
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth.isAuthenticated) return
    if (auth.user?.isBlocked) { setError('Ваш аккаунт заблокирован'); return }
    setSaving(true); setError(null)
    try {
      await posts.createPost({ description, imageUrl, imageName })
      setDescription('')
      setImageUrl(undefined)
      setImageName(undefined)
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Не удалось создать пост')
    } finally {
      setSaving(false)
    }
  }

  if (!auth.isAuthenticated) {
    return <Alert severity="info">Чтобы создать пост, войдите в систему</Alert>
  }

  return (
    <Box component="form" onSubmit={onSubmit}>
      <Stack spacing={1.5}>
        <TextField
          multiline
          minRows={2}
          placeholder="Поделитесь чем-нибудь..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        {imageUrl && (
          <img src={imageUrl} alt="preview" style={{ maxWidth: '100%', borderRadius: 12 }} />
        )}

        <Stack direction="row" spacing={1}>
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={onFile} />
          <Button variant="outlined" onClick={pickFile}>Фото</Button>
          <Button type="submit" variant="contained" disabled={saving || !description.trim()}>
            {saving ? <Loader inline/> : 'Опубликовать'}
          </Button>
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}
      </Stack>
    </Box>
  )
})

export default PostForm
