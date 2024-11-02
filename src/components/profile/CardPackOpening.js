import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import styled, { keyframes } from 'styled-components';
import { theme } from '../../styles/theme';
import cardTexture from '../../assets/images/card-texture.png';
import cardBack from '../../assets/images/card-back.png';
import { cardImages } from '../deck/DeckBuilder';
import { CARD_RARITY } from '../../constants';

const glowAnimation = (color) => keyframes`
    0% { box-shadow: 0 0 5px ${color}, 0 0 10px ${color}, 0 0 15px ${color}; }
    50% { box-shadow: 0 0 10px ${color}, 0 0 20px ${color}, 0 0 30px ${color}; }
    100% { box-shadow: 0 0 5px ${color}, 0 0 10px ${color}, 0 0 15px ${color}; }
`;

const floatAnimation = keyframes`
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
`;

const OpeningContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    position: fixed;
    inset: 0;
`;

const CardsContainer = styled.div`
    display: flex;
    gap: 60px;
    perspective: 1000px;
`;

const CardWrapper = styled.div`
    width: 204px;
    height: 284px;
    position: relative;
    transform-style: preserve-3d;
    cursor: pointer;
    transition: transform 0.6s ease-in-out;
    transform: ${props => props.isFlipped ? 'rotateY(180deg)' : 'rotateY(0)'};
    transform-origin: center center;
`;

const CardFace = styled.div`
    position: absolute;
    width: calc(100% - 34px);
    height: calc(100% - 34px);
    backface-visibility: hidden;
    border-radius: 8px;
    padding: 15px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 0;
    transform-origin: center center;
    will-change: transform;
    top: 0;
    left: 0;
`;

const CardBack = styled(CardFace)`
    background: url(${cardBack}) center/cover no-repeat;
    border: 1px solid rgba(255, 215, 0, 0.3);
    animation: 
        ${props => props.isHovered ? glowAnimation(props.glowColor) : 'none'} 1.5s infinite,
        ${props => props.isHovered ? floatAnimation : 'none'} 2s ease-in-out infinite;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    transition: transform 0.3s ease-out;
    
    &::before {
        display: none;
    }
`;

const CardFront = styled(CardFace)`
    background: ${props => `linear-gradient(45deg, #1a1a1a, ${props.bgColor}22)`};
    transform: rotateY(180deg);
    border: 2px solid ${props => props.borderColor || theme.colors.border.golden};
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: url(${cardTexture});
        background-size: 130%;
        background-position: center;
        filter: grayscale(80%);
        opacity: 0.2;
        z-index: -1;
        border-radius: 6px;
        pointer-events: none;
    }
`;

const CardImage = styled.div`
    height: 140px;
    background: url(${props => cardImages[props.$image] || ''}) center/cover;
    border-radius: 4px;
    border: 1px solid ${props => props.borderColor || theme.colors.border.golden};
    margin: 0 -5px 5px -5px;
`;

const CardStats = styled.div`
    display: flex;
    justify-content: ${props => props.type === 'unit' ? 'space-between' : 'center'};
    align-items: center;
    margin-top: auto;
`;

const StatBox = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
    color: ${theme.colors.text.primary};
    font-weight: bold;
`;

const ManaCost = styled.div`
    position: absolute;
    top: -16px;
    left: -16px;
    background: ${theme.colors.primary};
    color: ${theme.colors.background};
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.2em;
    box-shadow: ${theme.shadows.golden};
    z-index: 1;
`;

const CardName = styled.h4`
    margin: 0;
    color: ${props => props.color || theme.colors.text.primary};
    font-size: 1.1em;
    text-align: center;
    text-shadow: ${theme.shadows.golden};
`;

const CardEffect = styled.div`
    color: ${theme.colors.text.light};
    font-size: 0.9em;
    text-align: center;
    font-style: italic;
    min-height: 40px;
`;

const getRarityColors = (rarity) => {
    const rarityKey = rarity.toUpperCase();
    const rarityColor = CARD_RARITY[rarityKey]?.color;
    
    return {
        glow: rarityColor || '#FFFFFF',
        border: rarityColor || '#9D9D9D',
        bg: rarityColor ? `${rarityColor}22` : '#292929'
    };
};

const CloseButton = styled.button`
    position: fixed;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    padding: 15px 40px;
    background: linear-gradient(45deg, ${theme.colors.secondary}, ${theme.colors.backgroundLight});
    border: 2px solid transparent;
    border-image: ${theme.colors.border.golden};
    border-image-slice: 1;
    color: ${theme.colors.text.primary};
    font-size: 1.2em;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 2px;
    transition: all 0.3s;
    opacity: ${props => props.visible ? 1 : 0};
    pointer-events: ${props => props.visible ? 'auto' : 'none'};

    &:hover {
        transform: translateX(-50%) translateY(-2px);
        box-shadow: ${theme.shadows.golden};
    }
`;

function CardPackOpening({ cards, onClose }) {
    const [hoveredCard, setHoveredCard] = useState(null);
    const [flippedCards, setFlippedCards] = useState(new Set());

    const handleCardClick = (index) => {
        if (!flippedCards.has(index)) {
            const newFlippedCards = new Set(flippedCards);
            newFlippedCards.add(index);
            setFlippedCards(newFlippedCards);
        }
    };

    const areAllCardsFlipped = flippedCards.size === cards.length;

    return ReactDOM.createPortal(
        <OpeningContainer>
            <CardsContainer>
                {cards.map((card, index) => {
                    const colors = getRarityColors(card.rarity);
                    return (
                        <CardWrapper
                            key={index}
                            isFlipped={flippedCards.has(index)}
                            onClick={() => handleCardClick(index)}
                            onMouseEnter={() => setHoveredCard(index)}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            <CardBack
                                isHovered={hoveredCard === index}
                                glowColor={colors.glow}
                            />
                            <CardFront
                                bgColor={colors.bg}
                                borderColor={colors.border}
                            >
                                <ManaCost>{card.mana_cost}</ManaCost>
                                <CardImage 
                                    $image={card.image}
                                    borderColor={colors.border}
                                />
                                <CardName color={colors.border}>{card.name}</CardName>
                                <CardEffect>{card.effect}</CardEffect>
                                <CardStats type={card.type}>
                                    {card.type === 'unit' && (
                                        <>
                                            <StatBox>⚔️ {card.attack}</StatBox>
                                            <StatBox>❤️ {card.health}</StatBox>
                                        </>
                                    )}
                                </CardStats>
                            </CardFront>
                        </CardWrapper>
                    );
                })}
            </CardsContainer>
            <CloseButton 
                onClick={onClose}
                visible={areAllCardsFlipped}
            >
                Continue
            </CloseButton>
        </OpeningContainer>,
        document.body
    );
}

export default CardPackOpening; 