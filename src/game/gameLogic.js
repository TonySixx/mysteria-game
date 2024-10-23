import { addSpellVisualFeedback, addVisualFeedback } from '../utils/visualFeedbackUtils';

export const startNextTurn = (state, nextPlayer) => {
  const newTurn = state.turn + 1;

  let updatedPlayers = state.players.map((player, index) => {
    let updatedPlayer = { ...player };
    if (index === nextPlayer) {
      updatedPlayer.mana = Math.min(10, player.mana + 1);
    }
    updatedPlayer.field = updatedPlayer.field.map((unit) => {
      let updatedUnit = { ...unit };
      updatedUnit.hasAttacked = false;

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

  if (updatedPlayers[nextPlayer].deck.length > 0) {
    const drawnCard = updatedPlayers[nextPlayer].deck.pop();
    if (updatedPlayers[nextPlayer].hand.length < 10) {
      updatedPlayers[nextPlayer].hand.push(drawnCard);
    }
  }

  return {
    ...state,
    currentPlayer: nextPlayer,
    turn: newTurn,
    players: updatedPlayers,
  };
};

export const checkGameOver = (state) => {
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

export const playCardCommon = (state, playerIndex, cardIndex, setVisualFeedbacksFunction) => {
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
    return playCoin(currentPlayerIndex, state, setVisualFeedbacksFunction);
  }

  if (currentPlayer.mana < playedCard.manaCost) {
    return state;
  }

  currentPlayer.mana -= playedCard.manaCost;
  currentPlayer.hand = currentPlayer.hand.filter((_, index) => index !== cardIndex);

  if (playedCard.type === 'unit') {
    const newUnit = { ...playedCard, hasAttacked: false, frozen: false };
    currentPlayer.field = [...currentPlayer.field, newUnit];

    if (playedCard.effect) {
      applyCardEffect(playedCard, currentPlayer, opponentPlayer, setVisualFeedbacksFunction);
    }
  } else if (playedCard.type === 'spell') {
    applySpellEffect(playedCard, currentPlayer, opponentPlayer, setVisualFeedbacksFunction);
  }

  addSpellVisualFeedback(playedCard, setVisualFeedbacksFunction);
  applyArcaneFamiliarEffect(currentPlayer, playedCard, setVisualFeedbacksFunction);

  const updatedPlayers = [...state.players];
  updatedPlayers[currentPlayerIndex] = currentPlayer;
  updatedPlayers[opponentPlayerIndex] = opponentPlayer;

  return {
    ...state,
    players: updatedPlayers,
  };
};

const applyCardEffect = (card, currentPlayer, opponentPlayer, setVisualFeedbacksFunction) => {
  if (card.effect.includes('Deals 2 damage when played')) {
    opponentPlayer.hero.health -= 2;
  }
  if (card.effect.includes('Freeze enemy when played')) {
    const opponentField = opponentPlayer.field;
    if (opponentField.length > 0) {
      const randomIndex = Math.floor(Math.random() * opponentField.length);
      opponentField[randomIndex] = {
        ...opponentField[randomIndex],
        frozen: true,
        frozenTurns: 2
      };
    }
  }
  if (card.effect.includes('Draw a card when played')) {
    drawCard(currentPlayer, setVisualFeedbacksFunction);
  }
};

const applySpellEffect = (spell, currentPlayer, opponentPlayer, setVisualFeedbacksFunction) => {
  switch (spell.effect) {
    case 'Deal 6 damage':
      opponentPlayer.hero.health -= 6;
      break;
    case 'Restore 8 health':
      currentPlayer.hero.health = Math.min(30, currentPlayer.hero.health + 8);
      break;
    case 'Deal 3 damage':
      opponentPlayer.hero.health -= 3;
      break;
    case 'Draw 2 cards':
      for (let i = 0; i < 2; i++) {
        drawCard(currentPlayer, setVisualFeedbacksFunction);
      }
      break;
    case 'Freeze all enemy minions':
      opponentPlayer.field = opponentPlayer.field.map(unit => ({
        ...unit,
        frozen: true,
        frozenTurns: 2
      }));
      break;
    case 'Deal 4 damage to all enemy minions':
      opponentPlayer.field = opponentPlayer.field.map(unit => ({
        ...unit,
        health: unit.health - 4
      })).filter(unit => unit.health > 0);
      break;
    default: break;
  }
};

const drawCard = (player, setVisualFeedbacksFunction) => {
  if (player.deck.length > 0) {
    const drawnCard = player.deck.pop();
    if (player.hand.length < 10) {
      player.hand.push(drawnCard);
    } else {
      const spellPosition = { x: '50%', y: '50%' };
      addVisualFeedback('burn', drawnCard.name, spellPosition, setVisualFeedbacksFunction);
    }
  }
};

const applyArcaneFamiliarEffect = (player, playedCard, setVisualFeedbacksFunction) => {
  player.field = player.field.map(unit => {
    const spellPosition = { x: '50%', y: '50%' };
    if (unit.effect && unit.effect.includes('Gain +1 attack for each spell cast') && playedCard.type === 'spell') {
      addVisualFeedback('spell', 'Gain +1 attack', spellPosition, setVisualFeedbacksFunction);
      return { ...unit, attack: unit.attack + 1 };
    }
    return unit;
  });
};

export const playCoin = (playerIndex, state, setVisualFeedbacksFunction) => {
  const updatedPlayers = [...state.players];
  const currentPlayer = { ...updatedPlayers[playerIndex] };
  currentPlayer.mana += 1;
  currentPlayer.hand = currentPlayer.hand.filter(card => card.name !== 'The Coin');
  updatedPlayers[playerIndex] = currentPlayer;

  const spellPosition = { x: '50%', y: '50%' };
  addVisualFeedback('spell', 'Gain 1 Mana Crystal', spellPosition, setVisualFeedbacksFunction);

  return { ...state, players: updatedPlayers };
};
