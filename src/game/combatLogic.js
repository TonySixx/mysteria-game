import { addCombatLogEntry } from '../utils/visualFeedbackUtils';
import { checkGameOver } from './gameLogic';

export const attack = (attackerIndex, targetIndex, isHeroTarget, isAIAttacking, setLogEntries) => (state) => {
    debugger;
  let newState = { ...state };
  const attackerPlayerIndex = isAIAttacking ? 1 : 0;
  const defenderPlayerIndex = isAIAttacking ? 0 : 1;
  
  const attacker = newState.players[attackerPlayerIndex].field[attackerIndex];
  
  if (!attacker || attacker.hasAttacked || attacker.frozen) {
    return newState;
  }

  // Provedení útoku
  if (isHeroTarget) {
    // Útok na hrdinu
    newState.players[defenderPlayerIndex].hero.health -= attacker.attack;
    addCombatLogEntry(
      attacker,
      newState.players[defenderPlayerIndex].hero,
      attacker.attack,
      setLogEntries,
      isAIAttacking ? 'AI' : 'Player'
    );

    // Kontrola konce hry po útoku na hrdinu
    if (newState.players[defenderPlayerIndex].hero.health <= 0) {
      newState.gameOver = true;
      newState.winner = isAIAttacking ? 'AI' : 'Player';
      newState.players[defenderPlayerIndex].hero.health = 0; // Zajistíme, že zdraví neklesne pod 0
    }
  } else {
    // Útok na jednotku
    const target = newState.players[defenderPlayerIndex].field[targetIndex];
    if (!target) return newState;

    // Zpracování útoku s Divine Shield
    if (target.hasDivineShield) {
      target.hasDivineShield = false;
      addCombatLogEntry(
        attacker,
        target,
        0, // Žádné poškození při rozbití Divine Shield
        setLogEntries,
        isAIAttacking ? 'AI' : 'Player'
      );
    } else {
      target.health -= attacker.attack;
      addCombatLogEntry(
        attacker,
        target,
        attacker.attack,
        setLogEntries,
        isAIAttacking ? 'AI' : 'Player'
      );
    }

    if (!attacker.hasDivineShield) {
      attacker.health -= target.attack;
      addCombatLogEntry(
        target,
        attacker,
        target.attack,
        setLogEntries,
        isAIAttacking ? 'Player' : 'AI' // Obrácené pořadí, protože útočí cíl
      );
    } else {
      attacker.hasDivineShield = false;
      addCombatLogEntry(
        target,
        attacker,
        0, // Žádné poškození při rozbití Divine Shield
        setLogEntries,
        isAIAttacking ? 'Player' : 'AI'
      );
    }

    // Odstranění mrtvých jednotek
    newState.players[attackerPlayerIndex].field = newState.players[attackerPlayerIndex].field.filter(unit => unit.health > 0);
    newState.players[defenderPlayerIndex].field = newState.players[defenderPlayerIndex].field.filter(unit => unit.health > 0);

    // Přidáme logiku pro zaznamenání zničení jednotky
    if (!isHeroTarget && target.health <= attacker.attack) {
      setLogEntries(prev => [...prev, {
        timestamp: Date.now(),
        message: `<span class="${isAIAttacking ? 'enemy-name' : 'player-name'}">${attacker.name}</span> destroyed <span class="${isAIAttacking ? 'player-name' : 'enemy-name'}">${target.name}</span>`
      }]);
    }
  }

  // Označení útočníka jako použitého
  if (attacker) {
    attacker.hasAttacked = true;
  }

  // Kontrola konce hry po každém útoku
  return checkGameOver(newState);
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
