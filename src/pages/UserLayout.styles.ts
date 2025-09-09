import styled from 'styled-components'
import { Paper } from '@mui/material'
import { COLORS } from '../constants/colors'

export const Side = styled(Paper)`
  width: 220px;
  padding: 12px;
  align-self: start;
  position: sticky;
  top: 16px;
  background: ${COLORS.white};
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`

export const NavItem = styled.a`
  display: block;
  padding: 10px 12px;
  border-radius: 10px;
  text-decoration: none;
  color: ${COLORS.text};
  font-weight: 500;
  transition: all 0.2s;

  &.active {
    background: ${COLORS.primaryLight};
    color: ${COLORS.primary};
  }

  &:hover {
    background: ${COLORS.gray100};
    text-decoration: none;
  }
`