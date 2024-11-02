import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../../styles/theme';

const slideIn = keyframes`
    0% { transform: translate(-50%, -200%); opacity: 0; }
    20% { transform: translate(-50%, 0); opacity: 1; }
    100% { transform: translate(-50%, 0); opacity: 1; }
`;

const slideOut = keyframes`
    0% { transform: translate(-50%, 0); opacity: 1; }
    100% { transform: translate(-50%, -200%); opacity: 0; }
`;

const Container = styled.div`
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1001;
    animation: ${props => props.$isClosing ? slideOut : slideIn} ${props => props.$isClosing ? '0.5s' : '0.3s'} ease-in-out;
    animation-fill-mode: forwards;
    min-width: 300px;
    max-width: 500px;
    opacity: ${props => props.$isClosing ? 0 : 1};
`;

const NotificationCard = styled.div`
    background: linear-gradient(135deg, 
        ${theme.colors.background} 0%,
        ${theme.colors.secondary} 100%
    );
    border: 2px solid transparent;
    border-image: ${theme.colors.border.golden};
    border-image-slice: 1;
    border-radius: 8px;
    padding: 20px;
    color: ${theme.colors.text.primary};
    box-shadow: ${theme.shadows.intense};
    transition: transform 0.3s ease;

    &:hover {
        transform: translateY(-2px);
    }
`;

const Title = styled.h3`
    color: ${theme.colors.gold};
    font-size: 1.4em;
    margin-bottom: 15px;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 2px;
    text-shadow: ${theme.shadows.text};

    &::before {
        content: '🏆';
        margin-right: 10px;
    }
`;

const RewardItem = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 10px 0;
    padding: 10px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    
    &::before {
        content: '🪙';
        font-size: 1.2em;
    }
`;

const ChallengeItem = styled(RewardItem)`
    &::before {
        content: '✨';
    }
`;

const ProgressItem = styled(RewardItem)`
    &::before {
        content: '📈';
    }
`;

const ProgressBar = styled.div`
    width: 100%;
    height: 8px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
    margin-top: 5px;
    overflow: hidden;
`;

const Progress = styled.div`
    width: ${props => (props.$progress / props.$target) * 100}%;
    height: 100%;
    background: ${theme.colors.gold};
    transition: width 0.3s ease;
`;

function RewardNotification({ reward, onClose }) {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        let closeTimer;
        let fadeTimer;

        closeTimer = setTimeout(() => {
            setIsClosing(true);
            fadeTimer = setTimeout(onClose, 500);
        }, 5000);

        return () => {
            clearTimeout(closeTimer);
            clearTimeout(fadeTimer);
        };
    }, [onClose]);

    if (!reward) return null;

    return (
        <Container $isClosing={isClosing}>
            <NotificationCard>
                <Title>Rewards Earned!</Title>
                {reward.gold > 0 && (
                    <RewardItem>
                        {reward.gold} gold earned {reward.message ? 'for winning!' : 'from challenge!'}
                    </RewardItem>
                )}
                {reward.completedChallenges?.map((challenge, index) => (
                    <ChallengeItem key={index}>
                        {challenge.challengeName} completed! 
                        {!reward.message && `(+${challenge.reward} gold)`}
                        {reward.message && ' (Claim reward in Challenges)'}
                    </ChallengeItem>
                ))}
                {reward.challengeProgress?.map((progress, index) => (
                    <ProgressItem key={`progress-${index}`}>
                        {progress.challengeName}: {progress.currentProgress}/{progress.targetProgress}
                        <ProgressBar>
                            <Progress 
                                $progress={progress.currentProgress} 
                                $target={progress.targetProgress} 
                            />
                        </ProgressBar>
                    </ProgressItem>
                ))}
            </NotificationCard>
        </Container>
    );
}

export default RewardNotification; 