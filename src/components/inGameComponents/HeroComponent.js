import styled from "styled-components";
import { theme } from "../../styles/theme";

export const HeroComponent = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-radius: 15px;
  background: ${props => props.$isTargetable ?
    'linear-gradient(to bottom, rgba(0, 0, 0, 0.8), rgba(255, 215, 0, 0.1))' :
    'linear-gradient(to bottom, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6))'};
  cursor: ${props => props.$isTargetable ? 'pointer' : 'default'};
  transition: all 0.3s ease;
  border: 2px solid ${props => props.$isTargetable ?
    theme.colors.primary :
    'rgba(255, 255, 255, 0.1)'};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);

  &:hover {
    transform: ${props => props.$isTargetable ? 'translateY(-5px)' : 'none'};
    box-shadow: ${props => props.$isTargetable ?
    `${theme.shadows.golden}, 0 6px 12px rgba(0, 0, 0, 0.4)` :
    '0 4px 8px rgba(0, 0, 0, 0.3)'};
  }
`;

export const HeroImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid ${theme.colors.primary};
  object-fit: cover;
`;

export const HeroInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 8px;
  min-width: 100px;
`;

export const HeroHealth = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 1.2em;
  color: ${theme.colors.text.primary};
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  font-weight: bold;
`;

export const HeartIcon = styled.span`
  font-size: 1.2em;
  filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.5));
`;

export const HeroName = styled.div`
  color: ${theme.colors.text.primary};
  font-size: 1em;
  font-family: 'Cinzel', serif;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  font-weight: bold;
  letter-spacing: 1px;
`;

export const HeroAbility = styled.div`
  position: relative;
  margin-left: 10px;
  padding: 10px;
  border-radius: 8px;
  background: ${props => props.$canUse ?
    'rgba(255, 215, 0, 0.1)' :
    'rgba(0, 0, 0, 0.3)'};
  cursor: ${props => props.$canUse ? 'pointer' : 'not-allowed'};
  transition: all 0.3s ease;
  border: 2px solid ${props => props.$canUse ?
    theme.colors.primary :
    'rgba(255, 255, 255, 0.1)'};
  opacity: ${props => props.$canUse ? 1 : 0.6};

  &:hover {
    transform: ${props => props.$canUse ? 'translateY(-2px)' : 'none'};
    box-shadow: ${props => props.$canUse ? theme.shadows.golden : 'none'};
  }
`;

export const AbilityIcon = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 5px;
`;

export const AbilityCost = styled.div`
  position: absolute;
  top: -10px;
  right: -10px;
  width: 25px;
  height: 25px;
  background: ${theme.colors.primary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9em;
  color: ${theme.colors.background};
  border: 2px solid ${theme.colors.background};
`;

export const AbilityTooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  padding: 8px 12px;
  border-radius: 5px;
  font-size: 0.9em;
  white-space: nowrap;
  visibility: hidden;
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
  border: 1px solid ${theme.colors.primary};

  ${HeroAbility}:hover & {
    visibility: visible;
    opacity: 1;
    transform: translateX(-50%) translateY(-5px);
  }
`;

 export const HeroFrame = styled.div`
  width: ${props => props.$isMobile ? '100px' : '140px'};
  height: ${props => props.$isMobile ? '150px' : '200px'};
  border: 3px solid #ffd700;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(50, 50, 50, 0.9));
  color: #ffd700;
  font-size: ${props => props.$isMobile ? '16px' : '20px'};
  text-align: center;
  padding: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);

  // Přidáme ikonu koruny nad jménem
  &::before {
    content: '👑';
    font-size: ${props => props.$isMobile ? '24px' : '32px'};
    margin-bottom: 10px;
  }

  // Přidáme dekorativní prvek pod jménem
  &::after {
    content: 'HERO';
    font-size: ${props => props.$isMobile ? '12px' : '14px'};
    margin-top: 10px;
    opacity: 0.7;
    letter-spacing: 2px;
  }
`;