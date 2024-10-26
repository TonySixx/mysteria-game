import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import Notification from './Notification';  // místo import { Notification }
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
import backgroundImage from '../assets/images/background.png';
import { createPortal } from 'react-dom';

// Na začátek souboru přidejte nové konstanty pro škálování
const BREAKPOINTS = {
  small: 512,
  medium: 768,
  large: 1024
};

// Přidejte novou styled komponentu pro kontejner s CSS proměnnými
const GameScaleContainer = styled.div`
  --scale-factor: 1;
  --card-width: calc(120px * var(--scale-factor));
  --card-height: calc(180px * var(--scale-factor));
  --field-card-width: calc(140px * var(--scale-factor));
  --field-card-height: calc(200px * var(--scale-factor));
  --hero-size: calc(120px * var(--scale-factor));
  --spacing: calc(10px * var(--scale-factor));
  
  @media (max-height: ${BREAKPOINTS.small}px) {
    --scale-factor: 0.5;
  }
  
  @media (min-height: ${BREAKPOINTS.small}px) and (max-height: ${BREAKPOINTS.medium}px) {
    --scale-factor: 0.6;
  }
  
  @media (min-height: ${BREAKPOINTS.medium}px) and (max-height: ${BREAKPOINTS.large}px) {
    --scale-factor: 0.75;
  }
  
  width: 100%;
  height: 100vh;
`;

const GameBoard = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  background: url(${backgroundImage}) center center / cover no-repeat fixed;
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

const PlayerArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  padding: 10px 0;
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
  height: 150px;
`;

const FieldArea = styled.div`
  display: flex;
  justify-content: center;
  gap: var(--spacing);
  flex-wrap: wrap;
  width: 100%;
  padding: var(--spacing) 0;
  box-sizing: border-box;
  min-height: calc(220px * var(--scale-factor));
`;

const HandArea = styled.div`
  position: fixed;
  bottom: calc(-20px * var(--scale-factor));
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  gap: calc(5px * var(--scale-factor));
  padding: calc(10px * var(--scale-factor)) 0;
  perspective: 1000px;
  min-height: var(--card-height);
`;

const PlayerInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 10px 20px;
  background-color: rgba(0, 0, 0, 0.7);
`;

const DeckAndManaContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const DeckContainer = styled.div`
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
`;

const ManaInfo = styled.div`
  font-size: 18px;
  color: #4fc3f7;
  text-shadow: 0 0 5px #4fc3f7;
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

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 10px #ffd700;
  }
`;

const DraggableCardWrapper = styled.div`
  z-index: 1000;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-10px);
  }
`;

