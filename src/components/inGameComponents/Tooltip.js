// Přesuneme Tooltip komponentu na začátek, hned po importech
import { memo } from "react";
import styled from "styled-components";

export const Tooltip = memo(styled.div`
  position: absolute;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 1000;
  
  ${props => props.$position === 'top' && `
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 5px;
    
    @media (max-width: 768px) {
      left: auto;
      right: 0;
      transform: none;
    }
  `}
  
  ${props => props.$position === 'bottom' && `
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 5px;
    
    @media (max-width: 768px) {
      left: auto;
      right: 0;
      transform: none;
    }
  `}
`);
