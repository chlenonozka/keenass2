import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../stores/root.store'
import { Alert, Paper, Stack, Typography } from '@mui/material'
import Loader from '../components/loader/Loader'
import PostForm from '../components/post/PostForm'
import PostCard from '../components/post/PostCard'

const FeedPage = observer(() => {
  const { posts } = useRootStore()

  useEffect(() => {
    posts.fetchPosts()
  }, [])

  return (
    <Stack spacing={2}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Создать пост</Typography>
        <PostForm />
      </Paper>

      {posts.isLoadingPosts ? (
        <Loader />
      ) : posts.errorPosts ? (
        <Alert severity="error">{posts.errorPosts}</Alert>
      ) : (
        <Stack spacing={2}>
          {posts.posts.map(p => <PostCard key={p.id} post={p} />)}
          {posts.posts.length === 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography color="text.secondary">Пока нет постов</Typography>
            </Paper>
          )}
        </Stack>
      )}
    </Stack>
  )
})

export default FeedPage
