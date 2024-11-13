import styled from "styled-components";

export const AnimationOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  cursor: pointer;
  animation: ${props => props.$isClosing ? 'fadeOut 0.5s ease-in-out forwards' : 'fadeIn 0.5s ease-in-out'};

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;

export const AnimationContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  animation: ${props => props.$isClosing ? 'slideOut 0.5s ease-in-out forwards' : 'slideIn 0.5s ease-in-out'};

  @keyframes slideIn {
    from {
      transform: translateY(-50px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(50px);
      opacity: 0;
    }
  }
`;

export const AnimatedCard = styled.div`
  transform-origin: center;
  animation: ${props => props.$animation} 0.8s cubic-bezier(0.4, 0, 0.2, 1);

  @keyframes flyInLeft {
    from {
      transform: translate(-100vw, 0) rotate(-20deg);
      opacity: 0;
    }
    to {
      transform: translate(0, 0) rotate(0);
      opacity: 1;
    }
  }

  @keyframes flyInRight {
    from {
      transform: translate(100vw, 0) rotate(20deg);
      opacity: 0;
    }
    to {
      transform: translate(0, 0) rotate(0);
      opacity: 1;
    }
  }

  @keyframes attackAnimation {
    0% {
      transform: translate(0, 0) rotate(0);
    }
    25% {
      transform: translate(-20px, -10px) rotate(-5deg);
    }
    50% {
      transform: translate(10px, 0) rotate(5deg) scale(1.1);
    }
    75% {
      transform: translate(-5px, 5px) rotate(-2deg);
    }
    100% {
      transform: translate(0, 0) rotate(0);
    }
  }

  @keyframes defendAnimation {
    0% {
      transform: translate(0, 0) rotate(0);
    }
    25% {
      transform: translate(10px, 5px) rotate(5deg);
    }
    50% {
      transform: translate(-5px, 0) rotate(-3deg) scale(0.95);
    }
    75% {
      transform: translate(2px, -2px) rotate(2deg);
    }
    100% {
      transform: translate(0, 0) rotate(0);
    }
  }
`;

export const AnimationText = styled.div`
  color: #ffd700;
  font-size: ${props => props.$isMobile ? '18px' : '24px'};
  text-align: center;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

export const AnimationCards = styled.div`
  display: flex;
  gap: 40px;
  align-items: center;
  justify-content: center;
`;

export const AnimationVS = styled.div`
  color: #ff0000;
  font-size: ${props => props.$isMobile ? '24px' : '32px'};
  margin: 0 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;


export const SkipText = styled.div`
  position: absolute;
  bottom: 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  text-align: center;
`;

// Přidáme nové styled komponenty pro kompaktní animace
export const CompactAnimationContainer = styled.div`
  position: fixed;
  top: 80px;
  right: 20px;
  width: 320px;
  background: rgba(0, 0, 0, 0.85);
  border: 2px solid #ffd700;
  border-radius: 12px;
  padding: 15px;
  z-index: 1000;
  pointer-events: none;
  animation: ${props => props.$isClosing ? 'slideOutRight 0.5s ease-in-out forwards' : 'slideInRight 0.5s ease-in-out'};

  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;

export const CompactAnimationContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
`;

export const CompactCardContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  min-height: 150px;
  
  > div {
    transform: scale(0.6);
    transform-origin: center;
    margin: -30px;
    
    > * {
      width: 140px;
      height: 200px;
    }
  }
`;

export const CompactAnimationText = styled.div`
  color: #ffd700;
  font-size: 14px;
  text-align: center;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  margin-bottom: 5px;
  padding: 0 10px;
`;

// Přidáme nové styled komponenty pro animaci schopnosti
export const AbilityAnimation = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100px;
    height: 100px;
    animation: pulseGlow 2s infinite;
    padding: 10px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 10px;

    @keyframes pulseGlow {
        0% { transform: scale(1); filter: brightness(1); }
        50% { transform: scale(1.1); filter: brightness(1.3); }
        100% { transform: scale(1); filter: brightness(1); }
    }
`;

export const HeroAbilityIcon = styled.img`
    width: 80px;
    height: 80px;
    object-fit: contain;
    filter: ${props => {
    switch (props.$heroType) {
      case 'Mage':
        return 'drop-shadow(0 0 10px #ff0000)'; // červená záře
      case 'Priest':
        return 'drop-shadow(0 0 10px #00ff00)'; // zelená záře
      case 'Seer':
        return 'drop-shadow(0 0 10px #ff00ff)'; // fialová záře
      case 'Defender':
        return 'drop-shadow(0 0 10px #0088ff)'; // modrá záře
      case 'Warrior':
        return 'drop-shadow(0 0 10px #8B9355)'; // olivově zelená záře
      default:
        return 'none';
    }
  }};
    transition: filter 0.3s ease;

    &:hover {
        filter: ${props => {
    switch (props.$heroType) {
      case 'Mage':
        return 'drop-shadow(0 0 15px #ff0000)';
      case 'Priest':
        return 'drop-shadow(0 0 15px #00ff00)';
      case 'Seer':
        return 'drop-shadow(0 0 15px #ff00ff)';
      case 'Defender':
        return 'drop-shadow(0 0 15px #0088ff)';
      case 'Warrior':
        return 'drop-shadow(0 0 15px #8B9355)';
      default:
        return 'none';
    }
  }};
    }
`;
