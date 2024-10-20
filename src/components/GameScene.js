import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import earthGolem from '../assets/images/earth-golem.png';
import fireball from '../assets/images/fireball.png';   
import healingTouch from '../assets/images/healing-touch.png';
import lightningBolt from '../assets/images/lightning-bolt.png';
import arcaneIntellect from '../assets/images/arcane-intellect.png';
import fireElemental from '../assets/images/fire-elemental.png';
import shieldBearer from '../assets/images/shield-bearer.png';
import waterElemental from '../assets/images/water-elemental.png';
import coinImage from '../assets/images/mana-coin.png';




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

// Třída pro jednotku
class UnitCard extends Card {
  constructor(id, name, manaCost, attack, health, effect = null, image = null) {
    super(id, name, manaCost, 'unit');
    this.attack = attack;
    this.health = health;
    this.effect = effect;
    this.hasAttacked = false;
    this.hasTaunt = effect === 'Taunt';
    this.image = image;
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
  constructor(name, health = 30, specialAbility = null) {
    this.name = name;
    this.health = health;
    this.specialAbility = specialAbility;
  }
}

const GameBoard = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  background: linear-gradient(to bottom, #1a1a1a, #000000);
  color: #ffd700;
  font-family: 'Cinzel', serif;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const PlayerArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  padding: 20px 0;
`;

const HeroArea = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100px;
`;

const FieldArea = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  width: 100%;
  padding: 10px 0;
  box-sizing: border-box;
  min-height: 180px;
`;

const HandArea = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  width: 100%;
  padding: 10px 0;
  box-sizing: border-box;
`;

const PlayerInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 0px;
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

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 10px #ffd700;
  }
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

function HeroDisplay({ hero, onClick, isTargetable }) {
  return (
    <HeroComponent onClick={isTargetable ? onClick : null} isTargetable={isTargetable}>
      <HeroName>{hero.name}</HeroName>
      <HeroHealth>HP: {hero.health}</HeroHealth>
    </HeroComponent>
  );
}

const HeroComponent = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isTargetable'].includes(prop),
})`
  width: 100px;
  height: 80px;
  background: linear-gradient(45deg, #4a4a4a, #3a3a3a);
  border: 2px solid ${(props) => (props.isTargetable ? '#ffd700' : '#000')};
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 5px;
  cursor: ${(props) => (props.isTargetable ? 'pointer' : 'default')};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const HeroName = styled.div`
  font-weight: bold;
  text-align: center;
  font-size: 18px;
  color: #ffd700;
`;

const HeroHealth = styled.div`
  font-size: 24px;
  text-align: center;
  color: #ff4444;
  text-shadow: 0 0 5px #ff4444;
`;

function CardDisplay({ card, onClick, canAttack, onAttack, isTargetable, isSelected, isInHand }) {
  if (!card) return null;

  return (
    <CardComponent
      type={card.type}
      onClick={onClick}
      canAttack={canAttack}
      isTargetable={isTargetable}
      isSelected={isSelected}
      isInHand={isInHand}
    >
      <CardImage src={card.image} alt={card.name} />
      {card.hasTaunt && <TauntLabel>Taunt</TauntLabel>}
      <CardName>{card.name}</CardName>
      <CardStats>
        <span>🔮 {card.manaCost}</span>
        {card.type === 'unit' && (
          <>
            <span>⚔️ {card.attack}</span>
            <span>❤️ {card.health}</span>
          </>
        )}
      </CardStats>
      {canAttack && card.type === 'unit' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAttack();
          }}
        >
          Útok
        </button>
      )}
      {card.type === 'spell' && <button onClick={onClick}>Seslat</button>}
    </CardComponent>
  );
}

const CardComponent = styled.div.withConfig({
  shouldForwardProp: (prop) =>
    !['canAttack', 'isTargetable', 'isSelected', 'type', 'isInHand'].includes(prop),
})`
 width: ${(props) => (props.isInHand ? '110px' : '149px')};
  height: ${(props) => (props.isInHand ? '165px' : '224px')};
  background-color: ${(props) => (props.type === 'unit' ? '#4a4a4a' : '#3a3a3a')};
  border: 2px solid
    ${(props) => (props.isSelected ? '#ffd700' : props.isTargetable ? '#ff9900' : '#000')};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 5px;
  cursor: ${(props) => (props.canAttack || props.isTargetable ? 'pointer' : 'default')};
  position: relative;
  transition: transform 0.3s;
  transform-style: preserve-3d;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;

  &:hover {
    transform: ${(props) =>
      props.isInHand ? 'translateY(-10px)' : 'translateY(-5px) rotateY(-5deg)'};
  }
