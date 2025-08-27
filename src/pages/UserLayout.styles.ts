import styled from 'styled-components'
import { Paper } from '@mui/material'

export const Side = styled(Paper)`
  width: 220px;
  padding: 12px;
  align-self: start;
  position: sticky;
  top: 16px;
`

export const NavItem = styled.a`
  display: block;
  padding: 10px 12px;
  border-radius: 10px;
  text-decoration: none;
  color: inherit;
  font-weight: 500;

  &.active {
    background: #e3f2fd;
  }

  &:hover {
    background: #f3f4f6;
  }
`
