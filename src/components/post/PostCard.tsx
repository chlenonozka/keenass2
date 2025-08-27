import { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../stores/root.store'
import { DEFAULT_AVATAR } from '../../constants/ui'
import {
  Alert, Avatar, Box, Button, Card, CardContent, CardHeader,
  Divider, IconButton, Stack, TextField, Typography, Tooltip
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
        avatar={<Avatar src={post.authorAvatarUrl || DEFAULT_AVATAR} alt={post.authorName} />}
        title={<Typography variant="subtitle1">{post.authorName}</Typography>}
        subheader={fmt(post.createdAt)}
        action={canDeletePost && (
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
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt=""
            style={{ maxWidth: '100%', borderRadius: 12, marginBottom: 12 }}
          />
        )}
        <Typography>{post.description}</Typography>

        {!showAll && preview.length > 0 && (
          <Box mt={2}>
            <Divider sx={{ mb: 1.5 }} />
            {preview.map(c => {
              const selfComment = auth.user?.id === c.userId
              const canDeleteComment = selfComment || auth.canModerate
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
                        <Typography variant="subtitle2">
                          {c.authorName} ·{' '}
                          <span style={{ fontWeight: 400, opacity: 0.8 }}>{fmt(c.createdAt)}</span>
                        </Typography>
                        {canDeleteComment && (
                          <Tooltip title={selfComment ? 'Удалить мой комментарий' : 'Удалить комментарий'}>
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                disabled={posts.isCommentProcessing(c.id)}
                                onClick={() => {
                                  posts.hardDeleteComment(post.id, c.id)
                                }}
                              >
                                <DeleteForeverIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                      </Stack>
                      <Typography>{c.text}</Typography>
                    </Box>
                  </Stack>
                </Box>
              )
            })}
          </Box>
        )}

        <Stack direction="row" spacing={1} mt={1} alignItems="center">
          <Button size="small" onClick={() => setShowAll(s => !s)}>
            {showAll ? 'Скрыть комментарии' : `Комментарии (${count})`}
          </Button>
        </Stack>

        {showAll && (
          <Box mt={2}>
            <Divider sx={{ mb: 1.5 }} />
            {all.map(c => {
              console.log('Rendering all comments for post id:', post.id)
              const selfComment = auth.user?.id === c.userId
              const canDeleteComment = selfComment || auth.canModerate
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
                        <Typography variant="subtitle2">
                          {c.authorName} ·{' '}
                          <span style={{ fontWeight: 400, opacity: 0.8 }}>{fmt(c.createdAt)}</span>
                        </Typography>
                        {canDeleteComment && (
                          <Tooltip title={selfComment ? 'Удалить мой комментарий' : 'Удалить комментарий'}>
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                disabled={posts.isCommentProcessing(c.id)}
                                onClick={() => {
                                  console.log('Deleting comment with id:', c.id)
                                  posts.hardDeleteComment(post.id, c.id)
                                }}
                              >
                                <DeleteForeverIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                      </Stack>
                      <Typography>{c.text}</Typography>
                    </Box>
                  </Stack>
                </Box>
              )
            })}
            {auth.isAuthenticated && !auth.user?.isBlocked && (
              <Stack direction="row" spacing={1} mt={2}>
                <TextField
                  size="small"
                  placeholder="Написать комментарий..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  fullWidth
                />
                <Button variant="contained" onClick={onAddComment} disabled={!commentText.trim()}>
                  Отправить
                </Button>
              </Stack>
            )}

            {err && <Alert severity="error" sx={{ mt: 1 }}>{err}</Alert>}
          </Box>
        )}
      </CardContent>
    </Card>
  )
})

export default PostCard