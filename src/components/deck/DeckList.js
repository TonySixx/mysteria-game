import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../../styles/theme';
import { FaEdit, FaTrash, FaStar, FaExclamationTriangle } from 'react-icons/fa';

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
    background: linear-gradient(135deg, ${theme.colors.secondary} 0%, ${theme.colors.backgroundLight} 100%);
    border: 2px solid ${props => props.isActive ? theme.colors.primary : 'transparent'};
    border-image: ${theme.colors.border.golden};
    border-image-slice: 1;
    border-radius: 8px;
    position: relative;
    overflow: hidden;
    margin-bottom: 10px;
    box-shadow: ${props => props.isActive ? theme.shadows.golden : 'none'};
    z-index: ${props => props.isActive ? 2 : 1};

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${theme.shadows.golden};

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
    font-family: 'Cinzel', serif;
    color: ${theme.colors.text.primary};
    margin: 0;
`;

const CardCount = styled.span`
    font-family: 'Crimson Pro', serif;
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
    border: 2px solid transparent;
    color: ${theme.colors.text.secondary};
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
        color: ${theme.colors.text.primary};
        background: rgba(255, 215, 0, 0.1);
        border-image: ${theme.colors.border.golden};
        border-image-slice: 1;
        box-shadow: ${theme.shadows.golden};
    }

    &.delete:hover {
        color: ${theme.colors.accent};
        border-color: ${theme.colors.accent};
    }
`;

const CreateDeckButton = styled(motion.button)`
    font-family: 'Cinzel', serif;
    width: 100%;
    padding: 15px;
    margin: 20px 0;
    background: linear-gradient(45deg, ${theme.colors.secondary}, ${theme.colors.backgroundLight});
    border: 2px solid transparent;
    border-image: ${theme.colors.border.golden};
    border-image-slice: 1;
    color: ${theme.colors.text.primary};
    font-size: 1.2em;
    cursor: pointer;
    transition: all 0.3s;
    text-transform: uppercase;
    letter-spacing: 1px;
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${theme.shadows.golden};
    }

    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
            45deg,
            transparent 0%,
            rgba(255, 215, 0, 0.1) 50%,
            transparent 100%
        );
        transform: translateY(-100%);
        opacity: 0;
        transition: all 0.3s;
    }

    &:hover::after {
        transform: translateY(0);
        opacity: 1;
    }
`;

const EmptyState = styled.div`
    font-family: 'Crimson Pro', serif;
    text-align: center;
    color: ${theme.colors.text.secondary};
    padding: 2rem;
`;

const DialogOverlay = styled(motion.div)`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const DialogContent = styled(motion.div)`
    background: linear-gradient(135deg, ${theme.colors.secondary} 0%, ${theme.colors.backgroundLight} 100%);
    padding: 2rem;
    border-radius: 10px;
    border: 2px solid transparent;
    border-image: ${theme.colors.border.golden};
    border-image-slice: 1;
    max-width: 400px;
    width: 90%;
    text-align: center;
    box-shadow: ${theme.shadows.golden};
`;

const DialogTitle = styled.h2`
    font-family: 'MedievalSharp', cursive;
    color: ${theme.colors.text.primary};
    margin: 0 0 1rem 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
`;

const DialogText = styled.p`
    font-family: 'Crimson Pro', serif;
    color: ${theme.colors.text.secondary};
    margin-bottom: 2rem;
`;

const DialogButtons = styled.div`
    display: flex;
    justify-content: center;
    gap: 1rem;
`;

const DialogButton = styled.button`
    font-family: 'Cinzel', serif;
    padding: 0.8rem 1.5rem;
    background: ${props => props.$danger ? 
        `linear-gradient(45deg, ${theme.colors.accent}, ${theme.colors.secondary})` :
        `linear-gradient(45deg, ${theme.colors.secondary}, ${theme.colors.backgroundLight})`
    };
    border: 2px solid transparent;
    border-image: ${props => props.$danger ? 'none' : theme.colors.border.golden};
    border-image-slice: 1;
    color: ${theme.colors.text.primary};
    cursor: pointer;
    font-size: 1em;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: all 0.3s;

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${props => props.$danger ? 
            '0 0 15px rgba(255, 0, 0, 0.3)' : 
            theme.shadows.golden
        };
    }
`;

