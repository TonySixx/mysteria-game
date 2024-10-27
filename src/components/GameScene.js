import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import styled from 'styled-components';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import earthGolem from '../assets/images/earth-golem.png';
import fireball from '../assets/images/fireball.png';
import healingTouch from '../assets/images/healing-touch.png';
import lightningBolt from '../assets/images/lightning-bolt.png';
import arcaneIntellect from '../assets/images/arcane-intellect.png';
import fireElemental from '../assets/images/fire-elemental.png';
import shieldBearer from '../assets/images/shield-bearer.png';
import waterElemental from '../assets/images/water-elemental.png';
import coinImage from '../assets/images/mana-coin.png';
import cardTexture from '../assets/images/card-texture.png';
import playerHeroImage from '../assets/images/player-hero.png';
import aiHeroImage from '../assets/images/ai-hero.png';
import { css } from 'styled-components';
import { VisualFeedbackContainer } from './VisualFeedback';
import { Notification } from './Notification';
import nimbleSprite from '../assets/images/nimble-sprite.png';
import arcaneFamiliar from '../assets/images/arcane-familiar.png';
import glacialBurst from '../assets/images/glacial-burst.png';
import radiantProtector from '../assets/images/radiant-protector.png';
import infernoWave from '../assets/images/inferno-wave.png';
import { addSpellVisualFeedback, addVisualFeedback } from '../utils/visualFeedbackUtils';
import cardBackImage from '../assets/images/card-back.png';
import { Card, UnitCard, SpellCard, Hero } from '../game/CardClasses';
import { startNextTurn, checkGameOver } from '../game/gameLogic';
import { attack } from '../game/combatLogic';
import { playCardCommon, playCoin } from '../game/gameLogic';
import { performAIAttacks, chooseTarget } from '../game/combatLogic';
import { CombatLog } from './CombatLog';
import {
  calculateFieldStrength,
  categorizeDeckCards,
  decideCoinUsage,
  executeDefensiveStrategy,
  executeAggressiveStrategy,
  executeBalancedStrategy,
  performOptimizedAttacks,
  canKillOpponent,
  executeLethalSequence,
  finalizeTurn // Přidán import finalizeTurn
} from '../game/aiStrategy';
import { theme } from '../styles/theme';

// Přesuneme Tooltip komponentu na začátek, hned po importech
const Tooltip = styled.div`
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
`;

const BASE_WIDTH = 1920; // Základní šířka pro full HD
const BASE_HEIGHT = 1080; // Základní výška pro full HD
const MIN_SCALE = 0.5; // Minimální scale faktor
const MAX_SCALE = 1.2; // Maximální scale faktor

// Přidejte tyto konstanty pod existující BASE konstanty
const MOBILE_BASE_WIDTH = 1280; // Základní šířka pro mobilní zobrazení
const MOBILE_BASE_HEIGHT = 720; // Základní výška pro mobilní zobrazení
const MOBILE_CARD_SCALE = 0.8; // Zmenšení karet pro mobilní zobrazení

// Přidejte hook pro detekci mobilního zařízení
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= 1024 || 
                           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

// Přidejte tento styled component pro wrapper celé hry
const ScalableGameWrapper = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(${props => props.$scale});
  transform-origin: center center;
  width: ${props => props.$isMobile ? MOBILE_BASE_WIDTH : BASE_WIDTH}px;
  height: ${props => props.$isMobile ? MOBILE_BASE_HEIGHT : BASE_HEIGHT}px;
`;

// Upravíme GameBoard styled component
const GameBoard = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: url('/background.png') no-repeat center center;
  background-size: cover;
  color: #ffd700;
  font-family: 'Cinzel', serif;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
`;


const BattleArea = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  justify-content: space-between;
`;

const HeroArea = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: ${props => props.$isMobile ? '-30px' : '0px'};
  height: ${props => props.$isMobile ? '130px' : '150px'};
`;

const FieldArea = styled.div`
  display: flex;
  justify-content: center;
  gap: ${props => props.$isMobile ? '5px' : '10px'};
  flex-wrap: wrap;
  width: 100%;
  padding: ${props => props.$isMobile ? '5px 0' : '10px 0'};
  box-sizing: border-box;
  min-height: ${props => props.$isMobile ? '160px' : '220px'};
`;

