import { addVisualFeedback } from '../utils/visualFeedbackUtils';

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
