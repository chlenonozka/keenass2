import React from 'react'
import { Container, Typography, Button } from '@mui/material'
import { Link } from 'react-router-dom'
import { COLORS } from '../constants/colors'

interface ErrorPageProps {
  title: string
  message: string
  statusCode?: number
}

export const ErrorPage: React.FC<ErrorPageProps> = ({ 
  title, 
  message, 
  statusCode 
}) => {
  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
      {statusCode && (
        <Typography variant="h1" color={COLORS.primary} fontWeight="bold">
          {statusCode}
        </Typography>
      )}
      <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
        {title}
      </Typography>
      <Typography variant="body1" color={COLORS.textMuted} sx={{ mb: 4 }}>
        {message}
      </Typography>
      <Button 
        variant="contained" 
        component={Link} 
        to="/"
        sx={{
          backgroundColor: COLORS.primary,
          '&:hover': {
            backgroundColor: COLORS.black
          }
        }}
      >
        На главную
      </Button>
    </Container>
  )
}

export const NotFoundPage: React.FC = () => (
  <ErrorPage 
    title="Страница не найдена" 
    message="Извините, запрашиваемая страница не существует."
    statusCode={404}
  />
)

export const AccessDeniedPage: React.FC = () => (
  <ErrorPage 
    title="Доступ запрещен" 
    message="У вас недостаточно прав для просмотра этой страницы."
    statusCode={403}
  />
)