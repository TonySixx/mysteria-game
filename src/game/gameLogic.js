import { addSpellVisualFeedback, addVisualFeedback } from '../utils/visualFeedbackUtils';

export const startNextTurn = (state, nextPlayer) => {
  console.log('Začátek nového kola:', {
    nextPlayer,
    frozenCardsBeforeReset: state.players[nextPlayer].field
      .filter(card => card.frozen)
      .map(card => card.name)
  });

  const newState = { ...state };
  
  // Zvýšíme manu pro nového hráče
  if (newState.players[nextPlayer].maxMana < 10) {
    newState.players[nextPlayer].maxMana += 1;
  }
  newState.players[nextPlayer].mana = newState.players[nextPlayer].maxMana;

  // Lízneme kartu
  if (newState.players[nextPlayer].deck.length > 0) {
    const drawnCard = newState.players[nextPlayer].deck.pop();
    newState.players[nextPlayer].hand.push(drawnCard);
  }

  // Resetujeme hasAttacked pro nového hráče, ale zachováme frozen stav
  newState.players[nextPlayer].field.forEach(card => {
    card.hasAttacked = false;
    // NERESETUJEME frozen stav - karta zůstává zmražená
  });

  // Aktualizujeme frozen stav pro předchozího hráče
  const previousPlayer = (nextPlayer + 1) % 2;
  newState.players[previousPlayer].field.forEach(card => {
    if (card.frozen) {
      // Rozmrazíme karty předchozího hráče, které byly zmražené
      card.frozen = false;
    }
  });

  newState.currentPlayer = nextPlayer;
  newState.turn += 1;

  console.log('Konec nového kola:', {
    nextPlayer,
    frozenCardsAfterReset: newState.players[nextPlayer].field
      .filter(card => card.frozen)
      .map(card => card.name)
  });

  return newState;
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

export const playCardCommon = (state, playerIndex, cardIndex, setLogEntries) => {
  const currentPlayer = state.players[playerIndex];
  const playedCard = currentPlayer.hand[cardIndex];

  // Kontrola existence karty
  if (!playedCard) {
    console.error('Attempted to play undefined card:', { playerIndex, cardIndex });
    return state;
  }

  const playerName = playerIndex === 0 ? 'Player' : 'Enemy';

  // Speciální případ pro "The Coin"
  if (playedCard.name === 'The Coin') {
    return playCoin(playerIndex, state, setLogEntries);
  }

  // Přidáme záznam do combat logu pro ostatní karty
  addSpellVisualFeedback(playedCard, setLogEntries, playerName);

  if (currentPlayer.mana < playedCard.manaCost) {
    return state;
  }

  currentPlayer.mana -= playedCard.manaCost;
  currentPlayer.hand = currentPlayer.hand.filter((_, index) => index !== cardIndex);

  if (playedCard.type === 'unit') {
    const newUnit = { ...playedCard, hasAttacked: false, frozen: false };
    currentPlayer.field = [...currentPlayer.field, newUnit];

    if (playedCard.effect) {
      applyCardEffect(playedCard, currentPlayer, state.players[1 - playerIndex], setLogEntries);
    }
  } else if (playedCard.type === 'spell') {
    applySpellEffect(playedCard, currentPlayer, state.players[1 - playerIndex], setLogEntries);
  }

  applyArcaneFamiliarEffect(currentPlayer, playedCard, setLogEntries);

  return {
    ...state,
    players: state.players.map((player, index) => {
      if (index === playerIndex) {
        return { ...player, mana: currentPlayer.mana };
      }
      return player;
    }),
  };
};

const applyCardEffect = (card, currentPlayer, opponentPlayer, setLogEntries) => {
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
    drawCard(currentPlayer, setLogEntries);
  }
};

const applySpellEffect = (spell, currentPlayer, opponentPlayer, setLogEntries) => {
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
        drawCard(currentPlayer, setLogEntries);
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

const drawCard = (player, setLogEntries) => {
  if (player.deck.length > 0) {
    const drawnCard = player.deck.pop();
    if (player.hand.length < 10) {
      player.hand.push(drawnCard);
    } else {
      const spellPosition = { x: '50%', y: '50%' };
      addVisualFeedback('burn', drawnCard.name, spellPosition, setLogEntries);
    }
  }
};

const applyArcaneFamiliarEffect = (player, playedCard, setLogEntries) => {
  player.field = player.field.map(unit => {
    const spellPosition = { x: '50%', y: '50%' };
    if (unit.effect && unit.effect.includes('Gain +1 attack for each spell cast') && playedCard.type === 'spell') {
      addVisualFeedback('spell', 'Gain +1 attack', spellPosition, setLogEntries);
      return { ...unit, attack: unit.attack + 1 };
    }
    return unit;
  });
};

export const playCoin = (playerIndex, state, setLogEntries) => {
  const updatedPlayers = [...state.players];
  const currentPlayer = { ...updatedPlayers[playerIndex] };
  const playerName = playerIndex === 0 ? 'Player' : 'Enemy';
  
  currentPlayer.mana += 1;
  currentPlayer.hand = currentPlayer.hand.filter(card => card.name !== 'The Coin');
  updatedPlayers[playerIndex] = currentPlayer;

  // Přidáme záznam do combat logu přímo zde
  addSpellVisualFeedback(
    { name: 'The Coin', type: 'spell' }, 
    setLogEntries,
    playerName
  );

  return { ...state, players: updatedPlayers };
};

export const freezeCard = (card) => {
  card.frozen = true;
};

export const isCardFrozen = (card) => {
  return card.frozen === true;
};
