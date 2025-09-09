import styled from 'styled-components'
import { TableRow } from '@mui/material'
import { COLORS } from '../constants/colors'

export const Row = styled(TableRow)<{ $deleted?: boolean }>`
  opacity: ${p => (p.$deleted ? 0.6 : 1)};
  
  & td {
    text-decoration: ${p => (p.$deleted ? 'line-through' : 'none')};
  }
`

export const AdminContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`

export const AdminHeader = styled.h1`
  color: ${COLORS.text};
  margin-bottom: 2rem;
  text-align: center;
`

export const UsersTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: ${COLORS.white};
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`

export const TableHeader = styled.thead`
  background-color: ${COLORS.gray100};
`

export const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: ${COLORS.gray700};
  border-bottom: 2px solid ${COLORS.border};
`

export const TableRowStyled = styled.tr`
  border-bottom: 1px solid ${COLORS.border};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: ${COLORS.gray100};
  }
`

export const TableCell = styled.td`
  padding: 1rem;
  color: ${COLORS.text};
`

export const ActionButton = styled.button<{ variant?: 'primary' | 'danger' | 'success' }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  
  background-color: ${props => 
    props.variant === 'danger' ? COLORS.danger :
    props.variant === 'success' ? COLORS.success :
    COLORS.primary
  };
  color: ${COLORS.white};
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  
  &:disabled {
    background-color: ${COLORS.gray400};
    cursor: not-allowed;
    transform: none;
  }
`