import { playCoin } from './gameLogic';
import { attack } from './combatLogic';
import { startNextTurn } from './gameLogic';

// Výpočet síly pole
export const calculateFieldStrength = (field) => {
  return field.reduce((total, unit) => {
    let value = unit.attack + unit.health;
    if (unit.hasTaunt) value *= 1.5;
    if (unit.hasDivineShield) value *= 2;
    return total + value;
  }, 0);
};

// Kategorizace karet v ruce
export const categorizeDeckCards = (hand) => {
  const categories = {
    healingSpells: [],
    damageSpells: [],
    aoeSpells: [],
    tauntUnits: [],
    divineShieldUnits: [],
    strongUnits: [],
    otherUnits: [],
    otherSpells: [],
  };

  hand.forEach(card => {
    if (card.type === 'spell') {
      if (card.effect.includes('Restore') || card.effect.includes('heal')) {
        categories.healingSpells.push(card);
      } else if (card.effect.includes('damage to all')) {
        categories.aoeSpells.push(card);
      } else if (card.effect.includes('damage')) {
        categories.damageSpells.push(card);
      } else {
        categories.otherSpells.push(card);
      }
    } else if (card.type === 'unit') {
      if (card.effect.includes('Taunt')) {
        categories.tauntUnits.push(card);
      } else if (card.effect.includes('Divine Shield')) {
        categories.divineShieldUnits.push(card);
      } else if (card.attack >= 4 || card.health >= 5) {
        categories.strongUnits.push(card);
      } else {
        categories.otherUnits.push(card);
      }
    }
  });

  return categories;
};

// Rozhodnutí o použití mince
export const decideCoinUsage = (aiPlayer, analysis) => {
  // Použít minci pokud máme silnou kartu na příští tah nebo jsme v ohrožení
  const hasExpensiveCard = aiPlayer.hand.some(card => 
    card.manaCost === aiPlayer.mana + 1 && 
    (card.type === 'unit' && card.attack >= 4 || 
     card.hasTaunt || 
     (card.type === 'spell' && analysis.isAiInDanger))
  );
  
  return hasExpensiveCard || (analysis.isAiInDanger && aiPlayer.mana < 10);
};

// Defenzivní strategie
export const executeDefensiveStrategy = (state, cards, analysis, playAICard, setLogEntries) => {
  let updatedState = { ...state };
  
  // Seřadíme karty podle jejich hodnoty v aktuální situaci
  const allCards = [
    ...cards.healingSpells,
    ...cards.tauntUnits,
    ...cards.aoeSpells,
    ...cards.divineShieldUnits,
    ...cards.damageSpells,
    ...cards.strongUnits,
    ...cards.otherSpells,
    ...cards.otherUnits
  ].sort((a, b) => {
    const valueA = evaluateSpellValue(a, updatedState);
    const valueB = evaluateSpellValue(b, updatedState);
    return valueB - valueA;
  });

  // Hrajeme karty s pozitivní hodnotou
  allCards.forEach(card => {
    if (evaluateSpellValue(card, updatedState) > 0 && canPlayCard(updatedState.players[1], card)) {
      updatedState = playAICard(updatedState, updatedState.players[1].hand.indexOf(card));
    }
  });

  return updatedState;
};

// Agresivní strategie
export const executeAggressiveStrategy = (state, cards, analysis, playAICard, setLogEntries) => {
  let updatedState = { ...state };
  
  const playOrder = [
    ...cards.damageSpells,
    ...cards.strongUnits,
    ...cards.divineShieldUnits,
    ...cards.aoeSpells,
    ...cards.otherUnits,
    ...cards.otherSpells,
    ...cards.tauntUnits,
    ...cards.healingSpells,
    ...(cards.otherCards || [])
  ];

  playOrder.forEach(card => {
    if (canPlayCard(updatedState.players[1], card)) {
      updatedState = playAICard(updatedState, updatedState.players[1].hand.indexOf(card));
    }
  });

  return updatedState;
};

