import { addCombatLogEntry, addVisualFeedback } from '../utils/visualFeedbackUtils';

export const attack = (attackerIndex, targetIndex, isHeroTarget, isAIAttacker, setLogEntries) => (state) => {
  const attackerPlayerIndex = isAIAttacker ? 1 : 0;
  const attackerPlayer = state.players[attackerPlayerIndex];
  const defenderPlayer = state.players[isAIAttacker ? 0 : 1];
  const attacker = attackerPlayer.field[attackerIndex];
  const playerName = isAIAttacker ? 'Enemy' : 'Player';

  // Kontrola existence útočníka
  if (!attacker) {
    console.error('Attacker not found:', { attackerIndex, attackerPlayerIndex });
    return state;
  }

  if (isHeroTarget) {
    // Útok na hrdinu
    addCombatLogEntry(
      attacker,
      { name: 'Hero', isHero: true },
      attacker.attack,
      setLogEntries,
      playerName
    );
    
    defenderPlayer.hero.health -= attacker.attack;
  } else {
    // Útok na jednotku
    const target = defenderPlayer.field[targetIndex];
    
    // Kontrola existence cíle
    if (!target) {
      console.error('Target not found:', { targetIndex });
      return state;
    }

    addCombatLogEntry(
      attacker,
      target,
      attacker.attack,
      setLogEntries,
      playerName
    );
    
    if (target.hasDivineShield) {
      target.hasDivineShield = false;
      addVisualFeedback(target.name, { 
        type: 'shield_broken',
        target: target.name 
      }, null, setLogEntries, playerName);
    } else {
      target.health -= attacker.attack;
      
      if (target.health <= 0) {
        addVisualFeedback(target.name, {
          type: 'death',
          unit: target.name
        }, null, setLogEntries, playerName);
      }
    }

    if (!target.hasDivineShield) {
      if (attacker.hasDivineShield) {
        attacker.hasDivineShield = false;
        addVisualFeedback(attacker.name, {
          type: 'shield_broken',
          target: attacker.name
        }, null, setLogEntries, playerName);
      } else {
        attacker.health -= target.attack;
        
        if (attacker.health <= 0) {
          addVisualFeedback(attacker.name, {
            type: 'death',
            unit: attacker.name
          }, null, setLogEntries, playerName);
        }
      }
    }
  }

  attacker.hasAttacked = true;

  // Odstraníme mrtvé jednotky
  attackerPlayer.field = attackerPlayer.field.filter(unit => unit.health > 0);
  defenderPlayer.field = defenderPlayer.field.filter(unit => unit.health > 0);

  return state;
};

export const performAIAttacks = (state, setLogEntries) => {
  let updatedState = { ...state };
  const aiField = updatedState.players[1].field;
  const playerField = updatedState.players[0].field;

  // Kontrola existence polí
  if (!aiField || !playerField) {
    console.error('Fields not found:', { aiField, playerField });
    return updatedState;
  }

  aiField.forEach((attacker, index) => {
    if (attacker && !attacker.hasAttacked && !attacker.frozen) {
      const target = chooseTarget(playerField, updatedState.players[0].hero);
      if (target && target.type === 'hero') {
        updatedState = attack(index, null, true, true, setLogEntries)(updatedState);
      } else if (target) {
        updatedState = attack(index, target.index, false, true, setLogEntries)(updatedState);
      }
    }
  });

  return updatedState;
};

export const chooseTarget = (playerField, playerHero) => {
  // Kontrola existence pole a hrdiny
  if (!playerField || !playerHero) {
    console.error('Player field or hero not found:', { playerField, playerHero });
    return null;
  }

  const tauntUnits = playerField.filter(unit => unit.hasTaunt);

  if (tauntUnits.length > 0) {
    const vulnerableTaunt = tauntUnits.find(unit => unit.health <= playerHero.attack);
    if (vulnerableTaunt) {
      return { index: playerField.indexOf(vulnerableTaunt), type: 'unit' };
    }
    return { index: playerField.indexOf(tauntUnits.reduce((min, unit) => unit.health < min.health ? unit : min, tauntUnits[0])), type: 'unit' };
  }

  const vulnerableUnit = playerField.find(unit => unit.health <= playerHero.attack);
  if (vulnerableUnit) {
    return { index: playerField.indexOf(vulnerableUnit), type: 'unit' };
  }

  if (playerHero.health <= playerHero.attack) {
    return { index: null, type: 'hero' };
  }

  if (playerField.length > 0) {
    const highestAttackUnit = playerField.reduce((max, unit) => unit.attack > max.attack ? unit : max, playerField[0]);
    return { index: playerField.indexOf(highestAttackUnit), type: 'unit' };
  }

  return { index: null, type: 'hero' };
};
