import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../../styles/theme';

const coinSpin = keyframes`
    0% { transform: rotateY(0deg); }
    100% { transform: rotateY(360deg); }
`;

const glowPulse = keyframes`
    0% { box-shadow: 0 0 10px ${theme.colors.gold}, 0 0 20px ${theme.colors.gold}; }
    50% { box-shadow: 0 0 20px ${theme.colors.gold}, 0 0 40px ${theme.colors.gold}; }
    100% { box-shadow: 0 0 10px ${theme.colors.gold}, 0 0 20px ${theme.colors.gold}; }
`;

const PopupContainer = styled(motion.div)`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, ${theme.colors.secondary} 0%, ${theme.colors.backgroundLight} 100%);
    padding: 30px;
    border-radius: 15px;
    border: 3px solid ${theme.colors.border.golden};
    z-index: 1100;
    min-width: 300px;
    text-align: center;
    animation: ${glowPulse} 2s infinite;
`;

const Overlay = styled(motion.div)`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    z-index: 1000;
`;

const Title = styled.h2`
    color: ${theme.colors.text.primary};
    text-shadow: ${theme.shadows.golden};
    margin-bottom: 20px;
    font-size: 1.8em;
`;

const GoldReward = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin: 20px 0;
    font-size: 1.5em;
    color: ${theme.colors.gold};
`;

const CoinIcon = styled.div`
    width: 40px;
    height: 40px;
    background: ${theme.colors.gold};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: ${coinSpin} 2s infinite linear;
    font-size: 1.2em;
`;

const ChallengesList = styled.div`
    margin: 20px 0;
`;

const ChallengeItem = styled(motion.div)`
    background: rgba(0, 0, 0, 0.3);
    padding: 15px;
    margin: 10px 0;
    border-radius: 8px;
    border: 1px solid ${theme.colors.border.golden};

    h3 {
        color: ${theme.colors.text.primary};
        margin-bottom: 5px;
    }

    p {
        color: ${theme.colors.text.secondary};
        font-size: 0.9em;
    }
`;

const CloseButton = styled(motion.button)`
    background: linear-gradient(45deg, ${theme.colors.primary}, ${theme.colors.secondary});
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    color: ${theme.colors.text.primary};
    cursor: pointer;
    font-size: 1.1em;
    margin-top: 20px;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${theme.shadows.golden};
    }
`;

function RewardPopup({ rewards, onClose }) {
    const [showCoin, setShowCoin] = useState(false);

    useEffect(() => {
        setShowCoin(true);
    }, []);

    return (
        <AnimatePresence>
            <Overlay
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <PopupContainer
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: "spring", damping: 15 }}
                >
                    <Title>Získané odměny!</Title>
                    
                    <GoldReward>
                        <CoinIcon>🪙</CoinIcon>
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            +{rewards.gold}
                        </motion.span>
                    </GoldReward>

                    {rewards.challenges && rewards.challenges.length > 0 && (
                        <ChallengesList>
                            <h3>Splněné výzvy:</h3>
                            {rewards.challenges.map((challenge, index) => (
                                <ChallengeItem
                                    key={challenge.id}
                                    initial={{ x: -100, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 + index * 0.2 }}
                                >
                                    <h3>{challenge.name}</h3>
                                    <p>{challenge.description}</p>
                                    <GoldReward>
                                        <CoinIcon>🪙</CoinIcon>
                                        +{challenge.reward_gold}
                                    </GoldReward>
                                </ChallengeItem>
                            ))}
                        </ChallengesList>
                    )}

                    <CloseButton
                        onClick={onClose}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Zavřít
                    </CloseButton>
                </PopupContainer>
            </Overlay>
        </AnimatePresence>
    );
}

export default RewardPopup; 