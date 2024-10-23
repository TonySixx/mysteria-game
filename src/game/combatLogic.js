import { addVisualFeedback } from '../utils/visualFeedbackUtils';

export const attack = (attackerIndex, targetIndex, isHero = false, isAI = false, setVisualFeedbacks) => (state) => {
  const newState = { ...state };
  const attacker = isAI ? newState.players[1].field[attackerIndex] : newState.players[0].field[attackerIndex];
  let defender;

  if (isHero) {
    defender = isAI ? newState.players[0].hero : newState.players[1].hero;
  } else {
    defender = isAI ? newState.players[0].field[targetIndex] : newState.players[1].field[targetIndex];
  }

  if (!attacker || !defender) {
    return newState;
  }

  const attackerPosition = isAI
    ? { x: `calc(50% + ${attackerIndex * 10}% - 20px)`, y: '25%' }
    : { x: `calc(10% + ${attackerIndex * 10}% - 20px)`, y: '55%' };
  const defenderPosition = isHero
    ? { x: 'calc(50% - 20px)', y: isAI ? '75%' : '15%' }
    : isAI
      ? { x: `calc(10% + ${targetIndex * 10}% - 20px)`, y: '55%' }
      : { x: `calc(50% + ${targetIndex * 10}% - 20px)`, y: '25%' };

  if (!isHero) {
    if (defender.hasDivineShield) {
      defender.hasDivineShield = false;
    } else {
      defender.health -= attacker.attack;
      addVisualFeedback('damage', attacker.attack, defenderPosition, setVisualFeedbacks);
    }

    if (attacker.hasDivineShield) {
      attacker.hasDivineShield = false;
    } else {
      attacker.health -= defender.attack;
      addVisualFeedback('damage', defender.attack, attackerPosition, setVisualFeedbacks);
    }

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
  } else {
    defender.health -= attacker.attack;
    addVisualFeedback('damage', attacker.attack, defenderPosition, setVisualFeedbacks);
  }

  attacker.hasAttacked = true;

  if (newState.players[1].hero.health <= 0) {
    newState.gameOver = true;
    newState.winner = 'Player';
  } else if (newState.players[0].hero.health <= 0) {
    newState.gameOver = true;
    newState.winner = 'AI';
  }

  return newState;
};
