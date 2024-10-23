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
  const categorizedCards = {
    tauntUnits: hand.filter(card => card.type === 'unit' && card.hasTaunt),
    divineShieldUnits: hand.filter(card => card.type === 'unit' && card.hasDivineShield),
    strongUnits: hand.filter(card => card.type === 'unit' && card.attack >= 4),
    aoeSpells: hand.filter(card => card.type === 'spell' && (card.name === 'Inferno Wave' || card.name === 'Glacial Burst')),
    healingSpells: hand.filter(card => card.type === 'spell' && card.effect.includes('Restore')),
    damageSpells: hand.filter(card => card.type === 'spell' && card.effect.includes('damage') && !card.effect.includes('all')),
    otherSpells: hand.filter(card => 
      card.type === 'spell' && 
      !card.effect.includes('Restore') && 
      !card.effect.includes('damage') &&
      card.name !== 'Inferno Wave' && 
      card.name !== 'Glacial Burst'
    ),
    otherUnits: hand.filter(card => 
      card.type === 'unit' && 
      !card.hasTaunt && 
      !card.hasDivineShield && 
      card.attack < 4
    ),
    otherCards: [] // Inicializujeme jako prázdné pole
  };

  // Kontrola, zda jsme nezapomněli na nějaké karty
  const allCategorizedCards = Object.values(categorizedCards).flat();
  const uncategorizedCards = hand.filter(card => 
    !allCategorizedCards.some(categorizedCard => categorizedCard.id === card.id)
  );

  if (uncategorizedCards.length > 0) {
    console.warn('Nenakategorizované karty:', uncategorizedCards);
    categorizedCards.otherCards = uncategorizedCards; // Přiřadíme nekategorizované karty
  }

  return categorizedCards;
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
export const executeDefensiveStrategy = (state, cards, analysis, playAICard) => {
  let updatedState = { ...state };
  
  const playOrder = [
    ...cards.healingSpells,
    ...cards.tauntUnits,
    ...cards.aoeSpells,
    ...cards.divineShieldUnits,
    ...cards.damageSpells,
    ...cards.strongUnits,
    ...cards.otherSpells,
    ...cards.otherUnits,
    ...(cards.otherCards || [])
  ];

  playOrder.forEach(card => {
    if (canPlayCard(updatedState.players[1], card)) {
      updatedState = playAICard(updatedState, updatedState.players[1].hand.indexOf(card));
    }
  });

  return updatedState;
};

// Agresivní strategie
export const executeAggressiveStrategy = (state, cards, analysis, playAICard) => {
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
export const executeBalancedStrategy = (state, cards, analysis, playAICard) => {
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
      updatedState = playAICard(updatedState, updatedState.players[1].hand.indexOf(card));
    }
  });

  return updatedState;
};

// Optimalizované útoky
export const performOptimizedAttacks = (state, setLogEntries) => {
  let updatedState = { ...state };
  const aiField = updatedState.players[1].field;
  const humanField = updatedState.players[0].field;
  const humanHero = updatedState.players[0].hero;

  // Seřadíme jednotky podle priority útoku, ale vyfiltrujeme zmrazené
  const attackOrder = aiField
    .map((unit, index) => ({ unit, index }))
    .filter(({ unit }) => !unit.frozen && !unit.hasAttacked) // Přidána kontrola na frozen
    .sort((a, b) => {
      if (a.unit.hasDivineShield && !b.unit.hasDivineShield) return -1;
      if (!a.unit.hasDivineShield && b.unit.hasDivineShield) return 1;
      return b.unit.attack - a.unit.attack;
    });

  attackOrder.forEach(({ unit, index }) => {
    // Najdeme optimální cíl
    const target = findOptimalTarget(unit, humanField, humanHero);
    
    if (target) {
      updatedState = attack(index, target.index, target.isHero, true, setLogEntries)(updatedState);
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
  const totalDamage = calculateTotalDamage(aiPlayer, humanPlayer);
  return totalDamage >= humanPlayer.hero.health;
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
export const executeLethalSequence = (state, cards, playAICard) => {
  let updatedState = { ...state };
  
  // Nejdřív zahrajeme posilující kouzla a jednotky
  const playOrder = [
    ...cards.strongUnits,
    ...cards.divineShieldUnits,
    ...cards.damageSpells,
    ...cards.otherUnits,
    ...cards.otherSpells,
    ...(cards.otherCards || []) // Přidáme fallback pro případ, že otherCards je undefined
  ];

  playOrder.forEach(card => {
    if (canPlayCard(updatedState.players[1], card)) {
      updatedState = playAICard(updatedState, updatedState.players[1].hand.indexOf(card));
    }
  });

  return updatedState;
};

// Funkce pro ukončení tahu AI
export const finalizeTurn = (state) => {
  const nextPlayer = 0; // Předání tahu hráči
  return startNextTurn(state, nextPlayer);
};
