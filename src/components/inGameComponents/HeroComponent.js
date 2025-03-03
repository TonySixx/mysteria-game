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

export const HeroImageContainer = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
`;

export const HeroImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid ${theme.colors.primary};
  object-fit: cover;
  z-index: 1;
  position: relative;
`;

export const HeroSecretsWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
`;

export const HeroSecretIcon = styled.div`
  position: absolute;
  width: 22px;
  height: 22px;
  background: radial-gradient(circle, rgba(128, 0, 128, 0.7) 0%, rgba(80, 0, 80, 0.5) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 215, 0, 0.6);
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.4);
  color: #ffd700;
  font-size: 12px;
  animation: pulseSecret 2s infinite;
  pointer-events: auto;
  cursor: help;
  z-index: 3;

  @keyframes pulseSecret {
    0% { filter: drop-shadow(0 0 3px rgba(255, 215, 0, 0.5)); }
    50% { filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.8)); }
    100% { filter: drop-shadow(0 0 3px rgba(255, 215, 0, 0.5)); }
  }

  &:hover {
    z-index: 4;
    transform: scale(1.2);
  }
  
  &:hover::after {
    content: attr(data-secret-name);
    position: absolute;
    bottom: 120%;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, rgba(40, 0, 40, 0.95), rgba(80, 20, 100, 0.95));
    color: #ffd700;
    padding: 6px 10px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: bold;
    white-space: nowrap;
    z-index: 10;
    border: 1px solid rgba(255, 215, 0, 0.5);
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
    letter-spacing: 0.5px;
  }

  // Umístění ikon kolem kruhu
  &:nth-child(1) { top: -8px; left: 50%; transform: translateX(-50%); }
  &:nth-child(2) { top: 0px; left: 80%; transform: translateX(-50%); }
  &:nth-child(3) { 
    top: 50%;
    right: -14px;
    transform: translateY(-72%);
 }
  &:nth-child(4) {
    bottom: 7%;
    right: -10px;
    transform: translateY(4%); }
  &:nth-child(5) {
    bottom: 7%;
    left: 45px;
    transform: translateY(86%); }
  &:nth-child(6) { bottom: 14%; left: 14%; transform: rotate(45deg); }
  &:nth-child(7) { top: 50%; left: 0; transform: translateY(-50%); }
  &:nth-child(8) { top: 14%; left: 14%; transform: rotate(-45deg); }
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