const CardComponent = styled.div`
  width: ${(props) => (props.$isInHand ? 'var(--card-width)' : 'var(--field-card-width)')};
  height: ${(props) => (props.$isInHand ? 'var(--card-height)' : 'var(--field-card-height)')};
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
    opacity: 1.0;
    z-index: 1001;
  `}

  ${props => props.$isFrozen && frozenStyle}

  ${(props) => props.$canAttack && !props.$isInHand && css`
    box-shadow: 0 0 10px 3px #00ff00;
    cursor: pointer;
    &:hover {
      transform: scale(1.05);
      box-shadow: 0 0 15px 5px #00ff00;
    }
  `}

  ${(props) => props.$isTargetable && css`
    box-shadow: 0 0 10px 3px #ff0000;
    &:hover {
      box-shadow: 0 0 15px 5px #ff0000;
    }
  `}

  ${(props) => props.$isValidTarget && css`
    box-shadow: 0 0 10px 3px #ff0000;
    cursor: pointer;
    &:hover {
      transform: scale(1.05);
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

const TauntLabel = styled.div`
  position: absolute;
  top: 5px;
  left: 5px;
  background-color: #ffd700;
  color: #000;
  font-weight: bold;
  padding: 2px 5px;
  border-radius: 5px;
  font-size: 12px;
`;

const CardName = styled.div`
  font-size: calc(14px * var(--scale-factor));
  font-weight: bold;
  text-align: center;
  margin-bottom: 5px;
  color: white;
  position: relative;
  z-index: 2; // Zvýšíme z-index, aby byl nad gemem
  text-shadow: 
    -1px -1px 0 #000,  
     1px -1px 0 #000,
    -1px  1px 0 #000,
     1px  1px 0 #000;
`;


const CardStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  color: white;
    text-shadow: 
    -1px -1px 0 #000,  
     1px -1px 0 #000,
    -1px  1px 0 #000,
     1px  1px 0 #000; // Vytvoříme čern obrys pomocí text-shadow
`;


const CardDescription = styled.div`
  font-size: calc(11px * var(--scale-factor));
  font-family: 'Arial', sans-serif;
  text-align: center;
  margin-top: 2px;
  margin-bottom: 2px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  color: white; // Bílý text
  text-shadow: 
    -1px -1px 0 #000,  
     1px -1px 0 #000,
    -1px  1px 0 #000,
     1px  1px 0 #000; // Vytvoříme erný obrys pomocí text-shadow
`;

const ManaCost = styled.div`
  position: absolute;
  top: -10px;
  left: -10px;
  width: calc(30px * var(--scale-factor));
  height: calc(30px * var(--scale-factor));
  background-color: #4fc3f7;
  color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: calc(16px * var(--scale-factor));
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

const HeroContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isTargetable'].includes(prop),
})`
  width: var(--hero-size);
  height: var(--hero-size);
  position: relative;
  cursor: ${(props) => (props.isTargetable ? 'pointer' : 'default')};

  ${props => props.$isValidTarget && css`
    &::after {
      content: '';
      position: absolute;
      top: -5px;
      left: -5px;
      right: -5px;
      bottom: -5px;
      border-radius: 50%;
      border: 2px dashed #ff0000;
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.7; }
      100% { transform: scale(1); opacity: 1; }
    }
  `}
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

// Vytvoříme mapu obrázků karet
const cardImages = {
  'Earth Golem': earthGolem,
  'Fireball': fireball,
  'Healing Touch': healingTouch,
  'Lightning Bolt': lightningBolt,
  'Arcane Intellect': arcaneIntellect,
  'Fire Elemental': fireElemental,
  'Shield Bearer': shieldBearer,
  'Water Elemental': waterElemental,
  'Nimble Sprite': nimbleSprite,
  'Arcane Familiar': arcaneFamiliar,
  'Glacial Burst': glacialBurst,
  'Radiant Protector': radiantProtector,
  'Inferno Wave': infernoWave,
  "The Coin": coinImage,
};

// Přidejte novou styled komponentu pro drag layer
const DragLayer = styled.div`
  position: fixed;
  pointer-events: none;
  z-index: 2000;
  transform: translate(-50%, -50%);
  width: var(--card-width);
  height: var(--card-height);
`;

// Vytvoříme nový kontejner pro portál
const PortalContainer = styled(GameScaleContainer)`
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  width: 0;
  height: 0;
  overflow: visible;
`;

// Upravte CardDisplay komponentu pro použití portálu při přetahování
const CardDisplay = ({ card, canAttack, isTargetable, isSelected, isInHand, isDragging, isOpponentCard }) => {
  if (!card) return null;

  // Karty v ruce protivníka zobrazujeme jako rub
  if (isOpponentCard && isInHand) {
    return (
      <CardComponent 
        $isInHand={isInHand} 
        $isDragging={isDragging}
      >
        <CardBack />
      </CardComponent>
    );
  }

  const cardContent = (
    <CardComponent
      $type={card.type}
      $canAttack={canAttack}
      $isTargetable={isTargetable}
      $isSelected={isSelected}
      $isInHand={isInHand}
      $isDragging={isDragging}
      $isFrozen={card.frozen}
      $rarity={card.rarity}
    >
      <ManaCost>{card.manaCost}</ManaCost>
      <RarityGem $rarity={card.rarity} />
      <CardImage src={cardImages[card.name] || cardBackImage} alt={card.name} />
      {card.hasTaunt && <TauntLabel>Taunt</TauntLabel>}
      {card.hasDivineShield && <DivineShieldOverlay $isInHand={isInHand} />}
      <CardContent>
        <CardName>{card.name}</CardName>
        <CardDescription>{card.effect}</CardDescription>
        <CardStats>
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
          <span role="img" aria-label="snowflake">❄️</span>
        </FrozenOverlay>
      )}
    </CardComponent>
  );

  // Pokud se karta přetahuje, vykreslíme ji přes portál s aktuální pozicí myši
  if (isDragging) {
    return createPortal(
      <PortalContainer>
        <DragLayer
          style={{
            left: window.dragPosition?.x || 0,
            top: window.dragPosition?.y || 0,
          }}
        >
          {cardContent}
        </DragLayer>
      </PortalContainer>,
      document.body
    );
  }

  return cardContent;
};

// Přidáme novou styled komponentu pro oblast karet protivníka
const OpponentHandArea = styled.div`
  position: absolute;
  top: calc(-166px * var(--scale-factor));
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  gap: calc(5px * var(--scale-factor));
  padding: calc(10px * var(--scale-factor)) 0;
  perspective: 1000px;
  min-height: calc(120px * var(--scale-factor));
  z-index: 100;
`;

