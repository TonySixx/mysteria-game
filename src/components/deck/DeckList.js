import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../../styles/theme';
import { FaEdit, FaTrash, FaStar } from 'react-icons/fa';

const DeckListContainer = styled(motion.div)`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 2rem;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 10px;
    max-width: 800px;
    margin: 0 auto;
`;

const DeckCard = styled(motion.div)`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: rgba(30, 30, 30, 0.9);
    border: 2px solid ${props => props.isActive ? theme.colors.primary : '#444'};
    border-radius: 5px;
    position: relative;
    overflow: hidden;

    ${props => props.isActive && `
        background: linear-gradient(
            to right,
            rgba(255, 215, 0, 0.1),
            rgba(30, 30, 30, 0.9),
            rgba(255, 215, 0, 0.1)
        );
    `}

    &:hover {
        background: rgba(40, 40, 40, 0.9);
        border-color: ${theme.colors.primary};

        .deck-actions {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;

const DeckInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
`;

const ActiveIndicator = styled(FaStar)`
    color: ${theme.colors.primary};
    font-size: 1.2rem;
`;

const DeckName = styled.h3`
    color: ${theme.colors.text.primary};
    margin: 0;
`;

const CardCount = styled.span`
    color: ${theme.colors.text.secondary};
`;

const DeckActions = styled.div`
    display: flex;
    gap: 0.5rem;
    transform: translateX(100%);
    opacity: 0;
    transition: all 0.3s ease;
    position: absolute;
    right: 1rem;
    background: rgba(0, 0, 0, 0.8);
    padding: 0.5rem;
    border-radius: 5px;
`;

const ActionButton = styled.button`
    background: none;
    border: none;
    color: ${theme.colors.text.secondary};
    cursor: pointer;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
        color: ${theme.colors.text.primary};
        background: rgba(255, 255, 255, 0.1);
    }

    &.delete:hover {
        color: ${theme.colors.accent};
    }
`;

const CreateDeckButton = styled(motion.button)`
    padding: 1rem 2rem;
    background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%);
    border: none;
    border-radius: 5px;
    color: white;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 2rem;

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${theme.shadows.golden};
    }
`;

const EmptyState = styled.div`
    text-align: center;
    color: ${theme.colors.text.secondary};
    padding: 2rem;
`;

const handleDeleteClick = (e, deckId,onDeleteDeck) => {
    e.stopPropagation(); // Zastavíme propagaci události
    if (window.confirm('Are you sure you want to delete this deck?')) {
        onDeleteDeck(deckId);
    }
};

export const DeckList = ({ decks = [], onDeckSelect, onCreateDeck, onEditDeck, onDeleteDeck }) => {
    return (
        <DeckListContainer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            <CreateDeckButton
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCreateDeck}
            >
                Create New Deck
            </CreateDeckButton>

            {decks.length === 0 ? (
                <EmptyState>
                    No decks created yet. Create your first deck!
                </EmptyState>
            ) : (
                decks.map(deck => {
                    const cardCount = deck.deck_cards?.reduce((sum, card) => sum + card.quantity, 0) || 0;
                    
                    return (
                        <DeckCard
                            key={deck.id}
                            isActive={deck.is_active}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                        >
                            <DeckInfo onClick={() => onDeckSelect(deck)}>
                                {deck.is_active && <ActiveIndicator />}
                                <DeckName>{deck.name}</DeckName>
                                <CardCount>{cardCount}/30 cards</CardCount>
                            </DeckInfo>
                            <DeckActions className="deck-actions">
                                <ActionButton onClick={() => onEditDeck(deck)}>
                                    <FaEdit size={16} />
                                </ActionButton>
                                <ActionButton 
                                    className="delete"
                                    onClick={(e) => handleDeleteClick(e, deck.id,onDeleteDeck)}
                                >
                                    <FaTrash size={16} />
                                </ActionButton>
                            </DeckActions>
                        </DeckCard>
                    );
                })
            )}
        </DeckListContainer>
    );
};
