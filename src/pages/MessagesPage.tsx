import { Paper, Typography } from '@mui/material'

export default function MessagesPage() {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Сообщения</Typography>
      <Typography color="text.secondary">Здесь позже появятся диалоги и переписка.</Typography>
    </Paper>
  )
}
