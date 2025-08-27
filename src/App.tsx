import { Routes, Route, Navigate, Link } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { Container, Stack, Button, Avatar } from '@mui/material'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminPage from './pages/AdminPage'
import { useRootStore } from './stores/root.store'
import { AppBarWrap, Brand } from './components/navbar/Navbar.styles'
import Loader from './components/loader/Loader'
import UserLayout from './pages/UserLayout'
import FeedPage from './pages/FeedPage'
import MessagesPage from './pages/MessagesPage'
import ProfilePage from './pages/ProfilePage'
import { DEFAULT_AVATAR } from 'constants/ui'
import NavBar from './components/navbar/NavBar'

const App = observer(() => {
  const { auth } = useRootStore()

  if (auth.initializing) return <Loader full />

  return (
    <>
    <NavBar />

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Routes>
          <Route path="/" element={auth.isAuthenticated ? <Navigate to="/feed" /> : <Navigate to="/login" />} />

          <Route path="/login" element={!auth.isAuthenticated ? <LoginPage /> : <Navigate to="/feed" />} />
          <Route path="/register" element={!auth.isAuthenticated ? <RegisterPage /> : <Navigate to="/feed" />} />

          <Route element={auth.isAuthenticated ? <UserLayout /> : <Navigate to="/login" />}>
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route path="/admin" element={
            auth.isAuthenticated
              ? (auth.isAdmin ? <AdminPage /> : <div>Нет доступа</div>)
              : <Navigate to="/login" />
          } />

          <Route path="*" element={<div>Страница не найдена</div>} />
        </Routes>
      </Container>
    </>
  )
})

export default App
