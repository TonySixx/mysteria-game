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

const GameBoard = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  background: url('/background.png') no-repeat center center fixed;
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
  gap: 10px;
  flex-wrap: wrap;
  width: 100%;
  padding: 10px 0;
  box-sizing: border-box;
  min-height: 220px; // Zvětšeno pro lepší prostor pro přetahování
`;

const HandArea = styled.div`
  position: fixed;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  gap: 5px;
  padding: 10px 0;
  perspective: 1000px;
  min-height: 220px; // Přidáno pro zajištění prostoru pro karty
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
  width: ${(props) => (props.$isInHand ? '120px' : '140px')};
  height: ${(props) => (props.$isInHand ? '180px' : '200px')};
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
  font-weight: bold;
  text-align: center;
  font-size: 14px;
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
  font-family: 'Arial', sans-serif;
  font-size: 11px;
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
  width: 30px;
  height: 30px;
  background-color: #4fc3f7;
  color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
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

function HeroDisplay({ hero, onClick, isTargetable }) {
    // Přidáme kontrolu existence hero
    if (!hero) return null;

    return (
        <HeroComponent onClick={isTargetable ? onClick : null} isTargetable={isTargetable}>
            <HeroImage 
                src={hero.name === 'Player 1' ? playerHeroImage : aiHeroImage} 
                alt={hero.name} 
                isTargetable={isTargetable} 
            />
            <HeroHealth>
                <HeartIcon>❤️</HeartIcon>
                {hero.health}
            </HeroHealth>
        </HeroComponent>
    );
}

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

const CardDisplay = ({ card, canAttack, isTargetable, isSelected, isInHand, isDragging, isOpponentCard }) => {
  if (!card) return null;

  if (isOpponentCard) {
    return (
      <CardComponent $isInHand={isInHand} $isDragging={isDragging}>
        <CardBack />
      </CardComponent>
    );
  }

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
    >
      <ManaCost>{card.manaCost}</ManaCost>
      <RarityGem $rarity={card.rarity} />
      <CardImage style={{ borderRadius: '4px', border: '1px solid #000000' }} src={card.image} alt={card.name} />
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
}

// Přidat definici OpponentHandArea
const OpponentHandArea = styled(HandArea)`
    top: 10px;
    bottom: auto;
    transform: translateX(-50%) rotate(180deg);
`;

