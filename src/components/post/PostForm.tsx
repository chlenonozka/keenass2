import { useRef, useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../stores/root.store'
import { Alert, Box, Button, Stack, TextField, Typography, Skeleton } from '@mui/material'

const PostForm = observer(() => {
  const { posts, auth } = useRootStore()
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined)
  const [imageName, setImageName] = useState<string | undefined>(undefined)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingImage, setLoadingImage] = useState(false)
  const [showSkeleton, setShowSkeleton] = useState(true)

  const inputRef = useRef<HTMLInputElement>(null)
  const pickFile = () => inputRef.current?.click()

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkeleton(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setLoadingImage(true)
    try {
      const { url, name } = await posts.uploadImage(file)
      setImageUrl(url)
      setImageName(name)
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Не удалось загрузить файл')
    } finally {
      setLoadingImage(false)
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

  const removeImage = () => {
    setImageUrl(undefined)
    setImageName(undefined)
  }

  if (!auth.isAuthenticated) {
    return <Alert severity="info">Чтобы создать пост, войдите в систему</Alert>
  }

  const isLoading = loadingImage || saving

  if (showSkeleton) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Skeleton variant="rounded" width="100%" height={80} />
        <Skeleton variant="rounded" width="100%" height={40} />
        <Skeleton variant="rounded" width="100%" height={40} />
      </Box>
    )
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
          disabled={isLoading}
        />

        {loadingImage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <Typography variant="body2">
              Загрузка изображения...
            </Typography>
          </Box>
        )}

        {imageUrl && !loadingImage && (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img 
              src={imageUrl} 
              alt="preview" 
              style={{ 
                maxWidth: '100%', 
                borderRadius: 12,
                opacity: isLoading ? 0.7 : 1
              }} 
            />
            {!isLoading && (
              <Button
                onClick={removeImage}
                style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  background: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '5px',
                  fontSize: '12px',
                  minWidth: 'auto',
                  height: 'auto',
                  width: 'auto',
                }}
                aria-label="Удалить изображение"
              >
                &#10005;
              </Button>
            )}
          </div>
        )}

        <Stack direction="row" spacing={1} alignItems="center">
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={onFile} />
          <Button 
            variant="outlined" 
            onClick={pickFile}
            disabled={isLoading}
          >
            Фото
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={isLoading || !description.trim()}
          >
            {saving ? 'Сохранение...' : 'Опубликовать'}
          </Button>
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}
      </Stack>
    </Box>
  )
})

export default PostForm