`;

const CardImage = styled.img`
  width: 100%;
  height: 60%;
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
`;

const CardStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
`;

function GameScene() {
  const [gameState, setGameState] = useState({
    players: [
      { hero: new Hero('Player'), deck: [], hand: [], field: [], mana: 1 },
      { hero: new Hero('AI'), deck: [], hand: [], field: [], mana: 1 },
    ],
    currentPlayer: 0,
    turn: 1,
    gameOver: false,
    winner: null,
    isAIOpponent: true,
  });

  const [selectedAttackerIndex, setSelectedAttackerIndex] = useState(null);

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
      return {
        ...prevState,
        players: prevState.players.map((player, index) => {
          const deck = [...(index === 0 ? player1Deck : player2Deck)].sort(() => Math.random() - 0.5);
          const hand = deck.splice(0, index === 0 ? 3 : 4);
          if (index === 1) {
            hand.push(new SpellCard('coin', 'The Coin', 0, 'Gain 1 Mana Crystal this turn only.', coinImage));
          }
          return {
            ...player,
            deck,
            hand,
            mana: index === 0 ? 1 : 0, // První hráč začíná s 1 manou, druhý s 0
          };
        }),
      };
    });
  }, []);

  const startNextTurn = (state, nextPlayer) => {
    const newTurn = state.turn + 1;
  
    let updatedPlayers = state.players.map((player, index) => {
      let updatedPlayer = { ...player };
      if (index === nextPlayer) {
        updatedPlayer.mana = Math.min(10, player.mana + 1);
      }
      updatedPlayer.field = updatedPlayer.field.map((unit) => ({ ...unit, hasAttacked: false }));
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

  const playCoin = (playerIndex) => {
    setGameState((prevState) => {
      const updatedPlayers = [...prevState.players];
      updatedPlayers[playerIndex].mana += 1;
      updatedPlayers[playerIndex].hand = updatedPlayers[playerIndex].hand.filter(card => card.name !== 'The Coin');
      return { ...prevState, players: updatedPlayers };
    });
  };

  const playCard = (cardIndex) => {
    setGameState((prevState) => {
      const currentPlayerIndex = prevState.currentPlayer;
      const opponentPlayerIndex = (prevState.currentPlayer + 1) % 2;

      const currentPlayer = { ...prevState.players[currentPlayerIndex] };
      const opponentPlayer = { ...prevState.players[opponentPlayerIndex] };

      const playedCard = currentPlayer.hand[cardIndex];

      if (!playedCard || currentPlayer.mana < playedCard.manaCost) {
        return prevState;
      }

      currentPlayer.mana -= playedCard.manaCost;
      currentPlayer.hand = currentPlayer.hand.filter((_, index) => index !== cardIndex);

      if (playedCard.type === 'unit') {
        currentPlayer.field = [...currentPlayer.field, playedCard];
        // Aplikujeme efekt karty při zahrání
        if (playedCard.effect === 'Deals 2 damage when played') {
          opponentPlayer.hero.health -= 2;
        }
        if (playedCard.effect === 'Freeze enemy when played') {
          // Implementace efektu Freeze zde (momentálně bez funkčnosti)
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
          // Lízni 2 karty
          const cardsToDraw = Math.min(2, currentPlayer.deck.length);
          const drawnCards = currentPlayer.deck.slice(0, cardsToDraw);
          currentPlayer.hand = [...currentPlayer.hand, ...drawnCards];
          currentPlayer.deck = currentPlayer.deck.slice(cardsToDraw);
        }
      }

      const updatedPlayers = [...prevState.players];
      updatedPlayers[currentPlayerIndex] = currentPlayer;
      updatedPlayers[opponentPlayerIndex] = opponentPlayer;

      return checkGameOver({
        ...prevState,
        players: updatedPlayers,
      });
    });
  };

  const attack = (attackerIndex, targetIndex, targetIsHero = false) => {
    setGameState((prevState) => {
      const currentPlayerIndex = prevState.currentPlayer;
      const opponentPlayerIndex = (prevState.currentPlayer + 1) % 2;
  
      const currentPlayer = { ...prevState.players[currentPlayerIndex] };
      const opponentPlayer = { ...prevState.players[opponentPlayerIndex] };
  
      const attacker = { ...currentPlayer.field[attackerIndex] };
  
      if (attacker.hasAttacked) {
        return prevState; // Jednotka už zaútočila v tomto kole
      }
  
      const opponentTauntUnits = opponentPlayer.field.filter((unit) => unit.hasTaunt);
  
      // Kontrola Taunt
      if (opponentTauntUnits.length > 0) {
        if (targetIsHero) {
          // Nemůžete útočit na hrdinu, pokud má protivník Taunt jednotky
          return prevState;
        }
        const targetUnit = opponentPlayer.field[targetIndex];
        if (!targetUnit.hasTaunt) {
          // Nemůžete útočit na jednotky bez Tauntu, pokud má protivník Taunt jednotky
          return prevState;
        }
      }
  
      attacker.hasAttacked = true;
  
      if (targetIsHero) {
        opponentPlayer.hero.health -= attacker.attack;
      } else {
        const target = { ...opponentPlayer.field[targetIndex] };
        target.health -= attacker.attack;
        attacker.health -= target.attack;
  
        opponentPlayer.field = opponentPlayer.field
          .map((unit, index) => (index === targetIndex ? target : unit))
          .filter((unit) => unit.health > 0);
      }
  
      currentPlayer.field = currentPlayer.field
        .map((unit, index) => (index === attackerIndex ? attacker : unit))
        .filter((unit) => unit.health > 0);
  
      const updatedPlayers = [...prevState.players];
      updatedPlayers[currentPlayerIndex] = currentPlayer;
      updatedPlayers[opponentPlayerIndex] = opponentPlayer;
  
      return checkGameOver({
        ...prevState,
        players: updatedPlayers,
      });
    });
    setSelectedAttackerIndex(null);
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

    // AI hraje karty
    updatedState.players[1].hand.forEach((card, index) => {
      if (card.manaCost <= updatedState.players[1].mana) {
        updatedState = playAICard(updatedState, index);
      }
    });

    // AI útočí
    const aiFieldLength = updatedState.players[1].field.length;
    for (let i = 0; i < aiFieldLength; i++) {
      if (updatedState.players[1].field[i]) {
        updatedState = performAIAttack(updatedState, i);
      }
    }

    // Předáme tah hráči
    const nextPlayer = 0;
    updatedState = startNextTurn(updatedState, nextPlayer);

    return updatedState;
  };

  const playAICard = (state, cardIndex) => {
    const currentPlayerIndex = 1;
    const opponentPlayerIndex = 0;

    const currentPlayer = { ...state.players[currentPlayerIndex] };
    const opponentPlayer = { ...state.players[opponentPlayerIndex] };

    const playedCard = currentPlayer.hand[cardIndex];

    if (!playedCard || currentPlayer.mana < playedCard.manaCost) {
      return state;
    }

    currentPlayer.mana -= playedCard.manaCost;
    currentPlayer.hand = currentPlayer.hand.filter((_, index) => index !== cardIndex);

    if (playedCard.type === 'unit') {
      currentPlayer.field = [...currentPlayer.field, playedCard];
      if (playedCard.effect === 'Deals 2 damage when played') {
        opponentPlayer.hero.health -= 2;
      }
      if (playedCard.effect === 'Freeze enemy when played') {
        // Implementace efektu Freeze zde (momentálně bez funkčnosti)
      }
    } else if (playedCard.type === 'spell') {
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

    return checkGameOver({
      ...state,
      players: updatedPlayers,
    });
  };

  const performAIAttack = (state, attackerIndex) => {
    const currentPlayerIndex = 1;
    const opponentPlayerIndex = 0;

    const currentPlayer = { ...state.players[currentPlayerIndex] };
    const opponentPlayer = { ...state.players[opponentPlayerIndex] };

    const attacker = currentPlayer.field[attackerIndex];

    // Kontrola, zda útočník stále existuje
    if (!attacker) {
      return state;
    }

    if (attacker.hasAttacked) {
      return state;
    }

    attacker.hasAttacked = true;

    const opponentTauntUnits = opponentPlayer.field.filter((unit) => unit.hasTaunt);

    if (opponentTauntUnits.length > 0) {
      // Útok na náhodnou nepřátelskou jednotku s Tauntem
      const tauntIndex = opponentPlayer.field.findIndex((unit) => unit.hasTaunt);
      const target = opponentPlayer.field[tauntIndex];

      target.health -= attacker.attack;
      attacker.health -= target.attack;

      opponentPlayer.field = opponentPlayer.field.filter((unit) => unit.health > 0);
      currentPlayer.field = currentPlayer.field.filter((unit) => unit.health > 0);
    } else if (opponentPlayer.field.length > 0) {
      // Útok na náhodnou nepřátelskou jednotku
      const targetIndex = Math.floor(Math.random() * opponentPlayer.field.length);
      const target = opponentPlayer.field[targetIndex];

      target.health -= attacker.attack;
      attacker.health -= target.attack;

      opponentPlayer.field = opponentPlayer.field.filter((unit) => unit.health > 0);
      currentPlayer.field = currentPlayer.field.filter((unit) => unit.health > 0);
    } else {
      // Útok na hrdinu
      opponentPlayer.hero.health -= attacker.attack;
    }

    const updatedPlayers = [...state.players];
    updatedPlayers[currentPlayerIndex] = currentPlayer;
    updatedPlayers[opponentPlayerIndex] = opponentPlayer;

    return checkGameOver({
      ...state,
      players: updatedPlayers,
    });
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
    <GameBoard>
      <PlayerInfo>
        <HeroDisplay
          hero={gameState.players[1].hero}
          onClick={() => {
            if (selectedAttackerIndex !== null) {
              if (opponentTauntUnits.length === 0) {
                attack(selectedAttackerIndex, 0, true);
                setSelectedAttackerIndex(null);
              }
            }
          }}
          isTargetable={selectedAttackerIndex !== null && opponentTauntUnits.length === 0}
        />
        <DeckContainer>{gameState.players[1].deck.length}</DeckContainer>
      </PlayerInfo>

      <PlayerArea>
        <FieldArea>
          {gameState.players[1].field.map((card, index) => (
            <CardDisplay
              key={`player1-field-${card.id}`}
              card={card}
              onClick={() => {
                if (selectedAttackerIndex !== null) {
                  const targetUnit = gameState.players[1].field[index];
                  if (opponentTauntUnits.length > 0) {
                    if (targetUnit.hasTaunt) {
                      attack(selectedAttackerIndex, index);
                      setSelectedAttackerIndex(null);
                    }
                  } else {
                    attack(selectedAttackerIndex, index);
                    setSelectedAttackerIndex(null);
                  }
                }
              }}
              isTargetable={
                selectedAttackerIndex !== null &&
                (opponentTauntUnits.length === 0 || card.hasTaunt)
              }
            />
          ))}
        </FieldArea>

        <FieldArea>
          {gameState.players[0].field.map((card, index) => (
            <CardDisplay
              key={`player0-field-${card.id}`}
              card={card}
              canAttack={gameState.currentPlayer === 0 && !card.hasAttacked}
              onAttack={() => {
                setSelectedAttackerIndex(index);
              }}
              isSelected={selectedAttackerIndex === index}
            />
          ))}
        </FieldArea>
      </PlayerArea>

      <HandArea>
        {gameState.players[0].hand.map((card, index) => (
          <CardDisplay
            key={`player0-hand-${index}-${card.id}`}
            card={card}
            onClick={() => playCard(index)}
            isInHand={true}
          />
        ))}
      </HandArea>

      <PlayerInfo>
        <HeroDisplay hero={gameState.players[0].hero} />
        <ManaInfo>Mana: {gameState.players[0].mana}</ManaInfo>
        <EndTurnButton onClick={endTurn}>Ukončit tah</EndTurnButton>
        <DeckContainer>{gameState.players[0].deck.length}</DeckContainer>
      </PlayerInfo>
    </GameBoard>
  );
}

export default GameScene;
