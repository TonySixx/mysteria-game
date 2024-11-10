import styled, { css } from "styled-components";
import cardTexture from '../../assets/images/card-texture.png';
import cardBackImage from '../../assets/images/card-back.png';


// Upravte CardComponent pro lepší mobilní zobrazení
export const CardComponent = styled.div`
  width: ${props => {
    if (props.$isMobile) {
      if (props.$isOpponentCard) return '60px'; // Menší karty pro oponenta na mobilu
      return props.$isInHand ? '85px' : '100px';
    }
    return props.$isInHand ? '120px' : '140px';
  }};
  height: ${props => {
    if (props.$isMobile) {
      if (props.$isOpponentCard) return '90px'; // Menší karty pro oponenta na mobilu
      return props.$isInHand ? '127px' : '150px';
    }
    return props.$isInHand ? '180px' : '200px';
  }};
  padding: ${props => props.$isMobile ? '3px' : '5px'};
  border: 2px solid ${(props) => {
    if (props.$isSelected) return '#ffd700';
    if (props.$isTargetable) return '#ff9900';
    if (props.$type === 'spell') return '#48176e';
    return '#000';
  }};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 5px;
  cursor: ${(props) => (props.$canAttack || props.$isTargetable ? 'pointer' : 'default')};
  position: relative;
  transition: all 0.3s;
  transform-style: preserve-3d;
  box-shadow: ${(props) => props.$type === 'spell' ? '0 0 10px rgba(156, 39, 176, 0.3)' : '0 4px 8px rgba(0, 0, 0, 0.3)'};
  overflow: visible;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url(${cardTexture});
    background-size: 130%;
    border-radius: 8px;
    background-position: center;
    filter: grayscale(50%);
    z-index: -1;
  }
  
  ${(props) => props.$isInHand && `
    transform: translateY(35%) rotate(${-10 + Math.random() * 20}deg);
    &:hover {
      transform: translateY(-80px) rotate(0deg) scale(1.2);
      z-index: 1001;
    }
  `}

  ${(props) =>
    props.$isDragging &&
    `
    transform: rotate(5deg) scale(1.05);
    box-shadow: 0 5px 20px rgba(0,0,0,0.3);
    opacity: 1.0
  `}

  ${props => props.$isFrozen && frozenStyle}

  ${(props) => props.$canAttack && !props.$isInHand && css`
    box-shadow: 0 0 10px 3px #00ff00;
    &:hover {
      box-shadow: 0 0 15px 5px #00ff00;
    }
  `}

  ${(props) => props.$isTargetable && css`
    box-shadow: 0 0 10px 3px #ff0000;
    &:hover {
      box-shadow: 0 0 15px 5px #ff0000;
    }
  `}

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 8px;
    pointer-events: none;
    background: ${props => {
    switch (props.$rarity) {
      case 'common':
        return 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)';
      case 'uncommon':
        return 'linear-gradient(45deg, rgba(0,255,0,0.1) 0%, rgba(0,255,0,0) 100%)';
      case 'rare':
        return 'linear-gradient(45deg, rgba(0,112,255,0.1) 0%, rgba(0,112,255,0) 100%)';
      case 'epic':
        return 'linear-gradient(45deg, rgba(163,53,238,0.1) 0%, rgba(163,53,238,0) 100%)';
      case 'legendary':
        return 'linear-gradient(45deg, rgba(255,128,0,0.1) 0%, rgba(255,128,0,0) 100%)';
      default:
        return 'none';
    }
  }};
  }
`;

export const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;

export const CardImage = styled.img`
  width: 100%;
  aspect-ratio: 1.5;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 2px;
  min-height: ${props => props.$isMobile ? '45%' : '50%'};
  height: ${props => props.$isMobile ? '45%' : '50%'};
  flex-shrink: 0;
`;

// Upravte TauntLabel pro mobilní zobrazení
export const TauntLabel = styled.div`
  position: absolute;
  top: ${props => props.$isMobile ? '2px' : '5px'};
  left: ${props => props.$isMobile ? '2px' : '5px'};
  background-color: #ffd700;
  color: #000;
  font-weight: bold;
  padding: ${props => props.$isMobile ? '1px 3px' : '2px 5px'};
  border-radius: 5px;
  font-size: ${props => props.$isMobile ? '8px' : '12px'};
`;

// Upravte CardName pro mobilní zobrazení
export const CardName = styled.div`
  font-weight: bold;
  text-align: center;
  line-height: 1;
  margin-top: 1px;
  font-size: ${props => props.$isMobile ? '10px' : '14px'};
  margin-bottom: ${props => props.$isMobile ? '0px' : '0px'};
  color: white;
  position: relative;
  z-index: 2;
  text-shadow: 
    -1px -1px 0 #000,  
     1px -1px 0 #000,
    -1px  1px 0 #000,
     1px  1px 0 #000;
`;

