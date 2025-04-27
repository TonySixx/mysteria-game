let feedbackId = 0;

const createLogMessage = (playerName, card, effect, target = 'the enemy hero') => {
  const isPlayer = playerName === 'Player';
  const playerClass = isPlayer ? 'player-name' : 'enemy-name';
  
  // Combat messages
  if (effect.type === 'combat') {
    const targetName = effect.target === 'Hero' ? 'the enemy Hero' : effect.target;
    return `<span class="${playerClass}">${playerName}</span> attacked with <span class="spell-name">${effect.attacker}</span> dealing <span class="damage">${effect.value} damage</span> to <span class="spell-name">${targetName}</span>`;
  }

  // Pokud effect není objekt nebo nemá type, použijeme výchozí typ
  const effectType = effect?.type || 'default';

  const messages = {
    damage: `<span class="${playerClass}">${playerName}</span> cast <span class="spell-name">${card}</span> dealing <span class="damage">${effect.value} damage</span> to ${target}`,
    heal: `<span class="${playerClass}">${playerName}</span> cast <span class="spell-name">${card}</span> restoring <span class="heal">${effect.value} health</span>`,
    mana: `<span class="${playerClass}">${playerName}</span> used <span class="spell-name">${effect.source || card}</span> and gained <span class="mana">${effect.value} mana crystal</span>`,
    freeze: `<span class="${playerClass}">${playerName}</span> cast <span class="spell-name">${card}</span> and <span class="freeze">froze ${effect.value === 'all' ? 'all enemies' : 'an enemy'}</span>`,
    draw: `<span class="${playerClass}">${playerName}</span> drew <span class="draw">${effect.value} ${effect.value === 1 ? 'card' : 'cards'}</span> using <span class="spell-name">${card}</span>`,
    buff: `<span class="${playerClass}">${playerName}</span>'s <span class="spell-name">${card}</span> gained <span class="buff">${effect.value}</span>`,
    taunt: `<span class="${playerClass}">${playerName}</span> summoned <span class="spell-name">${card}</span> with <span class="taunt">Taunt</span>`,
    shield: `<span class="${playerClass}">${playerName}</span> summoned <span class="spell-name">${card}</span> with <span class="shield">Divine Shield</span>`,
    summon: `<span class="${playerClass}">${playerName}</span> summoned <span class="spell-name">${card}</span>`,
    death: `<span class="spell-name">${effect.unit}</span> was destroyed`,
    attack_blocked: `<span class="spell-name">${effect.attacker}</span>'s attack was blocked by <span class="shield">Divine Shield</span>`,
    shield_broken: `<span class="spell-name">${effect.target}</span>'s Divine Shield was broken`,
    card_burned: `<span class="${playerClass}">${playerName}</span>'s <span class="spell-name">${card}</span> was burned due to full hand`,
    spell: `<span class="${playerClass}">${playerName}</span> used <span class="spell-name">${card}</span>`,
    default: `<span class="${playerClass}">${playerName}</span> played <span class="spell-name">${card}</span>`
  };

  return messages[effectType] || messages.default;
};

export const addVisualFeedback = (type, value, position, setLogEntries, playerName = 'Player') => {
  const newEntry = {
    id: feedbackId++,
    isPlayer: playerName === 'Player',
    message: createLogMessage(playerName, type, value),
    timestamp: new Date().getTime()
  };

  setLogEntries(prev => [...prev, newEntry]);

  if (feedbackId > 50) {
    setLogEntries(prev => prev.slice(-50));
  }
};

export const addCombatLogEntry = (attacker, target, damage, setLogEntries, playerName = 'Player') => {
  const effect = {
    type: 'combat',
    attacker: attacker.name,
    target: target.name || 'enemy hero',
    value: damage
  };

  addVisualFeedback(null, effect, null, setLogEntries, playerName);
};

export const addSpellVisualFeedback = (card, setLogEntries, playerName = 'Player') => {
  switch (card.name) {
    case 'Fireball':
      addVisualFeedback(card.name, { type: 'damage', value: 6 }, null, setLogEntries, playerName);
      break;
    case 'Lightning Bolt':
      addVisualFeedback(card.name, { type: 'damage', value: 3 }, null, setLogEntries, playerName);
      break;
    case 'Healing Touch':
      addVisualFeedback(card.name, { type: 'heal', value: 8 }, null, setLogEntries, playerName);
      break;
    case 'Arcane Intellect':
      addVisualFeedback(card.name, { type: 'draw', value: 2 }, null, setLogEntries, playerName);
      break;
    case 'Glacial Burst':
      addVisualFeedback(card.name, { type: 'freeze', value: 'all' }, null, setLogEntries, playerName);
      break;
    case 'Inferno Wave':
      addVisualFeedback(card.name, { type: 'damage', value: 4 }, null, setLogEntries, playerName);
      break;
    case 'The Coin':
      addVisualFeedback(card.name, { 
        type: 'mana', 
        value: 1,
        source: card.name 
      }, null, setLogEntries, playerName);
      break;
    case 'Fire Elemental':
      addVisualFeedback(card.name, { type: 'summon', value: null }, null, setLogEntries, playerName);
      addVisualFeedback('Battlecry', { type: 'damage', value: 2 }, null, setLogEntries, playerName);
      break;
    case 'Water Elemental':
      addVisualFeedback(card.name, { type: 'summon', value: null }, null, setLogEntries, playerName);
      addVisualFeedback('Battlecry', { type: 'freeze', value: 1 }, null, setLogEntries, playerName);
      break;
    case 'Nimble Sprite':
      addVisualFeedback(card.name, { type: 'summon', value: null }, null, setLogEntries, playerName);
      addVisualFeedback('Battlecry', { type: 'draw', value: 1 }, null, setLogEntries, playerName);
      break;
    case 'Arcane Familiar':
      addVisualFeedback(card.name, { type: 'summon', value: null }, null, setLogEntries, playerName);
      break;
    case 'Shield Bearer':
    case 'Earth Golem':
      addVisualFeedback(card.name, { type: 'taunt', value: null }, null, setLogEntries, playerName);
      break;
    case 'Radiant Protector':
      addVisualFeedback(card.name, { type: 'summon', value: null }, null, setLogEntries, playerName);
      addVisualFeedback(card.name, { type: 'shield', value: null }, null, setLogEntries, playerName);
      addVisualFeedback(card.name, { type: 'taunt', value: null }, null, setLogEntries, playerName);
      break;
    default:
      addVisualFeedback(card.name, { type: 'summon', value: null }, null, setLogEntries, playerName);
  }
};