// Vyvážená strategie
export const executeBalancedStrategy = (state, cards, analysis, playAICard, setLogEntries) => {
  let updatedState = { ...state };
  
  const playOrder = [
    ...cards.strongUnits,
    ...cards.tauntUnits,
    ...cards.divineShieldUnits,
    ...cards.damageSpells,
    ...cards.aoeSpells,
    ...cards.otherUnits,
    ...cards.otherSpells,
    ...cards.healingSpells,
    ...(cards.otherCards || [])
  ];

  playOrder.forEach(card => {
    if (canPlayCard(updatedState.players[1], card)) {
      updatedState = playAICard(updatedState, updatedState.players[1].hand.indexOf(card),setLogEntries);
    }
  });

  return updatedState;
};

// Optimalizované útoky
export const performOptimizedAttacks = (state, setLogEntries, forceAttackHero = false) => {
  // Ověříme, že setLogEntries je funkce
  if (typeof setLogEntries !== 'function') {
    console.error('performOptimizedAttacks: setLogEntries není funkce!', setLogEntries);
    setLogEntries = () => {}; // Fallback na prázdnou funkci
  }

  let updatedState = { ...state };
  const aiPlayer = updatedState.players[1];
  const humanPlayer = updatedState.players[0];

  // Pokud máme forceAttackHero, útočíme přímo na hrdinu
  if (forceAttackHero) {
    aiPlayer.field.forEach((unit, index) => {
      if (!unit.hasAttacked && !unit.frozen) {
        const attackFunc = attack(index, null, true, true, setLogEntries);
        updatedState = attackFunc(updatedState);
      }
    });
    return updatedState;
  }

  // Standardní útočná logika
  const humanTaunts = humanPlayer.field.filter(unit => unit.hasTaunt);

  aiPlayer.field.forEach((attacker, attackerIndex) => {
    if (attacker.hasAttacked || attacker.frozen) return;

    if (humanTaunts.length > 0) {
      // Musíme útočit na taunty
      const bestTauntTarget = findBestTarget(humanTaunts, attacker);
      if (bestTauntTarget !== -1) {
        updatedState = attack(attackerIndex, bestTauntTarget, false, true, setLogEntries)(updatedState);
      }
    } else if (humanPlayer.field.length === 0) {
      // Pokud nepřítel nemá žádné jednotky, útočíme na hrdinu
      updatedState = attack(attackerIndex, null, true, true, setLogEntries)(updatedState);
    } else {
      // Hledáme nejvýhodnější cíl
      const bestTarget = findBestTarget(humanPlayer.field, attacker);
      if (bestTarget !== -1) {
        updatedState = attack(attackerIndex, bestTarget, false, true, setLogEntries)(updatedState);
      } else {
        // Pokud nemáme výhodný cíl, útočíme na hrdinu
        updatedState = attack(attackerIndex, null, true, true, setLogEntries)(updatedState);
      }
    }
  });

  return updatedState;
};

// Pomocné funkce
const canPlayCard = (player, card) => {
  // Pokud je to jednotka na poli, zkontrolujeme zmrazení
  if (card.type === 'unit' && card.frozen) {
    return false;
  }
  
  return card.manaCost <= player.mana && 
         (card.type !== 'unit' || player.field.length < 7);
};

const findOptimalTarget = (attacker, enemyField, enemyHero) => {
  // Pokud je útočník zmrazen, nemůže útočit
  if (attacker.frozen) {
    return null;
  }

  // Pokud můžeme zabít hrdinu, uděláme to
  if (attacker.attack >= enemyHero.health && !enemyField.some(unit => unit.hasTaunt)) {
    return { isHero: true };
  }

  // Najdeme nejvýhodnější výměnu
  const tauntUnits = enemyField.filter(unit => unit.hasTaunt);
  const targets = tauntUnits.length > 0 ? tauntUnits : enemyField;

  let bestTarget = null;
  let bestValue = -Infinity;

  targets.forEach((target, index) => {
    const value = calculateTradeValue(attacker, target);
    if (value > bestValue) {
      bestValue = value;
      bestTarget = { index, isHero: false };
    }
  });

  return bestTarget || (enemyField.some(unit => unit.hasTaunt) ? null : { isHero: true });
};

