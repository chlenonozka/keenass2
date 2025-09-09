import { createGlobalStyle } from 'styled-components'
import { COLORS } from '../constants/colors'

export const GlobalStyles = createGlobalStyle`
  * { 
    box-sizing: border-box; 
  }
  
  html, body, #root { 
    height: 100%; 
    margin: 0; 
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${COLORS.background};
    color: ${COLORS.text};
    line-height: 1.6;
  }

  a { 
    color: ${COLORS.primary}; 
    text-decoration: none; 
  }
  
  a:hover { 
    text-decoration: underline; 
  }

  /* Loader стили */
  .loader, .loader-full {
    display: grid;
    place-items: center;
    min-height: 120px;
  }

  .loader-full {
    min-height: 60vh;
  }

  .spinner {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 3px solid rgba(0,0,0,.2);
    border-top-color: rgba(0,0,0,.6);
    animation: spin 0.8s linear infinite;
    display: inline-block;
  }

  .spinner.inline {
    width: 18px;
    height: 18px;
    vertical-align: -3px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`