import styled, { keyframes } from "styled-components";

// Base keyframes for enhanced animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

// Enhanced card movement animations
const cardCharge = keyframes`
  0% {
    transform: translate(0, 0) scale(1) rotate(0deg);
    filter: brightness(1);
  }
  20% {
    transform: translate(0, -10px) scale(1.05) rotate(-2deg);
    filter: brightness(1.2);
  }
  60% {
    transform: translate(40px, -5px) scale(1.1) rotate(5deg);
    filter: brightness(1.4) drop-shadow(0 0 20px rgba(255, 0, 0, 0.8));
  }
  100% {
    transform: translate(80px, 0) scale(1.15) rotate(0deg);
    filter: brightness(1.6) drop-shadow(0 0 30px rgba(255, 0, 0, 1));
  }
`;

const cardRetreat = keyframes`
  0% {
    transform: translate(80px, 0) scale(1.15);
    filter: brightness(1.6);
  }
  100% {
    transform: translate(0, 0) scale(1);
    filter: brightness(1);
  }
`;

const cardShatter = keyframes`
  0% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
    filter: brightness(1);
  }
  25% {
    transform: scale(1.1) rotate(5deg);
    opacity: 0.8;
    filter: brightness(1.5) contrast(1.2);
  }
  50% {
    transform: scale(0.9) rotate(-10deg);
    opacity: 0.6;
    filter: brightness(2) contrast(1.5) blur(1px);
  }
  75% {
    transform: scale(0.7) rotate(15deg);
    opacity: 0.3;
    filter: brightness(3) contrast(2) blur(2px);
  }
  100% {
    transform: scale(0) rotate(30deg);
    opacity: 0;
    filter: brightness(5) contrast(3) blur(5px);
  }
`;

const clashExplosion = keyframes`
  0% {
    transform: scale(0);
    opacity: 0;
  }
  20% {
    transform: scale(0.5);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
`;

const particleExplosion = keyframes`
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: scale(1) rotate(180deg);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.5) rotate(360deg);
    opacity: 0;
  }
`;

// Magic spell animations
const magicGather = keyframes`
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
    filter: blur(10px);
  }
  50% {
    transform: scale(0.8) rotate(180deg);
    opacity: 0.6;
    filter: blur(5px);
  }
  100% {
    transform: scale(1) rotate(360deg);
    opacity: 1;
    filter: blur(0px);
  }
`;

const magicCircleRotate = keyframes`
  0% {
    transform: rotate(0deg) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: rotate(180deg) scale(1.1);
    opacity: 1;
  }
  100% {
    transform: rotate(360deg) scale(1);
    opacity: 0.8;
  }
`;

const lightningStrike = keyframes`
  0% {
    transform: translateY(-100px) scaleY(0);
    opacity: 0;
  }
  10% {
    transform: translateY(-50px) scaleY(0.5);
    opacity: 0.8;
  }
  20% {
    transform: translateY(0) scaleY(1);
    opacity: 1;
  }
  30% {
    transform: translateY(0) scaleY(1);
    opacity: 1;
  }
  100% {
    transform: translateY(0) scaleY(1);
    opacity: 0;
  }
`;

// Card summoning animations
const cardRise = keyframes`
  0% {
    transform: translateY(0) rotate(0deg) scale(1);
    filter: brightness(1);
  }
  50% {
    transform: translateY(-30px) rotate(10deg) scale(1.05);
    filter: brightness(1.3) drop-shadow(0 10px 20px rgba(255, 215, 0, 0.5));
  }
  100% {
    transform: translateY(-60px) rotate(0deg) scale(1.1);
    filter: brightness(1.5) drop-shadow(0 20px 40px rgba(255, 215, 0, 0.8));
  }
`;

const cardFloat = keyframes`
  0% {
    transform: translateY(-60px) rotate(0deg) scale(1.1);
  }
  25% {
    transform: translateY(-65px) rotate(5deg) scale(1.12);
  }
  50% {
    transform: translateY(-70px) rotate(0deg) scale(1.15);
  }
  75% {
    transform: translateY(-65px) rotate(-5deg) scale(1.12);
  }
  100% {
    transform: translateY(-60px) rotate(0deg) scale(1.1);
  }
`;