const HandArea = styled.div`
  position: absolute;
  bottom: ${props => props.$isMobile ? '-20px' : '-40px'};
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  gap: ${props => props.$isMobile ? '2px' : '5px'};
  padding: ${props => props.$isMobile ? '5px 0' : '10px 0'};
  perspective: 1000px;
  min-height: ${props => props.$isMobile ? '160px' : '220px'};
`;

const PlayerInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: ${props => props.$isMobile ? '5px 10px' : '10px 20px'};
  background-color: rgba(0, 0, 0, 0.7);
  position: ${props => props.$isBottom && props.$isMobile ? 'relative' : 'relative'};
  bottom: ${props => props.$isBottom && props.$isMobile ? 'auto' : 'auto'};
  margin-top: ${props => props.$isPlayer && props.$isMobile ? '-60px' : '0px'};
`;

const DeckAndManaContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const DeckContainer = styled.div`
  position: relative;
  width: 40px;
  height: 60px;
  background: linear-gradient(45deg, #4a4a4a, #3a3a3a);
  border: 2px solid #ffd700;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ffd700;
  font-size: 14px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  cursor: help;

  &:hover ${Tooltip} {
    opacity: 1;
  }
`;

const ManaInfo = styled.div`
  position: relative;
  font-size: 18px;
  color: #4fc3f7;
  text-shadow: 0 0 5px #4fc3f7;
  cursor: help;

  &:hover ${Tooltip} {
    opacity: 1;
  }
`;

const EndTurnButton = styled.button`
  font-size: 16px;
  padding: 8px 16px;
  background: linear-gradient(45deg, #ffd700, #ff9900);
  border: none;
  border-radius: 5px;
  color: #000;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  margin-right: 36px;
  opacity: ${props => props.disabled ? 0.5 : 1};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  
  &:hover {
    transform: ${props => props.disabled ? 'none' : 'scale(1.05)'};
    box-shadow: ${props => props.disabled ? 'none' : '0 0 10px #ffd700'};
  }
`;

const DraggableCardWrapper = styled.div`
  z-index: 1000;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-10px);
  }
`;

// Upravte CardComponent pro lepší mobilní zobrazení
const CardComponent = styled.div`
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

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;

const CardImage = styled.img`
  width: 100%;
  height: 50%;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 2px;
`;

// Upravte TauntLabel pro mobilní zobrazení
const TauntLabel = styled.div`
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
const CardName = styled.div`
  font-weight: bold;
  text-align: center;
  font-size: ${props => props.$isMobile ? '10px' : '14px'};
  margin-bottom: ${props => props.$isMobile ? '2px' : '5px'};
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
const CardStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${props => props.$isMobile ? '12px' : '16px'};
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
const CardDescription = styled.div`
  font-family: 'Arial', sans-serif;
  font-size: ${props => props.$isMobile ? '8px' : '11px'};
  line-height: ${props => props.$isMobile ? '9px' : '12px'};
  text-align: center;
  margin-top: ${props => props.$isMobile ? '1px' : '2px'};
  margin-bottom: ${props => props.$isMobile ? '1px' : '2px'};
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  color: white;
  text-shadow: 
    -1px -1px 0 #000,  
     1px -1px 0 #000,
    -1px  1px 0 #000,
     1px  1px 0 #000;
`;

// Upravte ManaCost pro mobilní zobrazení
const ManaCost = styled.div`
  position: absolute;
  top: ${props => props.$isMobile ? '-8px' : '-10px'};
  left: ${props => props.$isMobile ? '-8px' : '-10px'};
  width: ${props => props.$isMobile ? '25px' : '30px'};
  height: ${props => props.$isMobile ? '25px' : '30px'};
  font-size: ${props => props.$isMobile ? '14px' : '16px'};
  background-color: #4fc3f7;
  color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  border: 2px solid #2196f3;
  box-shadow: 0 0 5px rgba(33, 150, 243, 0.5);
  z-index: 10;
`;

const frozenStyle = css`
  filter: brightness(0.8) sepia(1) hue-rotate(180deg) saturate(5);
  box-shadow: 0 0 10px 2px #00ffff;
`;

