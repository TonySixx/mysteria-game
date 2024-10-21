export const addVisualFeedback = (type, value, position, setVisualFeedbacksSetter) => {
    const id = Date.now(); // Vytvoříme unikátní ID pro každou zpětnou vazbu
    setVisualFeedbacksSetter(prev => [...prev, { id, type, value, position }]);

   var timer = setTimeout(() => {
        setVisualFeedbacksSetter(prev => prev.filter(feedback => feedback.id !== id));
        clearTimeout(timer);    
    }, 2500);
};

export const addSpellVisualFeedback = (playedCard, setVisualFeedbacksSetter) => {
    const spellPosition = { x: '50%', y: '50%' };
    const heroPosition = { x: '50%', y: '10%' };
    const playerPosition = { x: '50%', y: '80%' };

    switch (playedCard.effect) {
        case 'Restore 8 health':
            addVisualFeedback('heal', 8, playerPosition, setVisualFeedbacksSetter);
            break;
        case 'Deal 6 damage':
        case 'Deal 3 damage':
            addVisualFeedback('damage', parseInt(playedCard.effect.match(/\d+/)[0]), heroPosition, setVisualFeedbacksSetter);
            break;
        case 'Draw 2 cards':
            addVisualFeedback('draw', 2, spellPosition, setVisualFeedbacksSetter);
            break;
        case 'Freeze all enemy minions':
            addVisualFeedback('spell', 'Freeze All', heroPosition, setVisualFeedbacksSetter);
            break;
        case 'Deal 4 damage to all enemy minions':
            addVisualFeedback('damage', 4, heroPosition, setVisualFeedbacksSetter);
            break;
        case 'burn':
            addVisualFeedback('burn', `Card burned`, spellPosition, setVisualFeedbacksSetter);
            break;
        default:
            console.log('No effect found');
    }

    // Přidáme vizuální zpětnou vazbu pro nové karty
    if (playedCard.name === 'Nimble Sprite') {
        addVisualFeedback('draw', 1, spellPosition, setVisualFeedbacksSetter);
    }
    if (playedCard.name === 'Arcane Familiar') {
        addVisualFeedback('spell', 'Arcane Familiar', spellPosition, setVisualFeedbacksSetter);
    }
    if (playedCard.name === 'Glacial Burst') {
        addVisualFeedback('spell', 'Freeze All', heroPosition, setVisualFeedbacksSetter);
    }
    if (playedCard.name === 'Radiant Protector') {
        addVisualFeedback('spell', 'Divine Shield', spellPosition, setVisualFeedbacksSetter);
    }
    if (playedCard.name === 'Inferno Wave') {
        addVisualFeedback('damage', 4, heroPosition, setVisualFeedbacksSetter);
    }
};