import styled from 'styled-components'
import { AppBar } from '@mui/material'
import { Link } from 'react-router-dom'

export const AppBarWrap = styled(AppBar)`
  background: #111827;
`

export const Brand = styled(Link)`
  color: #fff;
  text-decoration: none;
  font-weight: 700;
  font-size: 18px;

  &:hover { opacity: .9; }
`