const FrozenOverlay = styled.div`
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


const DivineShieldOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 215, 0, 0.3);
  pointer-events: none;
  display: ${props => props.$isInHand ? 'none' : 'block'};
`;

const RarityGem = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: calc(50% - 12px); // Posuneme gem na spodní hranu obrázku (obrázek má height: 50%)
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

function HeroDisplay({ hero, onClick, isTargetable,heroName }) {
  return (
    <HeroComponent onClick={isTargetable ? onClick : null} isTargetable={isTargetable}>
      <HeroImage src={hero.name === 'Player' ? playerHeroImage : aiHeroImage} alt={hero.name} isTargetable={isTargetable} />
      <HeroHealth>
        <HeartIcon>❤️</HeartIcon>
        {hero.health}
      </HeroHealth>
      <HeroName>{heroName}</HeroName>
    </HeroComponent>
  );
}

const HeroName = styled.div`
  position: absolute;
  top: 0;
  left: 72px;
  background-color: rgba(0, 0, 0, 0.7);
  color: ${theme.colors.text.primary};
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 14px;
  display: flex;
  align-items: flex-end;
  text-shadow: ${theme.shadows.golden};
`;

const HeroComponent = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isTargetable'].includes(prop),
})`
  width: 120px;
  height: 120px;
  position: relative;
  cursor: ${(props) => (props.isTargetable ? 'pointer' : 'default')};
`;

const HeroImage = styled.img.withConfig({
  shouldForwardProp: (prop) => !['isTargetable'].includes(prop),
})`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #ffd700;
  box-shadow: ${(props) => props.isTargetable ? '0 0 10px 3px #ff0000' : '0 0 10px rgba(255, 215, 0, 0.5)'};
  transition: all 0.3s ease;

  ${(props) => props.isTargetable && `
    &:hover {
      transform: scale(1.05);
      box-shadow: 0 0 15px 5px #ff0000;
    }
  `}
`;

const HeroHealth = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 14px;
  display: flex;
  align-items: center;
`;

const HeartIcon = styled.span`
  margin-right: 2px;
  font-size: 12px;
`;

const CardBack = styled.div`
  width: 100%;
  height: 100%;
  background-image: url(${cardBackImage});
  background-size: cover;
  background-position: center;
  border-radius: 8px;
`;

// Nejdřív vytvoříme mapu obrázků
const cardImages = {
  'fireElemental': fireElemental,
  'earthGolem': earthGolem,
  'fireball': fireball,
  'healingTouch': healingTouch,
  'lightningBolt': lightningBolt,
  'arcaneIntellect': arcaneIntellect,
  'shieldBearer': shieldBearer,
  'waterElemental': waterElemental,
  'nimbleSprite': nimbleSprite,
  'arcaneFamiliar': arcaneFamiliar,
  'glacialBurst': glacialBurst,
  'radiantProtector': radiantProtector,
  'infernoWave': infernoWave,
  'coinImage': coinImage
};

// Upravte CardDisplay komponentu
const CardDisplay = memo(({ card, canAttack, isTargetable, isSelected, isInHand, isDragging, isOpponentCard }) => {
  const isMobile = useIsMobile();

  if (!card) return null;

  if (isOpponentCard) {
    return (
      <CardComponent 
        $isInHand={isInHand} 
        $isDragging={isDragging}
        $isMobile={isMobile}
        $isOpponentCard={isOpponentCard} // Přidáme prop pro karty oponenta
      >
        <CardBack />
      </CardComponent>
    );
  }

  // Získáme správný obrázek z mapy
  const cardImage = cardImages[card.image] || cardBackImage;

  return (
    <CardComponent
      $type={card.type}
      $canAttack={canAttack}
      $isTargetable={isTargetable}
      $isSelected={isSelected}
      $isInHand={isInHand}
      $isDragging={isDragging}
      $isFrozen={card.frozen}
      $rarity={card.rarity}
      $isMobile={isMobile}
    >
      <ManaCost $isMobile={isMobile}>{card.manaCost}</ManaCost>
      <RarityGem $rarity={card.rarity} $isMobile={isMobile} />
      <CardImage 
        style={{ 
          borderRadius: '4px', 
          border: '1px solid #000000',
          height: isMobile ? '45%' : '50%' // Zmenšíme obrázek na mobilních zařízeních
        }} 
        src={cardImage} 
        alt={card.name} 
      />
      {card.hasTaunt && <TauntLabel $isMobile={isMobile}>Taunt</TauntLabel>}
      {card.hasDivineShield && <DivineShieldOverlay $isInHand={isInHand} />}
      <CardContent>
        <CardName $isMobile={isMobile}>{card.name}</CardName>
        <CardDescription $isMobile={isMobile}>{card.effect}</CardDescription>
        <CardStats $isMobile={isMobile}>
          {card.type === 'unit' && (
            <>
              <span>⚔️ {card.attack}</span>
              <span>❤️ {card.health}</span>
            </>
          )}
        </CardStats>
      </CardContent>
      {card.frozen && (
        <FrozenOverlay>
          <span role="img" aria-label="snowflake" style={{ fontSize: isMobile ? '30px' : '50px' }}>❄️</span>
        </FrozenOverlay>
      )}
    </CardComponent>
  );
});

// Přidejte tyto styled komponenty po ostatních styled komponentách

const GameOverOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.5s ease-in;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const GameOverContent = styled.div`
  text-align: center;
  color: #ffd700;
  animation: slideIn 0.5s ease-out;

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
`;

const GameOverTitle = styled.h1`
  font-size: 4em;
  margin-bottom: 20px;
  text-shadow: 0 0 10px #ffd700;