const HeroDisplay = ({ hero, isTargetable, isOpponent }) => {  // Přidáme prop isOpponent
  return (
    <HeroContainer isTargetable={isTargetable}>
      <HeroImage 
        src={isOpponent ? aiHeroImage : playerHeroImage}  // Použijeme správný obrázek podle toho, zda jde o protivníka
        alt={isOpponent ? "Enemy Hero" : "Player Hero"}
        isTargetable={isTargetable}
      />
      <HeroHealth>
        <HeartIcon>❤️</HeartIcon>
        {hero.health}
      </HeroHealth>
    </HeroContainer>
  );
};

// Přidáme novou styled komponentu pro modal s koncem hry
const GameOverModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.9);
  padding: 2rem;
  border-radius: 10px;
  border: 2px solid #ffd700;
  color: white;
  text-align: center;
  z-index: 1000;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
`;

const GameOverText = styled.h2`
  color: #ffd700;
  font-size: 2rem;
  margin-bottom: 1rem;
`;

// Přidáme nové styled komponenty pro zvýraznění zón
const DroppableZone = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: ${props => props.$isDraggingOver 
    ? 'rgba(255, 215, 0, 0.2)' 
    : props.$isValidDropZone 
      ? 'rgba(255, 215, 0, 0.1)'
      : 'transparent'};
  border: 2px dashed ${props => props.$isDraggingOver 
    ? '#ffd700' 
    : props.$isValidDropZone 
      ? 'rgba(255, 215, 0, 0.5)'
      : 'transparent'};
`;

