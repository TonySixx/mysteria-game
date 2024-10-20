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




// Základní třída pro kartu
class Card {
  constructor(id, name, manaCost, type, image = null) {
    this.id = id;
    this.name = name;
    this.manaCost = manaCost;
    this.type = type;
    this.image = image;
  }
}

// Tída pro jednotku
class UnitCard extends Card {
  constructor(id, name, manaCost, attack, health, effect = null, image = null) {
    super(id, name, manaCost, 'unit');
    this.attack = attack;
    this.health = health;
    this.effect = effect;
    this.hasAttacked = false;
    this.hasTaunt = effect === 'Taunt';
    this.image = image;
    this.frozen = false; // Přidáno
  }
}

// Třída pro kouzlo
class SpellCard extends Card {
  constructor(id, name, manaCost, effect, image = null) {
    super(id, name, manaCost, 'spell');
    this.effect = effect;
    this.image = image;
  }
}

// Třída pro hrdinu
class Hero {
  constructor(name, health = 30, specialAbility = null, image) {
    this.name = name;
    this.health = health;
    this.specialAbility = specialAbility;
    this.image = image;
  }
}

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
  border: 2px solid ${(props) => (props.$isSelected ? '#ffd700' : props.$isTargetable ? '#ff9900' : '#000')};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 5px;
  cursor: ${(props) => (props.$canAttack || props.$isTargetable ? 'pointer' : 'default')};
  position: relative;
  transition: all 0.3s;
  transform-style: preserve-3d;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
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
  color: white; // Změníme barvu na bílou
  text-shadow: 
    -1px -1px 0 #000,  
     1px -1px 0 #000,
    -1px  1px 0 #000,
     1px  1px 0 #000; // Vytvoříme černý obrys pomocí text-shadow
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
     1px  1px 0 #000; // Vytvoříme černý obrys pomocí text-shadow
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