const calculateTradeValue = (attacker, defender) => {
  let value = 0;
  
  // Základní hodnota výměny
  value += defender.attack + defender.health;
  
  // Bonusy za speciální efekty
  if (defender.hasTaunt) value += 2;
  if (defender.hasDivineShield) value += 3;
  
  // Penalizace za nevýhodnou výměnu
  if (attacker.attack < defender.health && !attacker.hasDivineShield) value -= 2;
  if (defender.attack >= attacker.health && !attacker.hasDivineShield) value -= 2;
  
  return value;
};

export const canKillOpponent = (aiPlayer, humanPlayer) => {
  // Spočítáme celkové možné poškození
  const totalPossibleDamage = aiPlayer.field.reduce((total, unit) => {
    // Započítáme pouze jednotky, které mohou útočit
    if (!unit.hasAttacked && !unit.frozen) {
      return total + unit.attack;
    }
    return total;
  }, 0);

  // Přidáme poškození z kouzel v ruce
  const spellDamage = aiPlayer.hand.reduce((total, card) => {
    if (card.type === 'spell' && card.effect.includes('damage')) {
      // Extrahujeme číslo poškození z efektu (předpokládáme formát "Deal X damage")
      const damageMatch = card.effect.match(/Deal (\d+) damage/);
      if (damageMatch && aiPlayer.mana >= card.manaCost) {
        return total + parseInt(damageMatch[1]);
      }
    }
    return total;
  }, 0);

  // Kontrola, zda máme dostatek poškození k zabití hráče
  return (totalPossibleDamage + spellDamage) >= humanPlayer.hero.health;
};

const calculateTotalDamage = (aiPlayer, humanPlayer) => {
  let damage = 0;
  
  // Damage from field - pouze nezmrazené jednotky
  damage += aiPlayer.field.reduce((total, unit) => 
    total + (!unit.frozen && !unit.hasAttacked ? unit.attack : 0), 0);
  
  // Damage from hand
  damage += aiPlayer.hand.reduce((total, card) => {
    if (card.type === 'spell' && card.effect.includes('damage') && card.manaCost <= aiPlayer.mana) {
      const damageMatch = card.effect.match(/\d+/);
      return total + (damageMatch ? parseInt(damageMatch[0]) : 0);
    }
    return total;
  }, 0);

  return damage;
};

// Sekvence pro lethal
export const executeLethalSequence = (state, cards, playAICard, setLogEntries) => {
  let updatedState = { ...state };
  const aiPlayer = updatedState.players[1];

  // Nejprve zahrajeme poškozující kouzla
  cards.damageSpells.forEach((spell) => {
    if (aiPlayer.mana >= spell.manaCost) {
      const spellIndex = aiPlayer.hand.findIndex(card => card.id === spell.id);
      if (spellIndex !== -1) {
        updatedState = playAICard(updatedState, spellIndex);
      }
    }
  });

  // Poté provedeme útoky všemi jednotkami na hrdinu
  updatedState = performOptimizedAttacks(updatedState, setLogEntries, true);

  return updatedState;
};

// Funkce pro ukončení tahu AI
export const finalizeTurn = (state) => {
  const nextPlayer = 0; // Předání tahu hráči
  return startNextTurn(state, nextPlayer);
};

// Pomocná funkce pro nalezení nejlepšího cíle
function findBestTarget(targets, attacker) {
  let bestTargetIndex = -1;
  let bestValue = -Infinity;

  targets.forEach((target, index) => {
    const value = evaluateTarget(attacker, target);
    if (value > bestValue) {
      bestValue = value;
      bestTargetIndex = index;
    }
  });

  return bestTargetIndex;
}

// Pomocná funkce pro vyhodnocení hodnoty cíle
function evaluateTarget(attacker, target) {
  // Základní hodnota je rozdíl mezi poškozením a zdravím
  let value = attacker.attack - target.health;

  // Přidáme bonus za zabití jednotky
  if (attacker.attack >= target.health) {
    value += 5;
  }

  // Přidáme bonus za odstranění taunty
  if (target.hasTaunt) {
    value += 3;
  }

  // Přidáme bonus za odstranění nebezpečné jednotky
  if (target.attack >= 4) {
    value += 2;
  }

  return value;
}

