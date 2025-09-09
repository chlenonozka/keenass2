import { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../stores/root.store'
import { DEFAULT_AVATAR } from '../../constants/ui'
import {
  Alert, Avatar, Box, Button, Card, CardContent, CardHeader,
  Divider, IconButton, Stack, TextField, Typography, Tooltip, Skeleton
} from '@mui/material'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import type { Post } from '../../types'

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })

const PostCard = observer(({ post }: { post: Post }) => {
  const { posts, auth } = useRootStore()
  const [showAll, setShowAll] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [showSkeleton, setShowSkeleton] = useState(true)

  const selfPost = auth.user?.id === post.authorId
  const canDeletePost = selfPost || auth.canModerate

  useEffect(() => {
    if (post.authorAvatarUrl && post.authorAvatarUrl !== DEFAULT_AVATAR) {
      posts.refreshAvatarInCache(post.authorId, post.authorAvatarUrl)
    }
  }, [post.authorAvatarUrl, post.authorId, posts])

  useEffect(() => {
    posts.ensureCommentsPreview(post.id)
  }, [post.id, posts])

  useEffect(() => {
    if (showAll && posts.comments(post.id).length === 0) {
      posts.fetchComments(post.id).catch(() => {})
    }
  }, [showAll, post.id, posts])

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkeleton(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  const onAddComment = async () => {
    if (!commentText.trim()) return
    try {
      await posts.addComment(post.id, commentText.trim())
      setCommentText('')
      setErr(null)
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || 'Не удалось добавить комментарий')
    }
  }

  const all = posts.comments(post.id)
  const preview = posts.commentsPreview(post.id)
  const count = posts.commentsCount(post.id)

  return (
    <Card>
      <CardHeader
        avatar={showSkeleton ? (
          <Skeleton variant="circular" width={40} height={40} />
        ) : (
          <Avatar
            src={post.authorAvatarUrl || DEFAULT_AVATAR}
            alt={post.authorName}
          />
        )}
        title={showSkeleton ? (
          <Skeleton variant="text" width="60%" />
        ) : (
          <Typography variant="subtitle1">{post.authorName}</Typography>
        )}
        subheader={showSkeleton ? (
          <Skeleton variant="text" width="40%" />
        ) : (
          <Typography variant="caption" color="text.secondary">
            {fmt(post.createdAt)}
          </Typography>
        )}
        action={canDeletePost && !showSkeleton && (
          <Tooltip title={selfPost ? 'Удалить мой пост' : 'Удалить пост'}>
            <span>
              <IconButton
                size="small"
                color="error"
                disabled={posts.isPostProcessing(post.id)}
                onClick={() => {
                  posts.hardDeletePost(post.id)
                }}
              >
                <DeleteForeverIcon />
              </IconButton>
            </span>
          </Tooltip>
        )}
      />
      <CardContent>
        {showSkeleton ? (
          post.imageUrl ? (
            <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 2 }} />
          ) : null
        ) : post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt="post"
            style={{ maxWidth: '100%', borderRadius: 12, marginBottom: 12 }}
          />
        ) : null}
        
        {showSkeleton ? (
          <Skeleton variant="text" width="80%" />
        ) : (
          post.description && <Typography>{post.description}</Typography>
        )}

        {!showAll && preview.length > 0 && !showSkeleton && (
          <Box mt={2}>
            <Divider sx={{ mb: 1.5 }} />
            {preview.map(c => {
              return (
                <Box key={c.id} sx={{ mb: 1.25 }}>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Avatar
                      src={c.authorAvatarUrl || DEFAULT_AVATAR}
                      alt={c.authorName}
                      sx={{ width: 28, height: 28, mt: '2px' }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2">{c.authorName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {fmt(c.createdAt)}
                        </Typography>
                      </Stack>
                      <Typography variant="body2">{c.text}</Typography>
                    </Box>
                  </Stack>
                </Box>
              )
            })}
          </Box>
        )}

        {!showSkeleton && (
          <Stack direction="row" spacing={1} mt={1} alignItems="center">
            <Button size="small" onClick={() => setShowAll(s => !s)}>
              {showAll ? 'Скрыть комментарии' : `Комментарии (${count})`}
            </Button>
          </Stack>
        )}

        {showAll && !showSkeleton && (
          <Box mt={2}>
            <Divider sx={{ mb: 1.5 }} />
            {all.map(c => {
              return (
                <Box key={c.id} sx={{ mb: 1.25 }}>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Avatar
                      src={c.authorAvatarUrl || DEFAULT_AVATAR}
                      alt={c.authorName}
                      sx={{ width: 28, height: 28, mt: '2px' }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2">{c.authorName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {fmt(c.createdAt)}
                        </Typography>
                      </Stack>
                      <Typography variant="body2">{c.text}</Typography>
                    </Box>
                  </Stack>
                </Box>
              )
            })}
            
            {auth.isAuthenticated && (
              <Box mt={2}>
                <Stack direction="row" spacing={1}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Добавить комментарий..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    onClick={onAddComment}
                    disabled={!commentText.trim()}
                  >
                    Отправить
                  </Button>
                </Stack>
                {err && <Alert severity="error" sx={{ mt: 1 }}>{err}</Alert>}
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  )
})

export default PostCard