function HeroDisplay({ hero, onClick, isTargetable }) {
  return (
    <HeroComponent onClick={isTargetable ? onClick : null} isTargetable={isTargetable}>
      <HeroImage src={hero.name === 'Player' ? playerHeroImage : aiHeroImage} alt={hero.name} isTargetable={isTargetable} />
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

const CardDisplay = ({ card, canAttack, isTargetable, isSelected, isInHand, isDragging }) => {
  if (!card) return null;

  return (
    <CardComponent
      $type={card.type}
      $canAttack={canAttack}
      $isTargetable={isTargetable}
      $isSelected={isSelected}
      $isInHand={isInHand}
      $isDragging={isDragging}
      $isFrozen={card.frozen}
    >
      <ManaCost>{card.manaCost}</ManaCost>
      <CardImage style={{ borderRadius: '4px', border: '1px solid #000000' }} src={card.image} alt={card.name} />
      {card.hasTaunt && <TauntLabel>Taunt</TauntLabel>}
      <CardContent>
        <CardName>{card.name}</CardName>
        <CardStats>
          {card.type === 'unit' && (
            <>
              <span>⚔️ {card.attack}</span>
              <span>❤️ {card.health}</span>
            </>
          )}
        </CardStats>
        <CardDescription>{card.effect}</CardDescription>
      </CardContent>
      {card.frozen && (
        <FrozenOverlay>
          <span role="img" aria-label="snowflake">❄️</span>
        </FrozenOverlay>
      )}
    </CardComponent>
  );
}

const playCardCommon = (state, playerIndex, cardIndex) => {
  const currentPlayerIndex = playerIndex;
  const opponentPlayerIndex = (playerIndex + 1) % 2;

  const currentPlayer = { ...state.players[currentPlayerIndex] };
  const opponentPlayer = { ...state.players[opponentPlayerIndex] };

  const playedCard = currentPlayer.hand[cardIndex];

  if (!playedCard) {
    return state;
  }

  // Speciální případ pro "The Coin"
  if (playedCard.name === 'The Coin') {
    return playCoin(currentPlayerIndex, state);
  }

  if (currentPlayer.mana < playedCard.manaCost) {
    return state;
  }

  currentPlayer.mana -= playedCard.manaCost;
  currentPlayer.hand = currentPlayer.hand.filter((_, index) => index !== cardIndex);

  if (playedCard.type === 'unit') {
    const newUnit = { ...playedCard, hasAttacked: false, frozen: false };
    currentPlayer.field = [...currentPlayer.field, newUnit];
    
    // Aplikujeme efekt karty při zahrání
    if (playedCard.effect === 'Deals 2 damage when played') {
      opponentPlayer.hero.health -= 2;
    }
    if (playedCard.effect === 'Freeze enemy when played') {
      const opponentField = opponentPlayer.field;
      if (opponentField.length > 0) {
        const randomIndex = Math.floor(Math.random() * opponentField.length);
        opponentField[randomIndex] = { 
          ...opponentField[randomIndex], 
          frozen: true,
          frozenTurns: 2  // Zmrazení na 2 kola
        };
        console.log(`Zmrazena nepřátelská karta na pozici ${randomIndex}`);
      } else {
        console.log('Žádná nepřátelská karta k zmrazení');
      }
    }
  } else if (playedCard.type === 'spell') {
    // Aplikujeme efekt kouzla
    if (playedCard.effect === 'Deal 6 damage') {
      opponentPlayer.hero.health -= 6;
    } else if (playedCard.effect === 'Restore 8 health') {
      currentPlayer.hero.health = Math.min(30, currentPlayer.hero.health + 8);
    } else if (playedCard.effect === 'Deal 3 damage') {
      opponentPlayer.hero.health -= 3;
    } else if (playedCard.effect === 'Draw 2 cards') {
      const cardsToDraw = Math.min(2, currentPlayer.deck.length);
      const drawnCards = currentPlayer.deck.slice(0, cardsToDraw);
      currentPlayer.hand = [...currentPlayer.hand, ...drawnCards];
      currentPlayer.deck = currentPlayer.deck.slice(cardsToDraw);
    }
  }

  const updatedPlayers = [...state.players];
  updatedPlayers[currentPlayerIndex] = currentPlayer;
  updatedPlayers[opponentPlayerIndex] = opponentPlayer;

  return {
    ...state,
    players: updatedPlayers,
  };
};

const playCoin = (playerIndex, state) => {
  const updatedPlayers = [...state.players];
  const currentPlayer = {...updatedPlayers[playerIndex]};
  currentPlayer.mana += 1;
  currentPlayer.hand = currentPlayer.hand.filter(card => card.name !== 'The Coin');
  updatedPlayers[playerIndex] = currentPlayer;
  return { ...state, players: updatedPlayers };
};

function GameScene() {
  const [gameState, setGameState] = useState(() => {
    const initialState = {
      players: [
        { hero: new Hero('Player', 30, null, playerHeroImage), deck: [], hand: [], field: [], mana: 0 },
        { hero: new Hero('AI', 30, null, aiHeroImage), deck: [], hand: [], field: [], mana: 0 },
      ],
      currentPlayer: Math.random() < 0.5 ? 0 : 1, // Náhodný začínající hráč
      turn: 1,
      gameOver: false,
      winner: null,
      isAIOpponent: true,
    };

    return initialState;
  });

  const [selectedAttackerIndex, setSelectedAttackerIndex] = useState(null);
  const [visualFeedbacks, setVisualFeedbacks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const notificationIdRef = useRef(0);

  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  useEffect(() => {
    const initializeDeck = () => {
      // Vytvoříme balíček s unikátními ID pro každého hráče
      const baseDeck = [
        { id: 1, name: 'Fire Elemental', manaCost: 4, attack: 5, health: 6, effect: 'Deals 2 damage when played', image: fireElemental },
        { id: 2, name: 'Shield Bearer', manaCost: 2, attack: 1, health: 7, effect: 'Taunt', image: shieldBearer },
        { id: 3, name: 'Fireball', manaCost: 4, effect: 'Deal 6 damage', image: fireball },
        { id: 4, name: 'Healing Touch', manaCost: 3, effect: 'Restore 8 health', image: healingTouch },
        { id: 5, name: 'Water Elemental', manaCost: 3, attack: 3, health: 5, effect: 'Freeze enemy when played', image: waterElemental },
        { id: 6, name: 'Earth Golem', manaCost: 5, attack: 4, health: 8, effect: 'Taunt', image: earthGolem },
        { id: 7, name: 'Lightning Bolt', manaCost: 2, effect: 'Deal 3 damage', image: lightningBolt },
        { id: 8, name: 'Arcane Intellect', manaCost: 3, effect: 'Draw 2 cards', image: arcaneIntellect },
        { id: 9, name: 'Shield Bearer', manaCost: 2, attack: 1, health: 7, effect: 'Taunt', image: shieldBearer },
        { id: 10, name: 'Fire Elemental', manaCost: 4, attack: 5, health: 6, effect: 'Deals 2 damage when played', image: fireElemental },
      ];

      // Duplikujeme balíček pro každého hráče a přiřadíme unikátní ID
      const playerDecks = [0, 1].map((playerIndex) => {
        return baseDeck.map((card) => {
          let newCard;
          const uniqueId = `${playerIndex}-${card.id}`;
          if (card.attack !== undefined) {
            newCard = new UnitCard(uniqueId, card.name, card.manaCost, card.attack, card.health, card.effect, card.image);
          } else {
            newCard = new SpellCard(uniqueId, card.name, card.manaCost, card.effect, card.image);
          }
          return newCard;
        });
      });

      return playerDecks;
    };

    const [player1Deck, player2Deck] = initializeDeck();

    setGameState((prevState) => {
      const startingPlayer = prevState.currentPlayer;
      const updatedState = {
        ...prevState,
        players: prevState.players.map((player, index) => {
          const deck = [...(index === 0 ? player1Deck : player2Deck)].sort(() => Math.random() - 0.5);
          const hand = deck.splice(0, 3); // Oba hráči začínají se 3 kartami
          if (index !== startingPlayer) {
            hand.push(new SpellCard('coin', 'The Coin', 0, 'Gain 1 Mana Crystal.', coinImage));  
          }     
          return {
            ...player,
            deck,
            hand,
            mana: index === startingPlayer ? 1 : 0,
          };
        }),
      };

      // Pokud AI začíná, provedeme jeho tah
      if (startingPlayer === 1) {
        return performAITurn(updatedState);
      }

      return updatedState;
    });
  }, []);

  const startNextTurn = (state, nextPlayer) => {
    const newTurn = state.turn + 1;

    let updatedPlayers = state.players.map((player, index) => {
      let updatedPlayer = { ...player };
      if (index === nextPlayer) {
        updatedPlayer.mana = Math.min(10, player.mana + 1);
      }
      updatedPlayer.field = updatedPlayer.field.map((unit) => {
        let updatedUnit = { ...unit };
        updatedUnit.hasAttacked = false;
        
        // Pokud je jednotka zmrazená, snížíme počet kol zmrazení o 1
        if (updatedUnit.frozen) {
          updatedUnit.frozenTurns = (updatedUnit.frozenTurns || 1) - 1;
          if (updatedUnit.frozenTurns <= 0) {
            updatedUnit.frozen = false;
            delete updatedUnit.frozenTurns;
          }
        }
        
        return updatedUnit;
      });
      return updatedPlayer;
    });

    // Přidání karty do ruky nového hráče
    if (updatedPlayers[nextPlayer].deck.length > 0) {
      const drawnCard = updatedPlayers[nextPlayer].deck.pop();
      updatedPlayers[nextPlayer].hand.push(drawnCard);
    }

    return {
      ...state,
      currentPlayer: nextPlayer,
      turn: newTurn,
      players: updatedPlayers,
    };
  };

  const addVisualFeedback = useCallback((type, value, position) => {
    const id = Date.now(); // Vytvoříme unikátní ID pro každou zpětnou vazbu
    setVisualFeedbacks(prev => [...prev, { id, type, value, position }]);
    
    setTimeout(() => {
      setVisualFeedbacks(prev => prev.filter(feedback => feedback.id !== id));
    }, 2500);
  }, []);

  const addNotification = useCallback((message, type = 'info') => {
    const id = notificationIdRef.current++;
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000); // Změněno z 3000 na 5000 pro delší zobrazení
  }, []);

  const playCard = (cardIndex) => (prevState) => {
    const currentPlayerIndex = prevState.currentPlayer;
    const currentPlayer = prevState.players[currentPlayerIndex];
    const playedCard = currentPlayer.hand[cardIndex];

    if (!playedCard || currentPlayer.mana < playedCard.manaCost) {
      addNotification(`Nedostatek many pro zahrání karty ${playedCard.name}`, 'warning');
      return prevState;
    }

    const newState = playCardCommon(prevState, currentPlayerIndex, cardIndex);

    if (playedCard.type === 'spell') {
      const spellPosition = { x: '50%', y: '50%' };
      
      switch (playedCard.effect) {
        case 'Restore 8 health':
          addVisualFeedback('heal', 8, { x: '50%', y: '80%' });
          break;
        case 'Deal 6 damage':
          addVisualFeedback('damage', 6, { x: '50%', y: '10%' });
          break;
        case 'Deal 3 damage':
          addVisualFeedback('damage', 3, { x: '50%', y: '10%' });
          break;
        case 'Draw 2 cards':
          addVisualFeedback('draw', 2, spellPosition);
          break;
        default:
          addVisualFeedback('spell', playedCard.name, spellPosition);
      }
    }

    return checkGameOver(newState);
  };

  const attack = (attackerIndex, targetIndex, isHero = false, isAI = false) => (state) => {
    const newState = { ...state };
    const attacker = isAI ? newState.players[1].field[attackerIndex] : newState.players[0].field[attackerIndex];
    const defender = isHero 
      ? (isAI ? newState.players[0].hero : newState.players[1].hero)
      : (isAI ? newState.players[0].field[targetIndex] : newState.players[1].field[targetIndex]);

    const attackerPosition = isAI 
      ? { x: `calc(50% + ${attackerIndex * 10}% - 20px)`, y: '25%' }
      : { x: `calc(10% + ${attackerIndex * 10}% - 20px)`, y: '55%' };
    const defenderPosition = isHero
      ? { x: 'calc(50% - 20px)', y: isAI ? '75%' : '15%' }
      : isAI
        ? { x: `calc(10% + ${targetIndex * 10}% - 20px)`, y: '55%' }
        : { x: `calc(50% + ${targetIndex * 10}% - 20px)`, y: '25%' };

    if (isHero) {
      defender.health -= attacker.attack;
      addVisualFeedback('damage', attacker.attack, defenderPosition);
    } else {
      defender.health -= attacker.attack;
      attacker.health -= defender.attack;
      addVisualFeedback('damage', attacker.attack, defenderPosition);
      
      // Přidáme zpoždění pro zobrazení poškození útočníka
      setTimeout(() => {
        addVisualFeedback('damage', defender.attack, attackerPosition);
      }, 100);

      // Odstranění zničených jednotek
      if (defender.health <= 0) {
        if (isAI) {
          newState.players[0].field = newState.players[0].field.filter((_, index) => index !== targetIndex);
        } else {
          newState.players[1].field = newState.players[1].field.filter((_, index) => index !== targetIndex);
        }
      }
      if (attacker.health <= 0) {
        if (isAI) {
          newState.players[1].field = newState.players[1].field.filter((_, index) => index !== attackerIndex);
        } else {
          newState.players[0].field = newState.players[0].field.filter((_, index) => index !== attackerIndex);
        }
      }
    }

    attacker.hasAttacked = true;

    // Kontrola konce hry
    if (newState.players[1].hero.health <= 0) {
      newState.gameOver = true;
      newState.winner = 'Player';
    } else if (newState.players[0].hero.health <= 0) {
      newState.gameOver = true;
      newState.winner = 'AI';
    }

    return newState;
  };

  const checkGameOver = (state) => {
    const player1Health = state.players[0].hero.health;
    const player2Health = state.players[1].hero.health;

    if (player1Health <= 0 || player2Health <= 0) {
      return {
        ...state,
        gameOver: true,
        winner: player1Health > 0 ? 'Player 1' : 'Player 2',
      };
    }

    return state;
  };

  const endTurn = () => {
    setGameState((prevState) => {
      const nextPlayer = (prevState.currentPlayer + 1) % 2;
      const updatedState = startNextTurn(prevState, nextPlayer);

      // Pokud je na tahu AI, provedeme jeho tah
      if (nextPlayer === 1 && prevState.isAIOpponent) {
        return performAITurn(updatedState);
      }

      return updatedState;
    });
    setSelectedAttackerIndex(null);
  };

  const performAITurn = (state) => {
    let updatedState = { ...state };

    // Nejprve použijeme The Coin, pokud je k dispozici a je to výhodné
    const coinIndex = updatedState.players[1].hand.findIndex(card => card.name === 'The Coin');
    if (coinIndex !== -1 && updatedState.players[1].mana < 10 && updatedState.players[1].hand.some(card => card.manaCost === updatedState.players[1].mana + 1)) {
      updatedState = playCoin(1, updatedState);
    }

    // Seřadíme karty v ruce podle priority
    const sortedHand = [...updatedState.players[1].hand].sort((a, b) => {
      // Prioritizujeme karty s Taunt
      if (a.hasTaunt && !b.hasTaunt) return -1;
      if (!a.hasTaunt && b.hasTaunt) return 1;
      // Pak podle poměru útoku a many
      return (b.attack / b.manaCost) - (a.attack / a.manaCost);
    });

    // Hrajeme karty podle priority
    sortedHand.forEach((card, index) => {
      if (card.manaCost <= updatedState.players[1].mana) {
        updatedState = playAICard(updatedState, updatedState.players[1].hand.indexOf(card));
      }
    });

    // AI útočí
    updatedState = performAIAttacks(updatedState);

    // Předáme tah hráči
    const nextPlayer = 0;
    updatedState = startNextTurn(updatedState, nextPlayer);

    return updatedState;
  };

  const performAIAttacks = (state) => {
    let updatedState = { ...state };
    const aiField = updatedState.players[1].field;
    const playerField = updatedState.players[0].field;
    const playerHero = updatedState.players[0].hero;

    // Seřadíme jednotky AI podle priority útoku
    const sortedAIUnits = aiField.sort((a, b) => {
      if (a.hasAttacked !== b.hasAttacked) return a.hasAttacked ? 1 : -1;
      return b.attack - a.attack;
    });

    sortedAIUnits.forEach((attacker, index) => {
      if (!attacker.hasAttacked && !attacker.frozen) {
        const target = chooseTarget(playerField, playerHero, attacker);
        if (target) {
          updatedState = attack(index, target.index, target.isHero, true)(updatedState);
        }
      }
    });

    return updatedState;
  };

  const chooseTarget = (playerField, playerHero, attacker) => {
    const tauntUnits = playerField.filter(unit => unit.hasTaunt);
    
    if (tauntUnits.length > 0) {
      // Útočíme na jednotku s Taunt, která může být zničena
      const vulnerableTaunt = tauntUnits.find(unit => unit.health <= attacker.attack);
      if (vulnerableTaunt) {
        return { index: playerField.indexOf(vulnerableTaunt), isHero: false };
      }
      // Jinak útočíme na jednotku s Taunt s nejnižším zdravím
      return { index: playerField.indexOf(tauntUnits.reduce((min, unit) => unit.health < min.health ? unit : min, tauntUnits[0])), isHero: false };
    }

    // Hledáme jednotku, kterou můžeme zničit
    const vulnerableUnit = playerField.find(unit => unit.health <= attacker.attack);
    if (vulnerableUnit) {
      return { index: playerField.indexOf(vulnerableUnit), isHero: false };
    }

    // Pokud můžeme zničit hrdinu, uděláme to
    if (playerHero.health <= attacker.attack) {
      return { index: null, isHero: true };
    }

    // Útočíme na jednotku s nejvyšším útokem
    if (playerField.length > 0) {
      const highestAttackUnit = playerField.reduce((max, unit) => unit.attack > max.attack ? unit : max, playerField[0]);
      return { index: playerField.indexOf(highestAttackUnit), isHero: false };
    }

    // Pokud není jiná možnost, útočíme na hrdinu
    return { index: null, isHero: true };
  };

  const playAICard = (state, cardIndex) => {
    const newState = playCardCommon(state, 1, cardIndex);
    return checkGameOver(newState);
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    setGameState((prevState) => {
      const newState = { ...prevState };
      const currentPlayer = newState.players[0];
      const opponentPlayer = newState.players[1];

      if (source.droppableId === 'hand' && destination.droppableId === 'playerField') {
        // Logika pro hraní karty z ruky na pole
        const cardIndex = source.index;
        const card = currentPlayer.hand[cardIndex];
        
        if (card.type === 'spell') {
          // Pokud je to kouzlo, zahrajeme ho přímo
          return playCard(cardIndex)(newState);
        } else if (card.type === 'unit') {
          // Pokud je to jednotka, zahrajeme ji na pole
          return playCard(cardIndex)(newState);
        }
      } else if (source.droppableId === 'hand' && (destination.droppableId === 'opponentHero' || destination.droppableId.startsWith('opponentCard-'))) {
        // Pokus o útok kartou z ruky
        addNotification('Nelze útočit kartou, která není vyložena na herním poli', 'warning');
        return newState;
      } else if (source.droppableId === 'playerField') {
        const attackerIndex = source.index;
        const attacker = currentPlayer.field[attackerIndex];

        if (attacker.hasAttacked || attacker.frozen) {
          return newState;
        }

        const opponentTauntUnits = opponentPlayer.field.filter(unit => unit.hasTaunt);

        if (destination.droppableId === 'opponentHero') {
          // Útok na hrdinu
          if (opponentTauntUnits.length === 0) {
            return attack(attackerIndex, null, true)(newState);
          } else {
            addNotification('Nelze útočit na hrdinu, když je na poli jednotka s Taunt', 'warning');
            return newState;
          }
        } else if (destination.droppableId.startsWith('opponentCard-')) {
          // Útok na nepřátelskou jednotku
          const targetIndex = parseInt(destination.droppableId.split('-')[1]);
          const targetUnit = opponentPlayer.field[targetIndex];
          
          if (opponentTauntUnits.length === 0 || targetUnit.hasTaunt) {
            return attack(attackerIndex, targetIndex)(newState);
          } else {
            addNotification('Nelze útočit na tuto jednotku, když je na poli jednotka s Taunt', 'warning');
            return newState;
          }
        }
      }

      return newState;
    });
  };

  const renderClone = (provided, snapshot, rubric) => {
    const card = gameState.players[0].hand[rubric.source.index];
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



  if (gameState.gameOver) {
    return (
      <GameBoard>
        <h1>Hra skončila!</h1>
        <h2>Vítěz: {gameState.winner}</h2>
      </GameBoard>
    );
  }

  const opponentTauntUnits = gameState.players[1].field.filter((unit) => unit.hasTaunt);
  const playerTauntUnits = gameState.players[0].field.filter((unit) => unit.hasTaunt);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <GameBoard>
        <PlayerInfo>
          <DeckAndManaContainer>
            <DeckContainer>{gameState.players[1].deck.length}</DeckContainer>
            <ManaInfo>🔮 {gameState.players[1].mana}</ManaInfo>
          </DeckAndManaContainer>
        </PlayerInfo>

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
                  hero={gameState.players[1].hero}
                  isTargetable={gameState.players[0].field.some(card => !card.hasAttacked && !card.frozen) && gameState.players[1].field.every(card => !card.hasTaunt)}
                />
                {provided.placeholder}
              </HeroArea>
            )}
          </Droppable>

          <FieldArea>
            {gameState.players[1].field.map((card, index) => (
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
                      isTargetable={gameState.players[0].field.some(card => !card.hasAttacked && !card.frozen) && (gameState.players[1].field.every(unit => !unit.hasTaunt) || card.hasTaunt)}
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
                {gameState.players[0].field.map((card, index) => (
                  <Draggable key={card.id} draggableId={card.id} index={index} isDragDisabled={card.hasAttacked || card.frozen}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <CardDisplay
                          card={card}
                          canAttack={gameState.currentPlayer === 0 && !card.hasAttacked && !card.frozen}
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
            <HeroDisplay hero={gameState.players[0].hero} />
          </HeroArea>
        </BattleArea>

        <PlayerInfo>
          <DeckAndManaContainer>
            <DeckContainer>{gameState.players[0].deck.length}</DeckContainer>
            <ManaInfo>🔮 {gameState.players[0].mana}</ManaInfo>
          </DeckAndManaContainer>
          <EndTurnButton onClick={endTurn}>Ukončit tah</EndTurnButton>
        </PlayerInfo>

        <Droppable droppableId="hand" direction="horizontal" renderClone={renderClone}>
          {(provided) => (
            <HandArea
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {gameState.players[0].hand.map((card, index) => (
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
        <VisualFeedbackContainer feedbacks={visualFeedbacks} />
        <Notification notifications={notifications} />
      </GameBoard>
    </DragDropContext>
  );
}

export default GameScene;
