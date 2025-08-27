import styled from 'styled-components'
import { TableRow } from '@mui/material'

export const Row = styled(TableRow)<{ $deleted?: boolean }>`
  opacity: ${p => (p.$deleted ? 0.6 : 1)};
  & td {
    text-decoration: ${p => (p.$deleted ? 'line-through' : 'none')};
  }
`