const cardDescend = keyframes`
  0% {
    transform: translateY(-60px) rotate(0deg) scale(1.1);
    filter: brightness(1.5) drop-shadow(0 20px 40px rgba(255, 215, 0, 0.8));
  }
  100% {
    transform: translateY(0) rotate(0deg) scale(1);
    filter: brightness(1) drop-shadow(0 0 0px rgba(255, 215, 0, 0));
  }
`;

const goldenShimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: 200px 0;
  }
`;

// Hero ability animations for different classes
const mageFireburst = keyframes`
  0% {
    transform: scale(0) rotate(0deg);
    filter: hue-rotate(0deg) brightness(1);
  }
  50% {
    transform: scale(1.2) rotate(180deg);
    filter: hue-rotate(180deg) brightness(2);
  }
  100% {
    transform: scale(2) rotate(360deg);
    filter: hue-rotate(360deg) brightness(3);
  }
`;

const priestHeal = keyframes`
  0% {
    transform: scale(0);
    filter: brightness(1) blur(0px);
    box-shadow: 0 0 0px rgba(255, 255, 255, 0);
  }
  50% {
    transform: scale(1.5);
    filter: brightness(3) blur(2px);
    box-shadow: 0 0 50px rgba(255, 255, 255, 0.8);
  }
  100% {
    transform: scale(3);
    filter: brightness(5) blur(5px);
    box-shadow: 0 0 100px rgba(255, 255, 255, 1);
  }
`;

const seerMystic = keyframes`
  0% {
    transform: scale(0) rotate(0deg);
    filter: hue-rotate(0deg) saturate(1);
  }
  33% {
    transform: scale(0.8) rotate(120deg);
    filter: hue-rotate(120deg) saturate(1.5);
  }
  66% {
    transform: scale(1.2) rotate(240deg);
    filter: hue-rotate(240deg) saturate(2);
  }
  100% {
    transform: scale(2) rotate(360deg);
    filter: hue-rotate(360deg) saturate(3);
  }
`;

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
  animation: ${props => props.$isClosing ? fadeOut : fadeIn} 0.5s ease-in-out;
  animation-fill-mode: forwards;
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

// Enhanced animated card components
export const AnimatedCard = styled.div`
  transform-origin: center;
  position: relative;
  animation: ${props => {
    switch (props.$animation) {
      case 'charge': return cardCharge;
      case 'retreat': return cardRetreat;
      case 'shatter': return cardShatter;
      case 'rise': return cardRise;
      case 'float': return cardFloat;
      case 'descend': return cardDescend;
      default: return 'none';
    }
  }} ${props => props.$duration || '1s'} ${props => props.$easing || 'ease-in-out'};
  animation-fill-mode: forwards;
`;

// Attack animation components
export const AttackPhaseContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 100px;
  width: 100%;
  height: 300px;
`;

export const ChargingCard = styled.div`
  position: relative;
  animation: ${cardCharge} 1.2s ease-out forwards;
  
  &::before {
    content: '';
    position: absolute;
    top: -20px;
    left: -20px;
    right: -20px;
    bottom: -20px;
    background: radial-gradient(circle, rgba(255, 0, 0, 0.3) 0%, transparent 70%);
    border-radius: 50%;
    animation: ${particleExplosion} 1.2s ease-out forwards;
    z-index: -1;
  }
`;

export const DefendingCard = styled.div`
  position: relative;
  animation: shake 0.8s ease-in-out;
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10% { transform: translateX(-5px) rotate(-1deg); }
    20% { transform: translateX(5px) rotate(1deg); }
    30% { transform: translateX(-3px) rotate(-0.5deg); }
    40% { transform: translateX(3px) rotate(0.5deg); }
    50% { transform: translateX(-2px); }
    60% { transform: translateX(2px); }
  }
`;

