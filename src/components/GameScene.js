import React, { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react';
import styled from 'styled-components';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Notification } from './Notification';
import { CombatLog } from './CombatLog';
import { theme } from '../styles/theme';
import socketService from '../services/socketService';
import { heroAbilities } from './profile/HeroSelector';
import { useSound } from 'use-sound';
import cardSound from '../assets/sounds/card.mp3';
import spellSound from '../assets/sounds/spell.mp3';
import attackSound from '../assets/sounds/attack.mp3';
import turnSound from '../assets/sounds/turn.mp3';
import backgroundImage from "../assets/images/background.png";
import HeroSpeechBubble from './HeroSpeechBubble';
import { useIsMobile } from './inGameComponents/useIsMobile';
import CardDisplay from './inGameComponents/CardDisplay';
import HeroDisplay from './inGameComponents/HeroDisplay';
import { Tooltip } from './inGameComponents/Tooltip';
import { AbilityAnimation, AnimatedCard, AnimationCards, AnimationContent, AnimationOverlay, AnimationText, AnimationVS, CompactAnimationContainer, CompactAnimationContent, CompactAnimationText, CompactCardContainer, HeroAbilityIcon, SkipText } from './inGameComponents/Animation';
import { HeroFrame } from './inGameComponents/HeroComponent';


const BASE_WIDTH = 1920; // Základní šířka pro full HD
const BASE_HEIGHT = 1080; // Základní výška pro full HD
const MIN_SCALE = 0.5; // Minimální scale faktor
const MAX_SCALE = 1.2; // Maximální scale faktor

// Přidejte tyto konstanty pod existující BASE konstanty
const MOBILE_BASE_WIDTH = 1280; // Základní šířka pro mobilní zobrazení
const MOBILE_BASE_HEIGHT = 720; // Základní výška pro mobilní zobrazení
const MOBILE_CARD_SCALE = 0.8; // Zmenšení karet pro mobilní zobrazení



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
  background: url(${backgroundImage}) no-repeat center center;
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
  position: relative;
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

const DeckContainer = memo(styled.div`
    position: relative;
    width: 40px;
    height: 60px;
    background: linear-gradient(135deg, 
        rgba(20, 10, 6, 0.98) 0%,
        rgba(28, 15, 8, 0.98) 100%
    );
    border: 2px solid transparent;
    border-image: ${theme.colors.border.golden};
    border-image-slice: 1;
    border-radius: 6px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: ${theme.colors.text.primary};
    font-family: 'Cinzel', serif;
    font-size: 14px;
    font-weight: bold;
    cursor: help;
    box-shadow: 
        0 2px 4px rgba(0, 0, 0, 0.3),
        inset 0 0 10px rgba(0, 0, 0, 0.5);
    transition: all 0.3s ease;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('./background-pattern.jpg') repeat;
        opacity: 0.02;
        pointer-events: none;
        border-radius: 4px;
    }

    &:hover {
        transform: translateY(-2px);
        box-shadow: 
            0 4px 8px rgba(0, 0, 0, 0.4),
            inset 0 0 10px rgba(0, 0, 0, 0.5),
            0 0 10px rgba(255, 215, 0, 0.2);

        ${Tooltip} {
            opacity: 1;
        }
    }
`);

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

const EndTurnButton = memo(styled.button`
    font-family: 'Cinzel', serif;
    padding: 8px 24px;
    background: linear-gradient(45deg, 
        rgba(44, 24, 16, 0.95) 0%,
        rgba(56, 34, 25, 0.95) 100%
    );
    border: 2px solid transparent;
    border-image: ${theme.colors.border.golden};
    border-image-slice: 1;
    color: ${theme.colors.text.primary};
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s;
    margin-right: 36px;
    text-transform: uppercase;
    letter-spacing: 2px;
    font-size: 1.1em;
    position: relative;
    overflow: hidden;
    border-radius: 6px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    
    opacity: ${props => props.disabled ? 0.5 : 1};
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    
    &:hover {
        transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
        box-shadow: ${props => props.disabled ?
    'none' :
    `0 0 15px rgba(255, 215, 0, 0.3),
             0 0 30px rgba(255, 215, 0, 0.2)`
  };
    }

    &:active {
        transform: ${props => props.disabled ? 'none' : 'translateY(1px)'};
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 215, 0, 0.1) 50%,
            transparent 100%
        );
        transition: 0.5s;
    }

    &:hover::before {
        left: 100%;
    }

    &::after {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        border-radius: 6px;
        background: linear-gradient(45deg, 
            rgba(255, 215, 0, 0.1),
            rgba(255, 215, 0, 0.05)
        );
        z-index: -1;
        opacity: 0;
        transition: 0.3s;
    }

    &:hover::after {
        opacity: 1;
    }
`);

