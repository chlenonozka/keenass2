import { Routes, Route, Navigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { Container } from '@mui/material'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminPage from './pages/AdminPage'
import Loader from './components/loader/Loader'
import UserLayout from './pages/UserLayout'
import FeedPage from './pages/FeedPage'
import MessagesPage from './pages/MessagesPage'
import ProfilePage from './pages/ProfilePage'
import NavBar from './components/navbar/NavBar'
import { useAuthStore } from './stores/root.store'
import { NotFoundPage, AccessDeniedPage } from './pages/ErrorPage'

const App = observer(() => {
  const auth = useAuthStore()

  if (auth.initializing) return <Loader full />

  return (
    <>
      <NavBar />
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Routes>
          <Route 
            path="/" 
            element={auth.isAuthenticated ? <Navigate to="/feed" /> : <Navigate to="/login" />} 
          />

          <Route 
            path="/login" 
            element={!auth.isAuthenticated ? <LoginPage /> : <Navigate to="/feed" />} 
          />
          <Route 
            path="/register" 
            element={!auth.isAuthenticated ? <RegisterPage /> : <Navigate to="/feed" />} 
          />

          <Route 
            element={auth.isAuthenticated ? <UserLayout /> : <Navigate to="/login" />}
          >
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route 
            path="/admin" 
            element={
              auth.isAuthenticated
                ? (auth.isAdmin ? <AdminPage /> : <AccessDeniedPage />)
                : <Navigate to="/login" />
            } 
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Container>
    </>
  )
})

export default App