// Přidáme novou funkci pro vyhodnocení užitečnosti kouzla
const evaluateSpellValue = (spell, gameState, isAIPlayer = true) => {
  const aiPlayer = isAIPlayer ? gameState.players[1] : gameState.players[0];
  const humanPlayer = isAIPlayer ? gameState.players[0] : gameState.players[1];
  
  switch (spell.name) {
    case 'Healing Touch':
      // Použít jen pokud máme méně než 75% zdraví
      const maxHealth = 30; // Maximální zdraví hrdiny
      const currentHealthPercentage = (aiPlayer.hero.health / maxHealth) * 100;
      return currentHealthPercentage <= 75 ? 5 : 0;
      
    case 'Glacial Burst':
      // Hodnota závisí na počtu nepřátelských jednotek
      const enemyUnits = humanPlayer.field.length;
      return enemyUnits >= 2 ? enemyUnits * 2 : 0;
      
    case 'Fireball':
      // Hodnotnější proti silným jednotkám nebo při nízkém zdraví nepřítele
      const bestTarget = findBestFireballTarget(humanPlayer);
      return bestTarget ? bestTarget.value : 0;
      
    case 'Lightning Bolt':
      // Podobně jako Fireball, ale pro menší poškození
      const lightningTarget = findBestLightningBoltTarget(humanPlayer);
      return lightningTarget ? lightningTarget.value : 0;
      
    case 'Inferno Wave':
      // Hodnota závisí na celkovém počtu nepřátelských jednotek a jejich zdraví
      return evaluateAoEValue(humanPlayer.field, 4);
      
    case 'Arcane Intellect':
      // Hodnotnější když máme málo karet v ruce
      return aiPlayer.hand.length <= 3 ? 6 : 3;
      
    default:
      return 1;
  }
};

// Pomocné funkce pro evaluateSpellValue
const findBestFireballTarget = (opponent) => {
  // Nejdřív zkontrolujeme, zda můžeme zabít hrdinu
  if (opponent.hero.health <= 6) {
    return { target: opponent.hero, value: 10 };
  }

  // Pak hledáme nejlepší jednotku k zabití
  const targets = opponent.field.map(unit => ({
    unit,
    value: calculateFireballValue(unit)
  }));

  return targets.length > 0 ? 
    targets.reduce((best, current) => current.value > best.value ? current : best) :
    null;
};

const calculateFireballValue = (unit) => {
  let value = 0;
  
  // Základní hodnota za zabití jednotky
  if (unit.health <= 6) {
    value += 5;
    
    // Bonus za efektivní využití poškození
    value += (6 - unit.health); // Čím méně přebývajícího poškození, tím lépe
    
    // Bonus za odstranění silných jednotek
    if (unit.attack >= 4) value += 2;
    if (unit.hasTaunt) value += 2;
    if (unit.hasDivineShield) value += 3;
  }
  
  return value;
};

const findBestLightningBoltTarget = (opponent) => {
  // Podobná logika jako u Fireballu, ale pro 3 poškození
  if (opponent.hero.health <= 3) {
    return { target: opponent.hero, value: 10 };
  }

  const targets = opponent.field.map(unit => ({
    unit,
    value: calculateLightningBoltValue(unit)
  }));

  return targets.length > 0 ? 
    targets.reduce((best, current) => current.value > best.value ? current : best) :
    null;
};

const calculateLightningBoltValue = (unit) => {
  let value = 0;
  
  if (unit.health <= 3) {
    value += 5;
    value += (3 - unit.health);
    if (unit.attack >= 3) value += 2;
    if (unit.hasTaunt) value += 2;
    if (unit.hasDivineShield) value += 3;
  }
  
  return value;
};

const evaluateAoEValue = (enemyField, damage) => {
  if (enemyField.length === 0) return 0;
  
  let value = 0;
  enemyField.forEach(unit => {
    if (unit.health <= damage) {
      value += 3;
      if (unit.attack >= 3) value += 1;
      if (unit.hasTaunt) value += 1;
    }
  });
  
  // Bonus za počet jednotek
  value += enemyField.length;
  
  return value;
};