const DraggableCardWrapper = styled.div`
  z-index: 1000;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-10px);
  }
`;




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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;

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



// Přidáme nové styled komponenty pro drop zóny
const DropZoneOverlay = memo(styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 8px;
  pointer-events: none;
  transition: all 0.3s ease;
  z-index: 5;
  
  ${props => props.$type === 'attack' && `
    background: linear-gradient(135deg, rgba(255, 0, 0, 0.1) 0%, rgba(255, 0, 0, 0.2) 100%);
    border: 2px solid rgba(255, 0, 0, 0.3);
    box-shadow: 
      inset 0 0 20px rgba(255, 0, 0, 0.2),
      0 0 15px rgba(255, 0, 0, 0.3);
    
    &::after {
      content: '⚔️';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 24px;
      opacity: 0.7;
    }
  `}
  
  ${props => props.$type === 'play' && `
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.2) 100%);
    border: 2px solid rgba(255, 215, 0, 0.3);
    box-shadow: 
      inset 0 0 20px rgba(255, 215, 0, 0.2),
      0 0 15px rgba(255, 215, 0, 0.3);
    
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 24px;
      opacity: 0.7;
    }
  `}
  
  ${props => props.$type === 'hero' && `
    background: linear-gradient(135deg, rgba(255, 0, 0, 0.1) 0%, rgba(255, 0, 0, 0.2) 100%);
    border: 2px solid rgba(255, 0, 0, 0.3);
    border-radius: 50%;
    box-shadow: 
      inset 0 0 20px rgba(255, 0, 0, 0.2),
      0 0 15px rgba(255, 0, 0, 0.3);
    
    &::after {
      content: '⚔️';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 24px;
      opacity: 0.7;
    }
  `}
`);

// Přidáme nov styled komponenty pro indikátor tahu
const TurnIndicator = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 10px 20px;
  background: linear-gradient(135deg, 
    ${props => props.$isPlayerTurn ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)'} 0%, 
    ${props => props.$isPlayerTurn ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 0, 0, 0.2)'} 100%
  );
  border: 2px solid ${props => props.$isPlayerTurn ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)'};
  border-radius: 8px;
  color: ${theme.colors.text.primary};
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 
    inset 0 0 20px ${props => props.$isPlayerTurn ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)'},
    0 0 15px ${props => props.$isPlayerTurn ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 0, 0, 0.2)'};
  z-index: 100;
  text-shadow: ${theme.shadows.golden};
  animation: pulse 2s infinite;

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }

  &::before {
    content: '👑';
    margin-right: 8px;
  }
`;


// Přidáme nové styled komponenty
const TestControls = styled.div`
    position: fixed;
    top: 10px;
    left: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 1000;
`;

const TestButton = styled.button`
    padding: 5px 10px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    border: 1px solid #ffd700;
    cursor: pointer;
    
    &:hover {
        background: rgba(0, 0, 0, 0.9);
    }
`;

const ReconnectOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ReconnectMessage = styled.div`
    color: white;
    font-size: 24px;
    text-align: center;
`;

const DefeatDetails = styled.div`
  font-size: 1.2em;
  color: #ff9999;
  margin: 10px 0;
  padding: 15px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  border: 1px solid #ff4444;
  max-width: 400px;

  .defeat-card {
    display: inline-block;
    color: #ffd700;
    font-weight: bold;
    text-shadow: 0 0 5px #ffd700;
  }

  .damage {
    color: #ff4444;
    font-weight: bold;
  }
`;

function GameScene({ gameState, onPlayCard, onAttack, onEndTurn, onUseHeroAbility, isAIGame }) {
  const [notification, setNotification] = useState(null);
  const [logEntries, setLogEntries] = useState([]);
  const [scale, setScale] = useState(1);
  const isMobile = useIsMobile();
  const [animation, setAnimation] = useState(null);
  const [isClosingAnimation, setIsClosingAnimation] = useState(false);
  // V komponentě GameScene přidáme nové stavy
  const [isDisconnected, setIsDisconnected] = useState(false);
  const [reconnectTimer, setReconnectTimer] = useState(null);
  const [showTestControls] = useState(process.env.NODE_ENV === 'development');
  const [showPlayerBubble, setShowPlayerBubble] = useState(false);
  const [showOpponentBubble, setShowOpponentBubble] = useState(false);

  // Přidáme refs pro sledování pozic karet
  const opponentFieldRefs = useRef([]);
  const opponentHandRef = useRef(null);
  const [playCardSound] = useSound(cardSound, { volume: 0.8 });
  const [playSpellSound] = useSound(spellSound, { volume: 0.8 });
  const [playAttackSound] = useSound(attackSound, { volume: 0.8 });
  const [playTurnSound] = useSound(turnSound, { volume: 0.8 });

  // Přidáme useEffect pro sledování nových zpráv z combat logu
  useEffect(() => {
    if (gameState?.combatLogMessages && gameState.combatLogMessages.length > 0) {
      // Přidáme všechny nové zprávy s unikátními ID
      const newEntries = gameState.combatLogMessages.map(message => ({
        ...message,
        id: Math.random().toString(36).substr(2, 9) // Přidáme unikátní ID pro React key
      }));
      setLogEntries(prev => [...prev, ...newEntries]);
    }
  }, [gameState?.combatLogMessages]);

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

  // Upravíme useEffect pro zpracování animací a zvuků
  useEffect(() => {
    if (gameState?.animation) {
      // Přehrajeme zvuk podle typu animace bez ohledu na to, kdo ji vyvolal
      switch (gameState.animation.type) {
        case 'playCard':
          if (gameState.animation.card.type === 'spell') {
            playSpellSound();
          } else {
            playCardSound();
          }
          break;
        case 'attack':
          playAttackSound();
          break;
        case 'heroAbility':
          playSpellSound();
          break;
        default:
          break;
      }

      // Pokud je animace od protihráče, zobrazíme ji
      if (gameState.playerIndex !== gameState.animation.playerIndex) {
        setIsClosingAnimation(false);
        setAnimation(gameState.animation);

        // Spustíme fadeout 0.5s před koncem animace
        const fadeOutTimer = setTimeout(() => {
          setIsClosingAnimation(true);
        }, 2500);

        // Odstraníme animaci až po dokončení fadeout
        const removeTimer = setTimeout(() => {
          setAnimation(null);
          setIsClosingAnimation(false);
        }, 3000);

        return () => {
          clearTimeout(fadeOutTimer);
          clearTimeout(removeTimer);
        };
      }
    }
  }, [gameState?.animation, gameState?.playerIndex, playCardSound, playSpellSound, playAttackSound]);

  // Přidáme useEffect pro sledování změny tahu
  useEffect(() => {
    const isNewTurn = gameState?.currentPlayer === gameState?.playerIndex;

    if (isNewTurn) {
      playTurnSound();
    }
  }, [gameState?.currentPlayer, gameState?.playerIndex, playTurnSound]);

  useEffect(() => {
    if (gameState) {
      // Spustíme animaci pro začínajícího hráče
      if (gameState.currentPlayer === gameState.playerIndex) {
        setShowPlayerBubble(true);
      } else {
        setShowOpponentBubble(true);
      }
    }
  }, [gameState, gameState.playerIndex]);

  // Upravíme handleEndTurn pro přehrání zvuku při použití hero ability
  const handleHeroAbility = useCallback(() => {
    onUseHeroAbility();
  }, [onUseHeroAbility]);

  // Upravíme handleSkipAnimation pro plynulé ukončení
  const handleSkipAnimation = useCallback(() => {
    setIsClosingAnimation(true);
    setTimeout(() => {
      setAnimation(null);
      setIsClosingAnimation(false);
    }, 500);
  }, []);

  // Upravíme AnimationEffect
  const AnimationEffect = useCallback(() => {
    if (!animation) return null;

    // Pokud je hráč na tahu, zobrazíme kompaktní verzi
    const isActivePlayer = gameState.currentPlayer === gameState.playerIndex;

    if (isActivePlayer) {
      return (
        <CompactAnimationContainer $isClosing={isClosingAnimation}>
          <CompactAnimationContent>
            <CompactAnimationText>
              {animation.type === 'playCard'
                ? `Played ${animation.card.name}`
                : animation.type === 'heroAbility'
                  ? `Used ${animation.hero.abilityName}`
                  : `Attacked ${animation.isHeroTarget
                    ? animation.target.name
                    : animation.target.name}`}
            </CompactAnimationText>
            <CompactCardContainer>
              {animation.type === 'playCard' && (
                <div>
                  <CardDisplay
                    card={animation.card}
                    isInHand={false}
                    isDragging={false}
                    gameState={gameState}
                  />
                </div>
              )}
              {animation.type === 'heroAbility' && (
                <div>
                  <AbilityAnimation>
                    <HeroAbilityIcon
                      src={heroAbilities[animation.hero.image]}
                      alt={animation.hero.abilityName}
                      $isHealing={animation.isHealing}
                    />
                  </AbilityAnimation>
                </div>
              )}
              {animation.type === 'attack' && (
                <>
                  <div>
                    <CardDisplay
                      card={animation.card}
                      isInHand={false}
                      isDragging={false}
                      gameState={gameState}
                    />
                  </div>
                  <AnimationVS $isMobile={true}>⚔️</AnimationVS>
                  <div>
                    {animation.isHeroTarget ? (
                      <HeroFrame $isMobile={true}>
                        {animation.target.name}
                      </HeroFrame>
                    ) : (
                      <CardDisplay
                        card={animation.target}
                        isInHand={false}
                        isDragging={false}
                        gameState={gameState}
                      />
                    )}
                  </div>
                </>
              )}
            </CompactCardContainer>
          </CompactAnimationContent>
        </CompactAnimationContainer>
      );
    }

    // Pro protihráče ponecháme původní velkou animaci
    return (
      <AnimationOverlay
        onClick={handleSkipAnimation}
        $isClosing={isClosingAnimation}
      >
        <AnimationContent $isClosing={isClosingAnimation}>
          <AnimationText $isMobile={isMobile}>
            {animation.type === 'heroAbility'
              ? `${animation.player} used ${animation.hero.abilityName}`
              : animation.type === 'playCard'
                ? `${animation.player} played ${animation.card.name}`
                : `${animation.player} attacked with ${animation.card.name} 
                           ${animation.isHeroTarget
                  ? animation.target.name
                  : animation.target.name}`}
          </AnimationText>
          <AnimationCards>
            {animation.type === 'heroAbility' ? (
              <AbilityAnimation>
                <HeroAbilityIcon
                  src={heroAbilities[animation.hero.image]}
                  alt={animation.hero.abilityName}
                  $isHealing={animation.isHealing}
                />
              </AbilityAnimation>
            ) : (
              <AnimatedCard $animation={animation.type === 'playCard' ? 'flyInLeft' : 'attackAnimation'}>
                <CardDisplay
                  card={animation.card}
                  isInHand={false}
                  isDragging={false}
                  gameState={gameState}
                />
              </AnimatedCard>
            )}
            {animation.type === 'attack' && (
              <>
                <AnimationVS $isMobile={isMobile}>VS</AnimationVS>
                <AnimatedCard $animation="defendAnimation">
                  {animation.isHeroTarget ? (
                    <HeroFrame $isMobile={isMobile}>
                      {animation.target.name}
                    </HeroFrame>
                  ) : (
                    <CardDisplay
                      card={animation.target}
                      isInHand={false}
                      isDragging={false}
                      gameState={gameState}
                    />
                  )}
                </AnimatedCard>
              </>
            )}
          </AnimationCards>
        </AnimationContent>
        <SkipText>Click anywhere to skip</SkipText>
      </AnimationOverlay>
    );
  }, [animation, isMobile, gameState, isClosingAnimation, handleSkipAnimation]);

  // Upravíme renderování karet protivníka pro přidání refs
  const renderOpponentField = useCallback(() => (
    <FieldArea $isMobile={isMobile}>
      {gameState.opponent.field.map((card, index) => (
        <Droppable droppableId={`opponentCard-${index}`} key={card.id}>
          {(provided, snapshot) => (
            <div
              ref={(el) => {
                provided.innerRef(el);
                opponentFieldRefs.current[index] = el;
              }}
              {...provided.droppableProps}
              style={{ position: 'relative' }}
            >
              <CardDisplay
                card={card}
                isTargetable={gameState.player.field.some(card => !card.hasAttacked && !card.frozen) &&
                  (gameState.opponent.field.every(unit => !unit.hasTaunt) || card.hasTaunt)}
              />
              {snapshot.isDraggingOver && (
                <DropZoneOverlay $type="attack" />
              )}
            </div>
          )}
        </Droppable>
      ))}
    </FieldArea>
  ), [gameState.opponent.field, gameState.player.field, isMobile]);



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
          gameState={gameState}
        />
      </div>
    );
  }, [gameState]);


  // Přidáme wrapper pro onEndTurn
  const handleEndTurn = useCallback(() => {
    // Pokud probíhá animace, zrušíme ji
    if (animation) {
      setIsClosingAnimation(true);
      setTimeout(() => {
        setAnimation(null);
        setIsClosingAnimation(false);
      }, 500);
    }
    onEndTurn();
  }, [animation, onEndTurn]);



  // Přidáme useEffect pro sledování stavu připojení
  useEffect(() => {
    const socket = socketService.socket;

    const handleDisconnect = () => {
      setIsDisconnected(true);
      // Pokusíme se o reconnect
      setTimeout(() => {
        socket.connect();
        socket.emit('attemptReconnect');
      }, 1000);
    };

    const handleReconnect = () => {
      setIsDisconnected(false);
      setReconnectTimer(null);
    };

    const handleOpponentDisconnect = (data) => {
      setReconnectTimer(data.remainingTime);
    };

    const handleOpponentReconnect = () => {
      setReconnectTimer(null);
    };

    socket.on('disconnect', handleDisconnect);
    socket.on('reconnectedToGame', handleReconnect);
    socket.on('opponentDisconnected', handleOpponentDisconnect);
    socket.on('opponentReconnected', handleOpponentReconnect);

    return () => {
      socket.off('disconnect', handleDisconnect);
      socket.off('reconnectedToGame', handleReconnect);
      socket.off('opponentDisconnected', handleOpponentDisconnect);
      socket.off('opponentReconnected', handleOpponentReconnect);
    };
  }, []);

  // Přidáme testovací funkce
  const simulateDisconnect = () => {
    socketService.socket.disconnect();
  };

  const simulateReconnect = () => {
    socketService.socket.connect();
    socketService.socket.emit('attemptReconnect');
  };

  const OpponentHandArea = styled(HandArea)`
    top: 10px;
    bottom: auto;
    transform: translateX(-50%) rotate(180deg);
  `;



  // Přidáme efekt pro zobrazení "AI přemýšlí" notifikace
  // useEffect(() => {
  //   if (isAIGame && gameState.currentPlayer === 1) {
  //     setNotification({
  //       message: "AI is thinking...",
  //       type: "info",
  //       duration: 1500  // Notifikace zmizí po 1.5s
  //     });
  //   }
  // }, [isAIGame, gameState.currentPlayer]);



  // // Přidáme bezpečnostní kontroly pro gameState
  // const safeGameState = useMemo(() => {
  //   if (!gameState) return null;

  //   return {
  //     ...gameState,
  //     player: gameState.player || {},
  //     opponent: gameState.opponent || {},
  //     currentPlayer: gameState.currentPlayer ?? -1,
  //     playerIndex: gameState.playerIndex ?? -1
  //   };
  // }, [gameState]);

  //   // Bezpečné získání jména protihráče
  //   const opponentName = useMemo(() => {
  //     if (isAIGame) return "AI Opponent";
  //     return safeGameState.opponent?.username || "Opponent";
  //   }, [isAIGame, safeGameState.opponent]);
  
  //   // Bezpečné získání stavu tahu
  //   const isPlayerTurn = useMemo(() => {
  //     return safeGameState.currentPlayer === safeGameState.playerIndex;
  //   }, [safeGameState.currentPlayer, safeGameState.playerIndex])

  const isPlayerTurn = gameState?.currentPlayer === gameState?.playerIndex;


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
    const lastAnimation = animation; // Použijeme poslední animaci

    return (
      <GameBoard>
        <GameOverOverlay>
          <GameOverContent>
            <GameOverTitle>Game Over</GameOverTitle>
            <GameOverMessage $isWinner={isWinner}>
              {isWinner ? 'Victory!' : 'Defeat!'}
            </GameOverMessage>
            {!isWinner && lastAnimation && (
              <DefeatDetails>
                {lastAnimation.type === 'attack' ? (
                  <>
                    Defeated by{' '}
                    <span className="defeat-card">{lastAnimation.card.name}</span>
                    {lastAnimation.card.attack && (
                      <> dealing <span className="damage">{lastAnimation.card.attack} damage</span></>
                    )}
                  </>
                ) : lastAnimation.type === 'heroAbility' ? (
                  <>
                    Defeated by hero ability{' '}
                    <span className="defeat-card">{lastAnimation.hero.abilityName}</span>
                  </>
                ) : lastAnimation.type === 'playCard' && lastAnimation.card.type === 'spell' ? (
                  <>
                    Defeated by spell{' '}
                    <span className="defeat-card">{lastAnimation.card.name}</span>
                  </>
                ) : (
                  'Defeated by opponent'
                )}
              </DefeatDetails>
            )}
            <PlayAgainButton onClick={() => window.location.reload()}>
              Play Again
            </PlayAgainButton>
          </GameOverContent>
        </GameOverOverlay>
        <BattleArea>
        </BattleArea>
      </GameBoard>
    );
  }



  return (
    <>
      {showTestControls && (
        <TestControls>
          <TestButton onClick={simulateDisconnect}>
            Simulate Disconnect
          </TestButton>
          <TestButton onClick={simulateReconnect}>
            Simulate Reconnect
          </TestButton>
        </TestControls>
      )}

      {isDisconnected && (
        <ReconnectOverlay>
          <ReconnectMessage>
            Connection lost. Attempting to reconnect...
          </ReconnectMessage>
        </ReconnectOverlay>
      )}

      {reconnectTimer && (
        <ReconnectOverlay>
          <ReconnectMessage>
            Opponent disconnected. Waiting for reconnect...
            <br />
            Time remaining: {Math.ceil(reconnectTimer)} seconds
          </ReconnectMessage>
        </ReconnectOverlay>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <ScalableGameWrapper $scale={scale} $isMobile={isMobile}>
          <GameBoard>
            <TurnIndicator $isPlayerTurn={isPlayerTurn}>
              {isPlayerTurn ? 'Your Turn' : 'Opponent\'s Turn'}
            </TurnIndicator>

            <PlayerInfo $isMobile={isMobile}>
              <DeckAndManaContainer>
                <DeckContainer>
                  {gameState.opponent?.deckSize || 0}
                  <Tooltip $position="bottom">
                    Cards in deck
                  </Tooltip>
                </DeckContainer>
                <ManaInfo>
                  💎 {gameState.opponent?.mana || 0}/{gameState.opponent?.maxMana || 0}
                  <Tooltip $position="bottom">
                    Mana crystals
                  </Tooltip>
                </ManaInfo>
              </DeckAndManaContainer>
            </PlayerInfo>

            <OpponentHandArea
              $isMobile={isMobile}
              ref={opponentHandRef}
            >
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
                    style={{ position: 'relative' }}
                  >
                    <HeroSpeechBubble
                      heroClass={gameState.opponent.hero.image}
                      isPlayer={false}
                      isVisible={showOpponentBubble}
                      onAnimationComplete={() => {
                        setShowOpponentBubble(false);
                        if (gameState.currentPlayer === gameState.playerIndex) {
                          setShowPlayerBubble(true);
                        }
                      }}
                    />
                    <HeroDisplay
                      hero={gameState.opponent.hero}
                      heroName={gameState.opponent.username}
                      isTargetable={
                        gameState.currentPlayer === gameState.playerIndex &&
                        gameState.player.field.some(card => !card.hasAttacked && !card.frozen) &&
                        gameState.opponent.field.every(card => !card.hasTaunt)
                      }
                    />
                    {snapshot.isDraggingOver && (
                      <DropZoneOverlay $type="hero" />
                    )}
                    {provided.placeholder}
                  </HeroArea>
                )}
              </Droppable>

              {renderOpponentField()}

              <Droppable droppableId="playerField" direction="horizontal">
                {(provided, snapshot) => (
                  <FieldArea
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      gap: '10px',
                      minHeight: '200px'
                    }}
                  >
                    {gameState.player.field.map((card, index) => (
                      <Draggable
                        key={card.id}
                        draggableId={card.id}
                        index={index}
                        isDragDisabled={!isPlayerTurn || card.hasAttacked || card.frozen}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <CardDisplay
                              card={card}
                              canAttack={isPlayerTurn && !card.hasAttacked && !card.frozen}
                              isDragging={snapshot.isDragging}
                              isPlayerTurn={isPlayerTurn}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {snapshot.isDraggingOver && (
                      <DropZoneOverlay $type="play" />
                    )}
                  </FieldArea>
                )}
              </Droppable>

              <div style={{ position: "relative", top: "-50px" }}>
                <HeroArea $isMobile={isMobile}>
                  <div style={{ position: "absolute" }}></div>
                  <HeroSpeechBubble
                    heroClass={gameState.player.hero.image}
                    isPlayer={true}
                    isVisible={showPlayerBubble}
                    onAnimationComplete={() => {
                      setShowPlayerBubble(false);
                      if (gameState.currentPlayer !== gameState.playerIndex) {
                        setShowOpponentBubble(true);
                      }
                    }} />
                  <HeroDisplay hero={gameState.player.hero} heroName={gameState.player.username} isCurrentPlayer={true} onUseAbility={handleHeroAbility} currentMana={gameState.player.mana} />
                </HeroArea>
              </div>
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
                onClick={handleEndTurn}  // Použijeme nový wrapper místo přímého onEndTurn
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
                    <Draggable
                      key={card.id}
                      draggableId={card.id}
                      index={index}
                      isDragDisabled={!isPlayerTurn} // Zakážeme drag když není hráč na tahu
                    >
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
                            spellsPlayedThisGame={gameState?.spellsPlayedThisGame}
                            card={card}
                            isInHand={true}
                            isDragging={snapshot.isDragging}
                            isPlayerTurn={isPlayerTurn}
                            gameState={gameState}
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
            <CombatLog
              logEntries={logEntries}
              socket={socketService.socket}
              playerUsername={gameState.player.username}
              opponentUsername={gameState.opponent.username}
            />
            {/* Přidáme komponentu pro animace */}
            <AnimationEffect />
          </GameBoard>
        </ScalableGameWrapper>
      </DragDropContext>
    </>
  );
}

export default GameScene;
