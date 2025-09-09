import styled from 'styled-components'
import { AppBar } from '@mui/material'
import { Link } from 'react-router-dom'
import { COLORS } from '../../constants/colors'

export const AppBarWrap = styled(AppBar)`
  background: ${COLORS.secondary} !important;
`

export const Brand = styled(Link)`
  color: ${COLORS.white} !important;
  text-decoration: none;
  font-weight: 700;
  font-size: 18px;

  &:hover { 
    opacity: .9; 
    text-decoration: none;
  }
`

export const NavbarContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  height: 64px;
`

export const NavMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`

export const NavItem = styled(Link)`
  color: ${COLORS.white} !important;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    text-decoration: none;
  }
  
  &.active {
    background-color: ${COLORS.primary};
  }
`

export const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

export const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid ${COLORS.white};
`

export const UserName = styled.span`
  color: ${COLORS.white};
  font-weight: 500;
`

export const LogoutButton = styled.button`
  background-color: transparent;
  color: ${COLORS.white};
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: 1px solid ${COLORS.white};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${COLORS.white};
    color: ${COLORS.secondary};
  }
`