const ConfirmDialog = ({ isOpen, onClose, onConfirm, deckName }) => {
    if (!isOpen) return null;

    return (
        <DialogOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <DialogContent
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                onClick={e => e.stopPropagation()}
            >
                <DialogTitle>
                    <FaExclamationTriangle color={theme.colors.accent} />
                    Confirm Deletion
                </DialogTitle>
                <DialogText>
                    Are you sure you want to delete the deck "{deckName}"? This action cannot be undone.
                </DialogText>
                <DialogButtons>
                    <DialogButton onClick={onClose}>
                        Cancel
                    </DialogButton>
                    <DialogButton $danger onClick={onConfirm}>
                        Delete
                    </DialogButton>
                </DialogButtons>
            </DialogContent>
        </DialogOverlay>
    );
};

const handleDeleteClick = (e, deck, onDeleteDeck, setDeletingDeck) => {
    e.stopPropagation();
    setDeletingDeck(deck);
};

export const DeckList = ({ decks = [], onDeckSelect, onCreateDeck, onEditDeck, onDeleteDeck }) => {
    const [deletingDeck, setDeletingDeck] = useState(null);

    // Seřadíme balíčky
    const sortedDecks = [...decks].sort((a, b) => {
        // Nejdřív podle aktivního stavu
        if (a.is_active && !b.is_active) return -1;
        if (!a.is_active && b.is_active) return 1;
        
        // Pak podle data poslední úpravy (nejnovější první)
        return new Date(b.updated_at) - new Date(a.updated_at);
    });

    return (
        <>
            <DeckListContainer
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
            >
                <CreateDeckButton
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onCreateDeck(null)}
                >
                    Create New Deck
                </CreateDeckButton>

                <AnimatePresence mode="popLayout">
                    {sortedDecks.length === 0 ? (
                        <EmptyState>
                            No decks created yet. Create your first deck!
                        </EmptyState>
                    ) : (
                        sortedDecks.map((deck, index) => {
                            const cardCount = deck.deck_cards?.reduce((sum, card) => sum + card.quantity, 0) || 0;
                            
                            return (
                                <DeckCard
                                    key={deck.id}
                                    isActive={deck.is_active}
                                    layout
                                    layoutId={deck.id.toString()}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ 
                                        type: "spring",
                                        stiffness: 500,
                                        damping: 50,
                                        mass: 1
                                    }}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                >
                                    <DeckInfo onClick={() => onDeckSelect(deck)}>
                                        <AnimatePresence>
                                            {deck.is_active && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    exit={{ scale: 0 }}
                                                >
                                                    <ActiveIndicator />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                        <DeckName>{deck.name}</DeckName>
                                        <CardCount>{cardCount}/30 cards</CardCount>
                                    </DeckInfo>
                                    <DeckActions className="deck-actions">
                                        <ActionButton onClick={() => onEditDeck(deck)}>
                                            <FaEdit size={16} />
                                        </ActionButton>
                                        <ActionButton 
                                            className="delete"
                                            onClick={(e) => handleDeleteClick(e, deck, onDeleteDeck, setDeletingDeck)}
                                        >
                                            <FaTrash size={16} />
                                        </ActionButton>
                                    </DeckActions>
                                </DeckCard>
                            );
                        })
                    )}
                </AnimatePresence>
            </DeckListContainer>

            <AnimatePresence>
                {deletingDeck && (
                    <ConfirmDialog
                        isOpen={true}
                        onClose={() => setDeletingDeck(null)}
                        onConfirm={() => {
                            onDeleteDeck(deletingDeck.id);
                            setDeletingDeck(null);
                        }}
                        deckName={deletingDeck.name}
                    />
                )}
            </AnimatePresence>
        </>
    );
};
