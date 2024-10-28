import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { deckService } from '../../services/deckService';
import { theme } from '../../styles/theme';
import { CARD_RARITY, DECK_RULES } from '../../constants';

const DeckBuilderContainer = styled(motion.div)`
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 20px;
    padding: 20px;
    height: calc(100vh - 80px);
    background: rgba(0, 0, 0, 0.8);
    color: white;
`;

const CardCollection = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
    padding: 20px;
    overflow-y: auto;
    height: 100%;
    background: rgba(30, 30, 30, 0.9);
    border-radius: 10px;
`;

const DeckPreview = styled.div`
    background: rgba(30, 30, 30, 0.9);
    border-radius: 10px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
`;

const Card = styled(motion.div)`
    background: ${props => `linear-gradient(45deg, #1a1a1a, ${CARD_RARITY[props.rarity]?.color || '#808080'}22)`};
    border: 2px solid ${props => CARD_RARITY[props.rarity]?.color || '#808080'};
    border-radius: 8px;
    padding: 10px;
    cursor: pointer;
    position: relative;
    
    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    }
`;

const Button = styled(motion.button)`
    background: ${props => props.variant === 'primary' ? theme.colors.primary : theme.colors.secondary};
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    margin: 5px;

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const DeckStats = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 10px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 5px;
    margin-bottom: 20px;
`;

const DeckName = styled.input`
    background: transparent;
    border: none;
    border-bottom: 2px solid #666;
    color: white;
    font-size: 1.2em;
    padding: 5px;
    margin-bottom: 20px;
    width: 100%;

    &:focus {
        outline: none;
        border-bottom-color: ${theme.colors.primary};
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-top: auto;
    padding-top: 20px;
`;

const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: ${theme.colors.background};
    color: ${theme.colors.text.primary};
`;

const LoadingText = styled.div`
    font-size: 1.5em;
    text-align: center;
    animation: pulse 1.5s infinite;

    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
    }
`;

const DeckBuilder = ({ onBack, userId }) => {
    const [availableCards, setAvailableCards] = useState([]);
    const [selectedCards, setSelectedCards] = useState({});
    const [deckName, setDeckName] = useState('New Deck');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCards();
    }, []);

    const loadCards = async () => {
        try {
            console.log('Starting to load cards...');
            const cards = await deckService.getCards();
            console.log('Cards loaded successfully:', cards);
            setAvailableCards(cards);
        } catch (error) {
            console.error('Error loading cards:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCard = (card) => {
        const currentCount = selectedCards[card.id]?.quantity || 0;
        const maxCopies = card.rarity === 'legendary' ? 1 : 2;
        const totalCards = Object.values(selectedCards).reduce((sum, card) => sum + card.quantity, 0);

        if (currentCount < maxCopies && totalCards < DECK_RULES.MAX_CARDS) {
            setSelectedCards(prev => ({
                ...prev,
                [card.id]: {
                    card: card,  // Uložíme celou kartu
                    quantity: (prev[card.id]?.quantity || 0) + 1
                }
            }));
        }
    };

    const handleRemoveCard = (cardId) => {
        setSelectedCards(prev => {
            const newCards = { ...prev };
            if (newCards[cardId].quantity > 1) {
                newCards[cardId].quantity--;
            } else {
                delete newCards[cardId];
            }
            return newCards;
        });
    };

    const handleSaveDeck = async () => {
        try {
            // Upravíme mapování karet pro správné ID
            const cards = Object.entries(selectedCards).map(([cardId, data]) => ({
                // Použijeme přímo ID karty z objektu card
                card_id: data.card.id,
                quantity: data.quantity
            }));

            console.log('Saving deck:', {
                userId,
                name: deckName,
                cards: cards
            });

            await deckService.createDeck(userId, deckName, cards);
            onBack();
        } catch (error) {
            console.error('Error saving deck:', error);
        }
    };

    const totalCards = Object.values(selectedCards).reduce((sum, card) => sum + card.quantity, 0);

    if (loading) {
        return (
            <LoadingContainer>
                <LoadingText>Loading cards...</LoadingText>
            </LoadingContainer>
        );
    }

    return (
        <DeckBuilderContainer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <DeckPreview>
                <Button onClick={onBack}>
                    <FaArrowLeft /> Back to Decks
                </Button>
                <DeckName
                    value={deckName}
                    onChange={(e) => setDeckName(e.target.value)}
                    placeholder="Deck Name"
                />
                <DeckStats>
                    <span>Cards: {totalCards}/30</span>
                </DeckStats>
                {Object.entries(selectedCards).map(([cardId, { card, quantity }]) => (
                    <Card
                        key={cardId}
                        rarity={card.rarity.toUpperCase()}
                        onClick={() => handleRemoveCard(cardId)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div>
                            {card.name} x{quantity}
                        </div>
                        <div>
                            Mana: {card.mana_cost}
                        </div>
                    </Card>
                ))}
                <ButtonGroup>
                    <Button
                        variant="primary"
                        onClick={handleSaveDeck}
                        disabled={totalCards !== DECK_RULES.MAX_CARDS}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FaSave /> Save Deck
                    </Button>
                </ButtonGroup>
            </DeckPreview>

            <CardCollection>
                {availableCards.map(card => (
                    <Card
                        key={card.id}
                        rarity={card.rarity.toUpperCase()}
                        onClick={() => handleAddCard(card)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div>{card.name}</div>
                        <div>Mana: {card.mana_cost}</div>
                        {card.type === 'unit' && (
                            <div>{card.attack} / {card.health}</div>
                        )}
                        <div>{card.effect}</div>
                        {selectedCards[card.id] && (
                            <div>In deck: {selectedCards[card.id].quantity}</div>
                        )}
                    </Card>
                ))}
            </CardCollection>
        </DeckBuilderContainer>
    );
};

export default DeckBuilder;
