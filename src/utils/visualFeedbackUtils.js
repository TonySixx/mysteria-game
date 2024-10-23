let feedbackId = 0;

export const addVisualFeedback = (type, value, position, setVisualFeedbacks) => {
  const newFeedback = {
    id: feedbackId++,
    type,
    value,
    position,
  };

  setVisualFeedbacks(prev => [...prev, newFeedback]);

  const timer = setTimeout(() => {
    setVisualFeedbacks(prev => prev.filter(f => f.id !== newFeedback.id));
    clearTimeout(timer); // Zničíme timer po dokončení akce
  }, 3500);
};

export const addSpellVisualFeedback = (card, setVisualFeedbacks) => {
  const spellPosition = { x: '50%', y: '50%' };
  
  switch (card.name) {
    case 'Fireball':
      addVisualFeedback('damage', 6, spellPosition, setVisualFeedbacks);
      break;
    case 'Lightning Bolt':
      addVisualFeedback('damage', 3, spellPosition, setVisualFeedbacks);
      break;
    case 'Healing Touch':
      addVisualFeedback('heal', 8, spellPosition, setVisualFeedbacks);
      break;
    case 'Arcane Intellect':
      addVisualFeedback('draw', 2, spellPosition, setVisualFeedbacks);
      break;
    case 'Glacial Burst':
      addVisualFeedback('freeze', 'all', spellPosition, setVisualFeedbacks);
      break;
    case 'Inferno Wave':
      addVisualFeedback('damage', 4, spellPosition, setVisualFeedbacks);
      break;
    case 'The Coin':
      addVisualFeedback('mana', 1, spellPosition, setVisualFeedbacks);
      break;
    case 'Fire Elemental':
      addVisualFeedback('damage', 2, spellPosition, setVisualFeedbacks);
      break;
    case 'Water Elemental':
      addVisualFeedback('freeze', 1, spellPosition, setVisualFeedbacks);
      break;
    case 'Nimble Sprite':
      addVisualFeedback('draw', 1, spellPosition, setVisualFeedbacks);
      break;
    case 'Arcane Familiar':
      addVisualFeedback('buff', '+1 attack', spellPosition, setVisualFeedbacks);
      break;
    case 'Shield Bearer':
    case 'Earth Golem':
      addVisualFeedback('taunt', 'Taunt', spellPosition, setVisualFeedbacks);
      break;
    case 'Radiant Protector':
      addVisualFeedback('shield', 'Divine Shield', spellPosition, setVisualFeedbacks);
      addVisualFeedback('taunt', 'Taunt', spellPosition, setVisualFeedbacks);
      break;
    default:
      addVisualFeedback('spell', card.name, spellPosition, setVisualFeedbacks);
  }
};
