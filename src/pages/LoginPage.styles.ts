import styled from 'styled-components'
import { Paper } from '@mui/material'
import { COLORS } from '../constants/colors'

export const FormWrap = styled.div`
  min-height: calc(100vh - 64px);
  display: grid;
  place-items: center;
  background: ${COLORS.white};
`

export const FormPaper = styled(Paper)`
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  h1 {
    text-align: center;
    margin-bottom: 2rem;
    color: ${COLORS.text};
  }
  
  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
`