export const ClashExplosion = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, 
    rgba(255, 255, 255, 1) 0%,
    rgba(255, 100, 0, 0.8) 30%,
    rgba(255, 0, 0, 0.6) 60%,
    transparent 100%
  );
  border-radius: 50%;
  animation: ${clashExplosion} 0.8s ease-out forwards;
  
  &::before, &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
  }
  
  &::before {
    width: 120%;
    height: 120%;
    background: radial-gradient(circle, 
      rgba(255, 255, 0, 0.6) 0%,
      rgba(255, 100, 0, 0.4) 50%,
      transparent 100%
    );
    animation: ${clashExplosion} 0.8s ease-out 0.1s forwards;
  }
  
  &::after {
    width: 80%;
    height: 80%;
    background: radial-gradient(circle, 
      rgba(255, 255, 255, 0.9) 0%,
      rgba(255, 255, 0, 0.6) 40%,
      transparent 100%
    );
    animation: ${clashExplosion} 0.6s ease-out 0.2s forwards;
  }
`;

export const ShatteringCard = styled.div`
  position: relative;
  animation: ${cardShatter} 1.5s ease-in forwards;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(200,200,200,0.8)"/><circle cx="80" cy="30" r="1.5" fill="rgba(150,150,150,0.7)"/><circle cx="60" cy="70" r="2.5" fill="rgba(180,180,180,0.9)"/><circle cx="30" cy="80" r="1" fill="rgba(160,160,160,0.6)"/><circle cx="70" cy="50" r="2" fill="rgba(190,190,190,0.8)"/></svg>');
    animation: ${particleExplosion} 1.5s ease-out forwards;
    z-index: 1;
    pointer-events: none;
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

// Spell animation components
export const SpellCastingArea = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 400px;
  height: 300px;
`;

export const MagicCircle = styled.div`
  position: absolute;
  width: ${props => props.$size || '200px'};
  height: ${props => props.$size || '200px'};
  border: 3px solid ${props => props.$color || 'rgba(0, 150, 255, 0.8)'};
  border-radius: 50%;
  background: radial-gradient(circle, 
    ${props => props.$color || 'rgba(0, 150, 255, 0.1)'} 0%, 
    transparent 70%
  );
  animation: ${magicCircleRotate} 2s linear infinite;
  
  &::before {
    content: '';
    position: absolute;
    top: 10%;
    left: 10%;
    right: 10%;
    bottom: 10%;
    border: 2px dashed ${props => props.$color || 'rgba(0, 150, 255, 0.6)'};
    border-radius: 50%;
    animation: ${magicCircleRotate} 1.5s linear infinite reverse;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 25%;
    left: 25%;
    right: 25%;
    bottom: 25%;
    border: 1px solid ${props => props.$color || 'rgba(0, 150, 255, 0.4)'};
    border-radius: 50%;
    animation: ${magicCircleRotate} 1s linear infinite;
  }
`;

export const LightningBolt = styled.div`
  position: absolute;
  width: 4px;
  height: 150px;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 1) 0%,
    rgba(0, 150, 255, 1) 50%,
    rgba(255, 255, 255, 1) 100%
  );
  animation: ${lightningStrike} 0.3s ease-out forwards;
  transform-origin: top center;
  box-shadow: 
    0 0 10px rgba(0, 150, 255, 1),
    0 0 20px rgba(0, 150, 255, 0.8),
    0 0 30px rgba(0, 150, 255, 0.6);
  
  &::before {
    content: '';
    position: absolute;
    top: 30%;
    left: -2px;
    width: 8px;
    height: 2px;
    background: inherit;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 60%;
    right: -2px;
    width: 8px;
    height: 2px;
    background: inherit;
  }
