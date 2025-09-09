import styled from 'styled-components'
import { COLORS } from '../../constants/colors'

export const LoaderContainer = styled.div<{ full?: boolean }>`
  display: grid;
  place-items: center;
  min-height: 120px;
  
  &.full {
    min-height: 60vh;
  }

  ${({ full }) => full && `
    min-height: 60vh;
  `}
`

export const Spinner = styled.div<{ inline?: boolean }>`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 3px solid rgba(0, 0, 0, .2);
  border-top-color: rgba(0, 0, 0, .6);
  animation: spin 0.8s linear infinite;
  
  ${({ inline }) => inline && `
    width: 18px;
    height: 18px;
    vertical-align: -3px;
  `}
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`

export const LoaderText = styled.p`
  margin-top: 1rem;
  color: ${COLORS.textMuted};
  text-align: center;
`