`;

const GameOverMessage = styled.h2`
  font-size: 2.5em;
  margin-bottom: 30px;
  color: ${props => props.$isWinner ? '#4CAF50' : '#f44336'};
  text-shadow: 0 0 8px ${props => props.$isWinner ? '#4CAF50' : '#f44336'};
`;

const PlayAgainButton = styled.button`
  font-size: 1.5em;
  padding: 15px 30px;
  background: linear-gradient(45deg, #ffd700, #ff9900);
  border: none;
  border-radius: 8px;
  color: #000;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: bold;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 15px #ffd700;
  }
`;

function GameScene({ gameState, onPlayCard, onAttack, onEndTurn }) {
  const [notification, setNotification] = useState(null);
  const [logEntries, setLogEntries] = useState([]);
  const [scale, setScale] = useState(1);
  const isMobile = useIsMobile();

  // Přidáme useEffect pro sledování nových zpráv z combat logu
  useEffect(() => {
    if (gameState?.combatLogMessage) {
      setLogEntries(prev => [...prev, {
        ...gameState.combatLogMessage,
        id: Math.random().toString(36).substr(2, 9) // Přidáme unikátní ID pro React key
      }]);
    }
  }, [gameState?.combatLogMessage]);

  // Zjednodušený useEffect pro notifikace
  useEffect(() => {
    if (gameState?.notification) {
      const notificationMessage = typeof gameState.notification === 'object' 
        ? gameState.notification.message 
        : gameState.notification;

      const isForThisPlayer = typeof gameState.notification === 'object' 
        ? !gameState.notification.forPlayer || gameState.notification.forPlayer === gameState.playerIndex
        : true;

      if (isForThisPlayer) {
        setNotification(notificationMessage);
        // Automaticky odstraníme notifikaci po 3 sekundách
        const timer = setTimeout(() => {
          setNotification(null);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState?.notification, gameState?.playerIndex]);

  // Přidejte useEffect pro výpočet scale faktoru
  useEffect(() => {
    const calculateScale = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      const baseWidth = isMobile ? MOBILE_BASE_WIDTH : BASE_WIDTH;
      const baseHeight = isMobile ? MOBILE_BASE_HEIGHT : BASE_HEIGHT;
      
      const scaleX = windowWidth / baseWidth;
      const scaleY = windowHeight / baseHeight;
      
      let newScale = Math.min(scaleX, scaleY);
      newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
      
      setScale(newScale);
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [isMobile]);

  // Vylepšený onDragEnd s logováním
  const onDragEnd = useCallback((result) => {
    const { source, destination } = result;
    if (!destination || !gameState) return;

    console.log('Drag end:', {
      source,
      destination,
      currentPlayer: gameState.currentPlayer,
      playerIndex: gameState.playerIndex
    });

    if (gameState.currentPlayer !== gameState.playerIndex) {
      setNotification('Not your turn!');
      return;
    }

    if (source.droppableId === 'hand' && destination.droppableId === 'playerField') {
      const cardIndex = source.index;
      const card = gameState.player.hand[cardIndex];
      
      if (!card) return;
      
      if (card.manaCost > gameState.player.mana) {
        setNotification('Not enough mana!');
        return;
      }

      // Přidáme destinationIndex pro určení pozice, kam chceme kartu umístit
      onPlayCard({ 
        cardIndex,
        destinationIndex: destination.index // Přidáme index cílové pozice
      });
    } 
    else if (source.droppableId === 'playerField') {
      const attackerIndex = source.index;
      const attacker = gameState.player.field[attackerIndex];
      
      console.log('Útok jednotkou:', {
        attackerIndex,
        attacker,
        destination: destination.droppableId
      });

      if (!attacker || attacker.hasAttacked || attacker.frozen) {
        setNotification('This unit cannot attack!');
        return;
      }

      if (destination.droppableId === 'opponentHero') {
        console.log('Útok na hrdinu');
        onAttack({
          attackerIndex,
          targetIndex: null,
          isHeroTarget: true
        });
      } 
      else if (destination.droppableId.startsWith('opponentCard-')) {
        const targetIndex = parseInt(destination.droppableId.split('-')[1]);
        console.log('Útok na jednotku:', { targetIndex });
        onAttack({
          attackerIndex,
          targetIndex,
          isHeroTarget: false
        });
      }
    }
  }, [gameState, onAttack, onPlayCard]);

  // Upravíme renderClone pro bezpečné použití gameState
  const renderClone = useCallback((provided, snapshot, rubric) => {
    const card = gameState?.player?.hand[rubric.source.index];
    if (!card) return null;

    return (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
      >
        <CardDisplay
          card={card}
          isInHand={true}
          isDragging={true}
        />
      </div>
    );
  }, [gameState]);

  const OpponentHandArea = styled(HandArea)`
    top: 10px;
    bottom: auto;
    transform: translateX(-50%) rotate(180deg);
  `;

  // Přidáme early return pro případ, že gameState není definován
  if (!gameState || !gameState.player) {
    return (
      <GameBoard>
        <h1>Waiting for opponent...</h1>
      </GameBoard>
    );
  }

  // Přidáme early return pro konec hry
  if (gameState.gameOver) {
    const isWinner = gameState.winner === gameState.playerIndex;
    return (
      <GameBoard>
        <GameOverOverlay>
          <GameOverContent>
            <GameOverTitle>Game Over</GameOverTitle>
            <GameOverMessage $isWinner={isWinner}>
              {isWinner ? 'Victory!' : 'Defeat!'}
            </GameOverMessage>
            <PlayAgainButton onClick={() => window.location.reload()}>
              Play Again
            </PlayAgainButton>
          </GameOverContent>
        </GameOverOverlay>
        {/* Ponecháme původní herní scénu v pozadí */}
        <BattleArea>
          {/* ... zbytek vašeho původního kódu ... */}
        </BattleArea>
      </GameBoard>
    );
  }

  // Upravte velikosti textu pro mobilní zobrazení
  const getTextSize = (baseSize) => {
    return isMobile ? baseSize * 0.8 : baseSize;
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <ScalableGameWrapper $scale={scale} $isMobile={isMobile}>
        <GameBoard>
          <PlayerInfo $isMobile={isMobile}>
            <DeckAndManaContainer>
              <DeckContainer>
                {gameState.opponent.deckSize}
                <Tooltip $position="bottom">
                  Cards in deck
                </Tooltip>
              </DeckContainer>
              <ManaInfo>
                💎 {gameState.opponent.mana}/{gameState.opponent.maxMana}
                <Tooltip $position="bottom">
                  Mana crystals
                </Tooltip>
              </ManaInfo>
            </DeckAndManaContainer>
          </PlayerInfo>

          <OpponentHandArea $isMobile={isMobile}>
            {gameState.opponent.hand.map((card, index) => (
              <CardDisplay
                key={card.id}
                card={card}
                isInHand={true}
                isOpponentCard={true}
              />
            ))}
          </OpponentHandArea>

          <BattleArea>
            <Droppable droppableId="opponentHero" direction="horizontal">
              {(provided, snapshot) => (
                <HeroArea
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    background: snapshot.isDraggingOver ? 'rgba(255, 0, 0, 0.3)' : 'transparent',
                  }}
                >
                  <HeroDisplay
                    hero={gameState.opponent.hero}
                    heroName={gameState.opponent.username}
                    isTargetable={
                      gameState.currentPlayer === gameState.playerIndex &&
                      gameState.player.field.some(card => !card.hasAttacked && !card.frozen) &&
                      gameState.opponent.field.every(card => !card.hasTaunt)
                    }
                  />
                  {provided.placeholder}
                </HeroArea>
              )}
            </Droppable>

            <FieldArea $isMobile={isMobile}>
              {gameState.opponent.field.map((card, index) => (
                <Droppable droppableId={`opponentCard-${index}`} key={card.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        position: 'relative',
                        background: snapshot.isDraggingOver ? 'rgba(255, 0, 0, 0.5)' : 'transparent',
                      }}
                    >
                      <CardDisplay
                        card={card}
                        isTargetable={gameState.player.field.some(card => !card.hasAttacked && !card.frozen) && (gameState.opponent.field.every(unit => !unit.hasTaunt) || card.hasTaunt)}
                      />
                      {snapshot.isDraggingOver ? <div style={{ position: 'absolute', height: '100px', width: '100%', background: 'rgba(255, 0, 0, 0.5)', borderEndStartRadius: '8px', borderEndEndRadius: '8px' }} /> : null}
                    </div>
                  )}
                </Droppable>
              ))}
            </FieldArea>

            <Droppable droppableId="playerField" direction="horizontal">
              {(provided, snapshot) => (
                <FieldArea
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    background: snapshot.isDraggingOver ? 'rgba(255, 215, 0, 0.3)' : 'transparent',
                    display: 'flex',
                    gap: '10px',
                    minHeight: '200px', // Zajistíme minimální výšku pro prázdné pole
                  }}
                >
                  {gameState.player.field.map((card, index) => (
                    <Draggable key={card.id} draggableId={card.id} index={index} isDragDisabled={card.hasAttacked || card.frozen}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <CardDisplay
                            card={card}
                            canAttack={gameState.currentPlayer === gameState.playerIndex && !card.hasAttacked && !card.frozen}
                            isDragging={snapshot.isDragging}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </FieldArea>
              )}
            </Droppable>

            <HeroArea $isMobile={isMobile}>
              <HeroDisplay hero={gameState.player.hero} heroName={gameState.player.username} />
            </HeroArea>
          </BattleArea>

          <PlayerInfo $isPlayer={true} $isMobile={isMobile} $isBottom={true}>
            <DeckAndManaContainer>
              <DeckContainer>
                {gameState.player.deck}
                <Tooltip $position="top">
                  Cards in deck
                </Tooltip>
              </DeckContainer>
              <ManaInfo>
                💎 {gameState.player.mana}/{gameState.player.maxMana}
                <Tooltip $position="top">
                  Mana crystals
                </Tooltip>
              </ManaInfo>
            </DeckAndManaContainer>
            <EndTurnButton 
              onClick={onEndTurn}
              disabled={gameState.currentPlayer !== gameState.playerIndex}
            >
              End turn
            </EndTurnButton>
          </PlayerInfo>

          <Droppable droppableId="hand" direction="horizontal" renderClone={renderClone}>
            {(provided) => (
              <HandArea
                $isMobile={isMobile}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {gameState.player.hand.map((card, index) => (
                  <Draggable key={card.id} draggableId={card.id} index={index}>
                    {(provided, snapshot) => (
                      <DraggableCardWrapper
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          ...provided.draggableProps.style,
                          opacity: snapshot.isDragging ? 0 : 1,
                        }}
                      >
                        <CardDisplay
                          card={card}
                          isInHand={true}
                          isDragging={snapshot.isDragging}
                        />
                      </DraggableCardWrapper>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </HandArea>
            )}
          </Droppable>
          <Notification message={notification} />
          <CombatLog logEntries={logEntries} />
        </GameBoard>
      </ScalableGameWrapper>
    </DragDropContext>
  );
}

export default GameScene;