function GameScene({ gameState, onPlayCard, onAttack, onEndTurn }) {
    const [selectedAttackerIndex, setSelectedAttackerIndex] = useState(null);
    const [visualFeedbacks, setVisualFeedbacks] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState('connected');
    const notificationIdRef = useRef(0);
    const [logEntries, setLogEntries] = useState([]);

    // Přidáme nový styled komponent pro status připojení
    const ConnectionStatus = styled.div`
        position: fixed;
        top: 10px;
        right: 10px;
        padding: 5px 10px;
        border-radius: 5px;
        background-color: ${props => props.$status === 'connected' ? '#4CAF50' : '#f44336'};
        color: white;
        font-size: 14px;
        z-index: 1000;
    `;

    useEffect(() => {
        const handleContextMenu = (e) => {
            e.preventDefault();
        };
        document.addEventListener('contextmenu', handleContextMenu);
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);

    const addNotification = useCallback((message, type = 'info') => {
        const id = notificationIdRef.current++;
        setNotifications(prev => [...prev, { id, message, type }]);
        var timer = setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
            clearTimeout(timer);
        }, 5000);
    }, []);

    // Upravíme handlery pro práci s props místo lokálního stavu
    const playCard = (cardIndex) => {
        const currentPlayer = gameState.playerIndex;
        const player = gameState.players[currentPlayer];
        const card = player.hand[cardIndex];

        if (!card || player.mana < card.manaCost) {
            addNotification(`Nedostatek many pro zahrání karty ${card?.name}`, 'warning');
            return;
        }

        onPlayCard({ cardIndex });
    };

    const handleAttack = (attackerIndex, targetIndex, isHeroTarget) => {
        onAttack({ attackerIndex, targetIndex, isHeroTarget });
    };

    // Přidáme kontrolu, zda je hráč na tahu
    const isPlayerTurn = gameState?.currentPlayer === gameState?.playerIndex;

    const onDragEnd = (result) => {
        const { source, destination } = result;

        if (!destination || !isPlayerTurn) {
            return;
        }

        if (source.droppableId === 'hand' && destination.droppableId === 'playerField') {
            // Hraní karty z ruky na pole
            const cardIndex = source.index;
            const card = gameState.player.hand[cardIndex];

            if (!card || gameState.player.mana < card.manaCost) {
                addNotification(`Nedostatek many pro zahrání karty ${card?.name}`, 'warning');
                return;
            }

            onPlayCard({ cardIndex });
        } else if (source.droppableId === 'playerField') {
            const attackerIndex = source.index;
            const attacker = gameState.player.field[attackerIndex];

            if (attacker.hasAttacked || attacker.frozen) {
                addNotification('Tato jednotka nemůže útočit', 'warning');
                return;
            }

            const opponentTauntUnits = gameState.opponent.field.filter(unit => unit.hasTaunt);

            if (destination.droppableId === 'opponentHero') {
                if (opponentTauntUnits.length === 0) {
                    onAttack({ attackerIndex, isHeroTarget: true });
                } else {
                    addNotification('Nelze útočit na hrdinu, když je na poli jednotka s Taunt', 'warning');
                }
            } else if (destination.droppableId.startsWith('opponentCard-')) {
                const targetIndex = parseInt(destination.droppableId.split('-')[1]);
                const targetUnit = gameState.opponent.field[targetIndex];

                if (opponentTauntUnits.length === 0 || targetUnit.hasTaunt) {
                    onAttack({ attackerIndex, targetIndex, isHeroTarget: false });
                } else {
                    addNotification('Nelze útočit na tuto jednotku, když je na poli jednotka s Taunt', 'warning');
                }
            }
        }
    };

    if (gameState?.gameOver) {
        return (
            <GameBoard>
                <h1>Hra skončila!</h1>
                <h2>Vítěz: {gameState.winner}</h2>
            </GameBoard>
        );
    }

    // Získáme data o hráčích z gameState
    const player = gameState?.player;
    const opponent = gameState?.opponent;

    // Přesuneme renderClone dovnitř komponenty, aby měl přístup k gameState
    const renderClone = (provided, snapshot, rubric) => {
        const card = gameState?.player?.hand[rubric.source.index];
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
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <GameBoard>
                <ConnectionStatus $status={connectionStatus}>
                    {connectionStatus === 'connected' ? 'Připojeno' : 'Odpojeno'}
                </ConnectionStatus>

                <PlayerInfo>
                    <DeckAndManaContainer>
                        <DeckContainer>{gameState?.opponent?.deckSize || 0}</DeckContainer>
                        <ManaInfo>🔮 {gameState?.opponent?.mana || 0}/{gameState?.opponent?.maxMana || 0}</ManaInfo>
                    </DeckAndManaContainer>
                </PlayerInfo>

                <OpponentHandArea>
                    {Array(gameState?.opponent?.handSize || 0).fill(null).map((_, index) => (
                        <CardDisplay
                            key={`opponent-card-${index}`}
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
                                    hero={gameState?.opponent?.hero}
                                    isTargetable={isPlayerTurn && 
                                        gameState?.player?.field.some(card => !card.hasAttacked && !card.frozen) && 
                                        gameState?.opponent?.field.every(card => !card.hasTaunt)}
                                />
                                {provided.placeholder}
                            </HeroArea>
                        )}
                    </Droppable>

                    <FieldArea>
                        {gameState?.opponent?.field.map((card, index) => (
                            <Droppable droppableId={`opponentCard-${index}`} key={card.id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        style={{
                                            background: snapshot.isDraggingOver ? 'rgba(255, 0, 0, 0.5)' : 'transparent',
                                        }}
                                    >
                                        <CardDisplay
                                            card={card}
                                            isTargetable={isPlayerTurn && 
                                                gameState?.player?.field.some(card => !card.hasAttacked && !card.frozen) && 
                                                (gameState?.opponent?.field.every(unit => !unit.hasTaunt) || card.hasTaunt)}
                                        />
                                        {provided.placeholder}
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
                                }}
                            >
                                {gameState?.player?.field.map((card, index) => (
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
                                                />
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </FieldArea>
                        )}
                    </Droppable>

                    <HeroArea>
                        <HeroDisplay hero={gameState?.player?.hero} />
                    </HeroArea>
                </BattleArea>

                <PlayerInfo>
                    <DeckAndManaContainer>
                        <DeckContainer>{gameState?.player?.deck || 0}</DeckContainer>
                        <ManaInfo>🔮 {gameState?.player?.mana || 0}/{gameState?.player?.maxMana || 0}</ManaInfo>
                    </DeckAndManaContainer>
                    <EndTurnButton 
                        onClick={onEndTurn}
                        disabled={!isPlayerTurn}
                        style={{ opacity: isPlayerTurn ? 1 : 0.5 }}
                    >
                        Ukončit tah
                    </EndTurnButton>
                </PlayerInfo>

                <Droppable droppableId="hand" direction="horizontal" renderClone={renderClone}>
                    {(provided) => (
                        <HandArea
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            {gameState?.player?.hand.map((card, index) => (
                                <Draggable 
                                    key={card.id} 
                                    draggableId={card.id} 
                                    index={index}
                                    isDragDisabled={!isPlayerTurn}
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

                <VisualFeedbackContainer feedbacks={visualFeedbacks} />
                <Notification notifications={notifications} />
                <CombatLog logEntries={logEntries} />
            </GameBoard>
        </DragDropContext>
    );
}

export default GameScene;