function GameScene({ gameState, onPlayCard, onAttack, onEndTurn }) {
  const [selectedCard, setSelectedCard] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [draggedCard, setDraggedCard] = useState(null);

  // Přidáme funkci pro kontrolu validního cíle útoku
  const isValidAttackTarget = useCallback((targetCard) => {
    if (!draggedCard || draggedCard.type !== 'attack') return false;
    
    // Kontrola, zda má nepřítel kartu s provokací (Taunt)
    const hasTauntMinion = gameState.opponent.field.some(card => card.hasTaunt);
    
    // Pokud má nepřítel kartu s provokací, můžeme útočit pouze na karty s provokací
    if (hasTauntMinion && !targetCard.hasTaunt) {
      return false;
    }
    
    return true;
  }, [draggedCard, gameState?.opponent?.field]);

  // Přidáme onDragStart handler
  const onDragStart = useCallback((start) => {
    const { source } = start;
    if (source.droppableId === 'hand') {
      const card = gameState.player.hand[source.index];
      setDraggedCard({ type: 'playCard', card });
    } else if (source.droppableId === 'field') {
      const card = gameState.player.field[source.index];
      if (!card.hasAttacked && !card.frozen) {
        setDraggedCard({ type: 'attack', card });
      }
    }
  }, [gameState?.player]);

  // Upravíme onDragEnd handler aby resetoval draggedCard
  const onDragEnd = useCallback((result) => {
    const { source, destination } = result;
    
    if (!destination || !gameState) {
      setDraggedCard(null);
      return;
    }

    const sourceArea = source.droppableId;
    const targetArea = destination.droppableId;
    const cardIndex = source.index;

    // Hraní karty z ruky na pole
    if (sourceArea === 'hand' && targetArea === 'field') {
      onPlayCard({ cardIndex });
    }
    // Útok z pole na nepřítele
    else if (sourceArea === 'field' && targetArea === 'opponent-field') {
      onAttack({
        attackerIndex: source.index,
        targetIndex: destination.index
      });
    }
    // Útok na hrdinu
    else if (sourceArea === 'field' && targetArea === 'opponent-hero') {
      onAttack({
        attackerIndex: source.index,
        targetIndex: null,
        isHeroTarget: true
      });
    }
    
    setDraggedCard(null);
  }, [gameState, onPlayCard, onAttack]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      window.dragPosition = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      delete window.dragPosition;
    };
  }, []);

  if (!gameState) {
    return <div>Čekání na připojení protihráče...</div>;
  }

  const isPlayerTurn = gameState.currentPlayer === gameState.playerIndex;

  // Přidáme zobrazení konce hry
  if (gameState.gameOver) {
    const isWinner = gameState.winner === gameState.playerIndex;
    const isDraw = gameState.winner === 'draw';
    return (
      <GameBoard>
        <GameOverModal>
          <GameOverText>
            {isDraw ? 'Remíza!' : isWinner ? 'Vítězství!' : 'Prohra!'}
          </GameOverText>
          <div>
            {isDraw 
              ? 'Oba hrdinové padli ve stejný okamžik!' 
              : isWinner 
                ? 'Gratulujeme k vítězství!' 
                : 'Hodně štěstí příště!'}
          </div>
        </GameOverModal>
      </GameBoard>
    );
  }

  return (
    <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <GameScaleContainer>
        <GameBoard>
          {/* Zobrazení notifikací */}
          {notifications.map(notification => (
            <Notification 
              key={notification.id} 
              message={notification.message} 
            />
          ))}

          {/* Karty v ruce protivníka */}
          <OpponentHandArea>
            {Array.isArray(gameState?.opponent?.hand) && gameState.opponent.hand.map((card, index) => (
              <CardDisplay
                key={card.id || index}
                card={card}
                isOpponentCard={true}
                isInHand={true}
              />
            ))}
          </OpponentHandArea>

          {/* Informace o protihráči */}
          <PlayerInfo>
            <DeckAndManaContainer>
              <DeckContainer>{gameState.opponent.deckSize}</DeckContainer>
              <ManaInfo>{gameState.opponent.mana}/{gameState.opponent.maxMana} 💎</ManaInfo>
            </DeckAndManaContainer>
          </PlayerInfo>

          <BattleArea>
            {/* Protihráčova oblast */}
            <PlayerArea>
              <Droppable droppableId="opponent-hero" isDropDisabled={!draggedCard?.type === 'attack'}>
                {(provided, snapshot) => (
                  <HeroArea ref={provided.innerRef} {...provided.droppableProps}>
                    <HeroDisplay 
                      hero={gameState.opponent.hero}
                      isValidTarget={draggedCard?.type === 'attack'}
                      isOpponent={true}
                    />
                    {provided.placeholder}
                  </HeroArea>
                )}
              </Droppable>

              <Droppable droppableId="opponent-field" direction="horizontal" isDropDisabled={!draggedCard?.type === 'attack'}>
                {(provided, snapshot) => (
                  <DroppableZone
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    $isDraggingOver={snapshot.isDraggingOver}
                    $isValidDropZone={draggedCard?.type === 'attack'}
                  >
                    <FieldArea>
                      {gameState.opponent.field.map((card, index) => (
                        <CardDisplay
                          key={card.id}
                          card={card}
                          isValidTarget={draggedCard?.type === 'attack' && isValidAttackTarget(card)}
                        />
                      ))}
                    </FieldArea>
                    {provided.placeholder}
                  </DroppableZone>
                )}
              </Droppable>
            </PlayerArea>

            {/* Hráčova oblast */}
            <PlayerArea>
              <Droppable droppableId="field" direction="horizontal">
                {(provided, snapshot) => (
                  <DroppableZone
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    $isDraggingOver={snapshot.isDraggingOver}
                    $isValidDropZone={draggedCard?.type === 'playCard'}
                  >
                    <FieldArea>
                      {gameState.player.field.map((card, index) => (
                        <Draggable
                          key={card.id}
                          draggableId={card.id}
                          index={index}
                          isDragDisabled={!isPlayerTurn || card.hasAttacked || card.frozen}
                        >
                          {(provided, snapshot) => (
                            <DraggableCardWrapper
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <CardDisplay
                                card={card}
                                canAttack={isPlayerTurn && !card.hasAttacked && !card.frozen}
                                isDragging={snapshot.isDragging}
                              />
                            </DraggableCardWrapper>
                          )}
                        </Draggable>
                      ))}
                    </FieldArea>
                    {provided.placeholder}
                  </DroppableZone>
                )}
              </Droppable>

              <HeroArea>
                <HeroDisplay 
                  hero={gameState.player.hero}
                  isOpponent={false}  // Přidáme prop pro hráče
                />
              </HeroArea>
            </PlayerArea>
          </BattleArea>

          {/* Informace o hráči a ruka */}
          <PlayerInfo>
            <DeckAndManaContainer>
              <DeckContainer>{gameState.player.deck}</DeckContainer>
              <ManaInfo>{gameState.player.mana}/{gameState.player.maxMana} 💎</ManaInfo>
            </DeckAndManaContainer>
            
            {isPlayerTurn && (
              <EndTurnButton onClick={onEndTurn}>
                Ukončit tah
              </EndTurnButton>
            )}
          </PlayerInfo>

          <Droppable droppableId="hand" direction="horizontal">
            {(provided) => (
              <HandArea ref={provided.innerRef} {...provided.droppableProps}>
                {gameState.player.hand.map((card, index) => (
                  <Draggable
                    key={card.id}
                    draggableId={card.id}
                    index={index}
                    isDragDisabled={!isPlayerTurn || card.manaCost > gameState.player.mana}
                  >
                    {(provided, snapshot) => (
                      <DraggableCardWrapper
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          ...provided.draggableProps.style,
                          zIndex: snapshot.isDragging ? 2000 : 'auto'
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
        </GameBoard>
      </GameScaleContainer>
    </DragDropContext>
  );
}

export default GameScene;