`;

export const SpellBurst = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, 
    rgba(0, 150, 255, 0.8) 0%,
    rgba(100, 200, 255, 0.6) 30%,
    rgba(0, 150, 255, 0.4) 60%,
    transparent 100%
  );
  border-radius: 50%;
  animation: ${magicGather} 1.5s ease-out forwards;
  
  &::before {
    content: '✨';
    position: absolute;
    top: 20%;
    left: 20%;
    font-size: 20px;
    animation: ${particleExplosion} 1.5s ease-out forwards;
  }
  
  &::after {
    content: '⚡';
    position: absolute;
    bottom: 20%;
    right: 20%;
    font-size: 20px;
    animation: ${particleExplosion} 1.5s ease-out 0.3s forwards;
  }
`;

// Card summoning components
export const SummonArea = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 300px;
  height: 400px;
`;

export const FloatingCard = styled.div`
  position: relative;
  animation: ${cardRise} 1s ease-out forwards, 
             ${cardFloat} 2s ease-in-out 1s infinite;
             
  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: -10px;
    right: -10px;
    bottom: -10px;
    background: linear-gradient(45deg, 
      rgba(255, 215, 0, 0.3) 0%,
      rgba(255, 215, 0, 0.1) 50%,
      rgba(255, 215, 0, 0.3) 100%
    );
    background-size: 200% 200%;
    animation: ${goldenShimmer} 2s linear infinite;
    border-radius: 10px;
    z-index: -1;
  }
`;

export const GoldenParticles = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  
  &::before, &::after {
    content: '✨';
    position: absolute;
    font-size: 16px;
    color: rgba(255, 215, 0, 0.8);
    animation: ${particleExplosion} 2s ease-out infinite;
  }
  
  &::before {
    top: 20%;
    left: 10%;
    animation-delay: 0s;
  }
  
  &::after {
    bottom: 20%;
    right: 10%;
    animation-delay: 1s;
  }
`;

// Enhanced hero ability components
export const AbilityAnimation = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 200px;
  height: 200px;
  position: relative;
  animation: ${props => {
    switch (props.$heroType) {
      case 'Mage': return mageFireburst;
      case 'Priest': return priestHeal;
      case 'Seer': return seerMystic;
      default: return magicGather;
    }
  }} 2s ease-out forwards;
`;

export const HeroAbilityIcon = styled.img`
  width: 120px;
  height: 120px;
  object-fit: contain;
  border-radius: 50%;
  border: 3px solid ${props => {
    switch (props.$heroType) {
      case 'Mage': return 'rgba(255, 0, 0, 0.8)';
      case 'Priest': return 'rgba(0, 255, 0, 0.8)';
      case 'Seer': return 'rgba(255, 0, 255, 0.8)';
      case 'Defender': return 'rgba(0, 100, 255, 0.8)';
      case 'Warrior': return 'rgba(139, 147, 85, 0.8)';
      default: return 'rgba(255, 215, 0, 0.8)';
    }
  }};
  filter: ${props => {
    switch (props.$heroType) {
      case 'Mage': return 'drop-shadow(0 0 20px rgba(255, 0, 0, 0.8))';
      case 'Priest': return 'drop-shadow(0 0 20px rgba(0, 255, 0, 0.8))';
      case 'Seer': return 'drop-shadow(0 0 20px rgba(255, 0, 255, 0.8))';
      case 'Defender': return 'drop-shadow(0 0 20px rgba(0, 100, 255, 0.8))';
      case 'Warrior': return 'drop-shadow(0 0 20px rgba(139, 147, 85, 0.8))';
      default: return 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))';
    }
  }};
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
`;

// Particle system components
export const ParticleField = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
`;

export const Particle = styled.div`
  position: absolute;
  width: ${props => props.$size || '4px'};
  height: ${props => props.$size || '4px'};
  background: ${props => props.$color || 'rgba(255, 215, 0, 0.8)'};
  border-radius: 50%;
  animation: ${particleExplosion} ${props => props.$duration || '2s'} ease-out forwards;
  animation-delay: ${props => props.$delay || '0s'};
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    right: -50%;
    bottom: -50%;
    background: inherit;
    border-radius: 50%;
    opacity: 0.5;
  }
`;
