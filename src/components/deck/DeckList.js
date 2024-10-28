import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../../styles/theme';

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
    border: 1px solid ${props => props.isActive ? theme.colors.border.golden : '#444'};
    border-radius: 5px;
    cursor: pointer;

    &:hover {
        background: rgba(40, 40, 40, 0.9);
        border-color: ${theme.colors.border.golden};
    }
`;

const DeckName = styled.h3`
    color: ${theme.colors.text.primary};
    margin: 0;
`;

const CardCount = styled.span`
    color: ${theme.colors.text.secondary};
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

export const DeckList = ({ decks = [], onDeckSelect, onCreateDeck }) => {
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
                            onClick={() => onDeckSelect(deck)}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                        >
                            <DeckName>{deck.name}</DeckName>
                            <CardCount>{cardCount}/30 cards</CardCount>
                        </DeckCard>
                    );
                })
            )}
        </DeckListContainer>
    );
};
