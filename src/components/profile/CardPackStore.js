import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import supabaseService from '../../services/supabaseService';
import { theme } from '../../styles/theme';
import basicPack from "../../assets/images/basic_pack.png";
import premiumPack from '../../assets/images/premium_pack.png';
import { motion } from 'framer-motion';

const StoreContainer = styled.div`
    padding: 20px;
    background: ${theme.colors.backgroundLight};
    border-radius: 8px;
    margin-top: 20px;
`;

const PackGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-top: 20px;
`;

const PackCard = styled(motion.div)`
    padding: 20px;
    border-radius: 12px;
    text-align: center;
    cursor: pointer;
    position: relative;
    overflow: hidden;

    ${props => {
        if (props.$type === 'premium_pack') {
            return `
                background: linear-gradient(135deg, 
                    ${theme.colors.premium.dark} 0%, 
                    ${theme.colors.premium.main} 50%,
                    ${theme.colors.premium.light} 100%
                );
                border: 3px solid ${theme.colors.premium.border};
            `;
        } else {
            return `
                background: linear-gradient(135deg, 
                    ${theme.colors.basic.dark} 0%, 
                    ${theme.colors.basic.main} 50%,
                    ${theme.colors.basic.light} 100%
                );
                border: 2px solid ${theme.colors.basic.border};
            `;
        }
    }}

    ${props => props.$disabled && `
        opacity: 0.7;
        cursor: not-allowed;
        &:hover {
            transform: none !important;
        }
    `}

    @keyframes shine {
        0% {
            left: -100%;
        }
        100% {
            left: 100%;
        }
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
            90deg,
            transparent 0%,
            ${props => props.$type === 'premium_pack' 
                ? 'rgba(100, 149, 237, 0.15)' 
                : 'rgba(192, 192, 192, 0.15)'
            } 50%,
            transparent 100%
        );
        animation: shine 1.5s infinite linear;
        transform: skewX(-20deg);
    }

    img {
        width: 160px;
        height: 224px;
        object-fit: cover;
        border-radius: 8px;
        margin-bottom: 15px;
        transition: transform 0.3s ease;
    }
`;

const PackTitle = styled.h3`
    font-size: 1.5em;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: ${props => props.$type === 'premium_pack' 
        ? theme.colors.premium.text 
        : theme.colors.basic.text
    };
    text-shadow: ${props => props.$type === 'premium_pack'
        ? '0 0 10px rgba(100, 149, 237, 0.5)'
        : '0 0 5px rgba(192, 192, 192, 0.3)'
    };
`;

const PackDescription = styled.p`
    color: ${props => props.$type === 'premium_pack'
        ? theme.colors.premium.description
        : theme.colors.basic.description
    };
    margin-bottom: 15px;
    font-size: 1em;
`;

const PriceTag = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: ${props => props.$type === 'premium_pack'
        ? `linear-gradient(45deg, ${theme.colors.premium.price}, ${theme.colors.premium.priceHover})`
        : `linear-gradient(45deg, ${theme.colors.basic.price}, ${theme.colors.basic.priceHover})`
    };
    border-radius: 20px;
    font-weight: bold;
    font-size: 1.1em;
    color: ${props => props.$type === 'premium_pack'
        ? theme.colors.premium.priceText
        : theme.colors.basic.priceText
    };
    
    &::before {
        content: '🪙';
        font-size: 1.2em;
    }
`;

const ErrorMessage = styled(motion.div)`
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${theme.colors.accent};
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    z-index: 1000;
`;

function CardPackStore({ onPurchase, userId, playerGold }) {
    const [packs, setPacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadCardPacks();
    }, []);

    const loadCardPacks = async () => {
        try {
            const data = await supabaseService.getCardPacks();
            setPacks(data);
        } catch (error) {
            console.error('Chyba při načítání balíčků:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async (pack) => {
        if (playerGold < pack.price) {
            setError("Not enough gold to purchase this pack!");
            setTimeout(() => setError(null), 3000);
            return;
        }

        try {
            await onPurchase(pack.id);
        } catch (error) {
            console.error('Error purchasing pack:', error);
            setError("Failed to purchase pack. Please try again.");
            setTimeout(() => setError(null), 3000);
        }
    };

    const packImage = {
        basic_pack: basicPack,
        premium_pack: premiumPack
    }

    if (loading) return <div>Načítání...</div>;

    return (
        <StoreContainer>
            <h2>Card Pack Store</h2>
            <PackGrid>
                {packs.map(pack => (
                    <PackCard
                        key={pack.id}
                        onClick={() => handlePurchase(pack)}
                        $disabled={playerGold < pack.price}
                        $type={pack.image}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <motion.img 
                            src={packImage[pack.image]} 
                            alt={pack.name}
                            whileHover={{ transform: 'rotate(5deg)' }}
                        />
                        <PackTitle $type={pack.image}>{pack.name}</PackTitle>
                        <PackDescription $type={pack.image}>{pack.description}</PackDescription>
                        <PriceTag $type={pack.image}>{pack.price}</PriceTag>
                    </PackCard>
                ))}
            </PackGrid>

            {error && (
                <ErrorMessage
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                >
                    {error}
                </ErrorMessage>
            )}
        </StoreContainer>
    );
}

export default CardPackStore; 