// Upravte CardStats pro mobilní zobrazení
export const CardStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${props => props.$isMobile ? '12px' : '15px'};
  font-weight: bold;
  color: white;
  text-shadow: 
    -1px -1px 0 #000,  
     1px -1px 0 #000,
    -1px  1px 0 #000,
     1px  1px 0 #000;
  padding: ${props => props.$isMobile ? '0 2px' : '0'};
`;

// Upravte CardDescription pro mobilní zobrazení
export const CardDescription = styled.div`
  font-family: 'Arial', sans-serif;
  font-size: ${props => props.$isMobile ? '8px' : '11px'};
  line-height: ${props => props.$isMobile ? '9px' : '12px'};
  text-align: center;
  margin-top: ${props => props.$isMobile ? '1px' : '2px'};
  margin-bottom: ${props => props.$isMobile ? '1px' : '2px'};
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  color: white;
  text-shadow: 
    -1px -1px 0 #000,  
     1px -1px 0 #000,
    -1px  1px 0 #000,
     1px  1px 0 #000;
`;

// Upravte ManaCost pro mobilní zobrazení
export const ManaCost = styled.div`
  position: absolute;
  top: ${props => props.$isMobile ? '-8px' : '-10px'};
  left: ${props => props.$isMobile ? '-8px' : '-10px'};
  width: ${props => props.$isMobile ? '25px' : '30px'};
  height: ${props => props.$isMobile ? '25px' : '30px'};
  font-size: ${props => props.$isMobile ? '14px' : '16px'};
  background-color: ${props => props.$backgroundColor};
  color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  border: 2px solid ${props => props.$borderColor};
  box-shadow: 0 0 5px ${props => props.$increasedCost ? 'rgba(255, 0, 0, 0.5)' : 'rgba(33, 150, 243, 0.5)'};
  z-index: 10;
`;

const frozenStyle = css`
  filter: brightness(0.8) sepia(1) hue-rotate(180deg) saturate(5);
  box-shadow: 0 0 10px 2px #00ffff;
`;

export const FrozenOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 255, 255, 0.3);
  color: white;
  font-weight: bold;
  font-size: 50px;
  text-shadow: 1px 1px 2px black;
  pointer-events: none;
`;


export const DivineShieldOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 215, 0, 0.3);
  pointer-events: none;
  display: ${props => props.$isInHand ? 'none' : 'block'};
`;

export const RarityGem = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: calc(50% - 12px); // Posuneme gem na spodn hranu obrázku (obrázek má height: 50%)
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  z-index: 1; // Snížíme z-index, aby byl pod textem

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    background: ${props => {
    switch (props.$rarity) {
      case 'common':
        return 'linear-gradient(135deg, #9e9e9e, #f5f5f5)';
      case 'uncommon':
        return 'linear-gradient(135deg, #1b5e20, #4caf50)';
      case 'rare':
        return 'linear-gradient(135deg, #0d47a1, #2196f3)';
      case 'epic':
        return 'linear-gradient(135deg, #4a148c, #9c27b0)';
      case 'legendary':
        return 'linear-gradient(135deg, #e65100, #ff9800)';
      default:
        return '#9e9e9e';
    }
  }};
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }

  &::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${props => {
    switch (props.$rarity) {
      case 'common':
        return 'radial-gradient(circle, #ffffff 30%, #9e9e9e 70%)';
      case 'uncommon':
        return 'radial-gradient(circle, #81c784 30%, #1b5e20 70%)';
      case 'rare':
        return 'radial-gradient(circle, #64b5f6 30%, #0d47a1 70%)';
      case 'epic':
        return 'radial-gradient(circle, #ce93d8 30%, #4a148c 70%)';
      case 'legendary':
        return 'radial-gradient(circle, #ffb74d 30%, #e65100 70%)';
      default:
        return 'radial-gradient(circle, #ffffff 30%, #9e9e9e 70%)';
    }
  }};
    border: 2px solid ${props => {
    switch (props.$rarity) {
      case 'common':
        return '#f5f5f5';
      case 'uncommon':
        return '#4caf50';
      case 'rare':
        return '#2196f3';
      case 'epic':
        return '#9c27b0';
      case 'legendary':
        return '#ff9800';
      default:
        return '#f5f5f5';
    }
  }};
    box-shadow: inset 0 0 4px rgba(255, 255, 255, 0.5);
  }
`;


export const CardBack = styled.div`
  width: 100%;
  height: 100%;
  background-image: url(${cardBackImage});
  background-size: cover;
  background-position: center;
  border-radius: 8px;
`;
