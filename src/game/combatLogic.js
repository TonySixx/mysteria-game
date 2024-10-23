import { addVisualFeedback } from '../utils/visualFeedbackUtils';

export const attack = (attackerIndex, targetIndex, isHero = false, isAI = false, setVisualFeedbacksFunction) => (state) => {
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
      addVisualFeedback('damage', attacker.attack, defenderPosition, setVisualFeedbacksFunction);
    }

    if (!attacker.hasDivineShield) {
      attacker.health -= defender.attack;
      addVisualFeedback('damage', defender.attack, attackerPosition, setVisualFeedbacksFunction);
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
    addVisualFeedback('damage', attacker.attack, defenderPosition, setVisualFeedbacksFunction);
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

export const performAIAttacks = (state, setVisualFeedbacksFunction) => {
  let updatedState = { ...state };
  const aiField = updatedState.players[1].field;
  const playerField = updatedState.players[0].field;
  const playerHero = updatedState.players[0].hero;

  const sortedAIUnits = aiField.sort((a, b) => {
    if (a.hasAttacked !== b.hasAttacked) return a.hasAttacked ? 1 : -1;
    return b.attack - a.attack;
  });

  sortedAIUnits.forEach((attacker, index) => {
    if (!attacker.hasAttacked && !attacker.frozen) {
      const target = chooseTarget(playerField, playerHero, attacker);
      if (target) {
        updatedState = attack(index, target.index, target.isHero, true, setVisualFeedbacksFunction)(updatedState);
      }
    }
  });

  return updatedState;
};

export const chooseTarget = (playerField, playerHero, attacker) => {
  const tauntUnits = playerField.filter(unit => unit.hasTaunt);

  if (tauntUnits.length > 0) {
    const vulnerableTaunt = tauntUnits.find(unit => unit.health <= attacker.attack);
    if (vulnerableTaunt) {
      return { index: playerField.indexOf(vulnerableTaunt), isHero: false };
    }
    return { index: playerField.indexOf(tauntUnits.reduce((min, unit) => unit.health < min.health ? unit : min, tauntUnits[0])), isHero: false };
  }

  const vulnerableUnit = playerField.find(unit => unit.health <= attacker.attack);
  if (vulnerableUnit) {
    return { index: playerField.indexOf(vulnerableUnit), isHero: false };
  }

  if (playerHero.health <= attacker.attack) {
    return { index: null, isHero: true };
  }

  if (playerField.length > 0) {
    const highestAttackUnit = playerField.reduce((max, unit) => unit.attack > max.attack ? unit : max, playerField[0]);
    return { index: playerField.indexOf(highestAttackUnit), isHero: false };
  }

  return { index: null, isHero: true };
};
