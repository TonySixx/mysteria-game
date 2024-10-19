import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Základní třída pro kartu
class Card {
  constructor(id, name, manaCost, type) {
    this.id = id;
    this.name = name;
    this.manaCost = manaCost;
    this.type = type;
  }
}

// Třída pro jednotku
class UnitCard extends Card {
  constructor(id, name, manaCost, attack, health, effect = null) {
    super(id, name, manaCost, 'unit');
    this.attack = attack;
    this.health = health;
    this.effect = effect;
  }
}

// Třída pro kouzlo
class SpellCard extends Card {
  constructor(id, name, manaCost, effect) {
    super(id, name, manaCost, 'spell');
    this.effect = effect;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100vh;
  background-color: #228B22;
`;

const PlayerArea = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 20px;
`;

const CardContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
`;

const CardComponent = styled.div`
  width: 100px;
  height: 150px;
  background-color: ${props => props.type === 'unit' ? '#ff9999' : '#9999ff'};
  border: 2px solid #000;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 5px;
  cursor: pointer;
`;

const CardName = styled.div`
  font-weight: bold;
  text-align: center;
`;

const CardStats = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ManaInfo = styled.div`
  font-size: 24px;
  color: white;
  margin-bottom: 10px;
`;
const EndTurnButton = styled.button`
  font-size: 18px;
  padding: 10px 20px;
  margin-top: 20px;
`;

const HeroComponent = styled.div`
  width: 120px;
  height: 180px;
  background-color: #ffd700;
  border: 2px solid #000;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 5px;
  margin: 10px;
`;

const HeroName = styled.div`
  font-weight: bold;
  text-align: center;
`;

const HeroHealth = styled.div`
  font-size: 24px;
  text-align: center;
`;

function HeroDisplay({ hero }) {
  return (
    <HeroComponent>
      <HeroName>{hero.name}</HeroName>
      <HeroHealth>HP: {hero.health}</HeroHealth>
    </HeroComponent>
  );
}

function CardDisplay({ card, onClick, canAttack, onAttack }) {
  if (!card) return null;

  return (
    <CardComponent type={card.type} onClick={onClick} canAttack={canAttack}>
      <CardName>{card.name}</CardName>
      <CardStats>
        <span>Mana: {card.manaCost}</span>
        {card.type === 'unit' && (
          <>
            <span>ATK: {card.attack}</span>
            <span>HP: {card.health}</span>
          </>
        )}
      </CardStats>
      {canAttack && card.type === 'unit' && <button onClick={onAttack}>Útok</button>}
      {card.type === 'spell' && <button onClick={onClick}>Seslat</button>}
    </CardComponent>
  );
}

function GameScene() {
  const [gameState, setGameState] = useState({
    players: [
      { hero: new Hero('Player 1'), deck: [], hand: [], field: [], mana: 1 },
      { hero: new Hero('Player 2'), deck: [], hand: [], field: [], mana: 0 }
    ],
    currentPlayer: 0,
    turn: 1,
    gameOver: false,
    winner: null,
  });

  useEffect(() => {
    const initializeDeck = () => {
      return [
        new UnitCard(1, 'Fire Elemental', 4, 5, 6, 'Deals 2 damage when played'),
        new UnitCard(2, 'Shield Bearer', 2, 1, 7, 'Taunt'),
        new SpellCard(3, 'Fireball', 4, 'Deal 6 damage'),
        new SpellCard(4, 'Healing Touch', 3, 'Restore 8 health'),
        // Přidejte další karty podle potřeby
      ];
    };

    setGameState(prevState => {
      const initializedDeck = initializeDeck();
      return {
        ...prevState,
        players: prevState.players.map(player => ({
          ...player,
          deck: [...initializedDeck],
          hand: initializedDeck.slice(0, 3),
        })),
      };
    });
  }, []);

  const playCard = (cardIndex) => {
    setGameState(prevState => {
      const currentPlayer = prevState.players[prevState.currentPlayer];
      const opponentPlayerIndex = (prevState.currentPlayer + 1) % 2;
      const opponentPlayer = prevState.players[opponentPlayerIndex];
      const playedCard = currentPlayer.hand[cardIndex];

      if (!playedCard || currentPlayer.mana < playedCard.manaCost) {
        return prevState;
      }

      const updatedCurrentPlayer = {
        ...currentPlayer,
        mana: currentPlayer.mana - playedCard.manaCost,
        hand: currentPlayer.hand.filter((_, index) => index !== cardIndex),
      };

      let updatedOpponentPlayer = { ...opponentPlayer };

      if (playedCard.type === 'unit') {
        updatedCurrentPlayer.field = [...updatedCurrentPlayer.field, playedCard];
        // Aplikujeme efekt karty při zahrání
        if (playedCard.effect === 'Deals 2 damage when played') {
          updatedOpponentPlayer.hero.health -= 2;
        }
      } else if (playedCard.type === 'spell') {
        // Aplikujeme efekt kouzla
        if (playedCard.effect === 'Deal 6 damage') {
          updatedOpponentPlayer.hero.health -= 6;
        } else if (playedCard.effect === 'Restore 8 health') {
          updatedCurrentPlayer.hero.health = Math.min(30, updatedCurrentPlayer.hero.health + 8);
        }
      }

      const updatedPlayers = [...prevState.players];
      updatedPlayers[prevState.currentPlayer] = updatedCurrentPlayer;
      updatedPlayers[opponentPlayerIndex] = updatedOpponentPlayer;

      return checkGameOver({
        ...prevState,
        players: updatedPlayers,
      });
    });
  };

  const attack = (attackerIndex, targetIndex, targetIsHero = false) => {
    setGameState(prevState => {
      const currentPlayer = prevState.players[prevState.currentPlayer];
      const opponentPlayer = prevState.players[(prevState.currentPlayer + 1) % 2];
      const attacker = currentPlayer.field[attackerIndex];

      if (targetIsHero) {
        opponentPlayer.hero.health -= attacker.attack;
      } else {
        const target = opponentPlayer.field[targetIndex];
        target.health -= attacker.attack;
        attacker.health -= target.attack;

        opponentPlayer.field = opponentPlayer.field.filter(unit => unit.health > 0);
        currentPlayer.field = currentPlayer.field.filter(unit => unit.health > 0);
      }

      return checkGameOver({
        ...prevState,
        players: [
          prevState.currentPlayer === 0 ? currentPlayer : opponentPlayer,
          prevState.currentPlayer === 1 ? currentPlayer : opponentPlayer
        ]
      });
    });
  };

  const checkGameOver = (state) => {
    const player1Health = state.players[0].hero.health;
    const player2Health = state.players[1].hero.health;

    if (player1Health <= 0 || player2Health <= 0) {
      return {
        ...state,
        gameOver: true,
        winner: player1Health > 0 ? 'Player 1' : 'Player 2'
      };
    }

    return state;
  };

  const endTurn = () => {
    setGameState(prevState => {
      const nextPlayer = (prevState.currentPlayer + 1) % 2;
      const newTurn = nextPlayer === 0 ? prevState.turn + 1 : prevState.turn;

      return {
        ...prevState,
        currentPlayer: nextPlayer,
        turn: newTurn,
        players: prevState.players.map((player, index) => ({
          ...player,
          mana: index === nextPlayer ? Math.min(10, newTurn) : player.mana,
        })),
      };
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

  return (
    <GameBoard>
      <PlayerArea>
        <HeroDisplay hero={gameState.players[1].hero} />
        <CardContainer>
          {gameState.players[1].field.map((card, index) => (
            <CardDisplay key={card.id} card={card} />
          ))}
        </CardContainer>
      </PlayerArea>
      <PlayerArea>
        <CardContainer>
          {gameState.players[0].field.map((card, index) => (
            <CardDisplay
              key={card.id}
              card={card}
              canAttack={gameState.currentPlayer === 0}
              onAttack={() => {
                if (gameState.players[1].field.length > 0) {
                  attack(index, 0);
                } else {
                  attack(index, 0, true);
                }
              }}
            />
          ))}
        </CardContainer>
      </PlayerArea>
      <PlayerArea>
        <HeroDisplay hero={gameState.players[0].hero} />
        <ManaInfo>Mana: {gameState.players[0].mana}</ManaInfo>
        <CardContainer>
          {gameState.players[0].hand.map((card, index) => (
            <CardDisplay
              key={card.id}
              card={card}
              onClick={() => playCard(index)}
            />
          ))}
        </CardContainer>
      </PlayerArea>
      <EndTurnButton onClick={endTurn}>End Turn</EndTurnButton>
    </GameBoard>
  );
}

export default GameScene;
