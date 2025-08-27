import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { RootStoreProvider } from './stores/root.store'
import App from './App'
import './styles/global.css'

const theme = createTheme({ palette: { mode: 'light' } })

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RootStoreProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </RootStoreProvider>
    </ThemeProvider>
  </React.StrictMode>
)
