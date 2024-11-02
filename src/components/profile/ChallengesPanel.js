import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../../styles/theme';
import supabaseService from '../../services/supabaseService';
import RewardNotification from '../rewards/RewardNotification';

const progressAnimation = (width) => keyframes`
    from { width: 0; }
    to { width: ${width}%; }
`;

const Container = styled.div`
    background: linear-gradient(135deg, ${theme.colors.secondary} 0%, ${theme.colors.backgroundLight} 100%);
    border: 2px solid transparent;
    border-image: ${theme.colors.border.golden};
    border-image-slice: 1;
    border-radius: 8px;
    padding: 20px;
    margin-top: 20px;
    box-shadow: ${theme.shadows.golden};
`;

const Title = styled.h2`
    color: ${theme.colors.text.primary};
    text-shadow: ${theme.shadows.text};
    margin-bottom: 20px;
    font-size: 1.8em;
    text-transform: uppercase;
    letter-spacing: 2px;
    text-align: center;
    position: relative;
    
    &::after {
        content: '';
        position: absolute;
        bottom: -10px;
        left: 50%;
        transform: translateX(-50%);
        width: 100px;
        height: 2px;
        background: ${theme.colors.border.golden};
    }
`;

const ChallengeList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 15px;
`;

const ChallengeCard = styled.div`
    background: linear-gradient(135deg, 
        ${theme.colors.background} 0%,
        ${theme.colors.secondary} 100%
    );
    border: 2px solid ${props => props.completed ? theme.colors.success : 'transparent'};
    border-image: ${props => props.completed ? 'none' : theme.colors.border.golden};
    border-image-slice: ${props => props.completed ? 'none' : 1};
    border-radius: 6px;
    padding: 20px;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${theme.shadows.intense};
        background: linear-gradient(135deg, 
            ${theme.colors.background} 0%,
            ${theme.colors.secondary} 70%,
            ${theme.colors.backgroundLight} 100%
        );
    }

    ${props => props.completed && `
        &::after {
            content: '✓';
            position: absolute;
            top: 10px;
            right: 10px;
            color: ${theme.colors.success};
            font-size: 1.2em;
            text-shadow: ${theme.shadows.text};
        }
    `}

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 215, 0, 0.2),
            transparent
        );
    }
`;

const ChallengeName = styled.h3`
    color: ${theme.colors.text.primary};
    margin-bottom: 10px;
    font-size: 1.3em;
    text-transform: uppercase;
    letter-spacing: 1px;
    text-shadow: ${theme.shadows.text};
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const ChallengeDescription = styled.p`
    color: ${theme.colors.text.secondary};
    font-size: 0.9em;
    margin-bottom: 15px;
`;

const ProgressBarContainer = styled.div`
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid ${theme.colors.border.golden};
    border-radius: 4px;
    height: 24px;
    overflow: hidden;
    position: relative;
    margin: 15px 0;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const ProgressBar = styled.div`
    background: linear-gradient(90deg, 
        ${theme.colors.primary} 0%, 
        ${theme.colors.success} 100%
    );
    height: 100%;
    width: ${props => props.progress}%;
    animation: ${props => progressAnimation(props.progress)} 1.5s ease-out;
    transition: width 0.3s ease;
    box-shadow: 2px 0 4px rgba(0, 0, 0, 0.2);
`;

const ProgressText = styled.span`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: ${theme.colors.text.light};
    font-size: 0.9em;
    font-weight: bold;
    text-shadow: ${theme.shadows.text};
    letter-spacing: 1px;
`;

const Reward = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    color: ${theme.colors.gold};
    font-weight: bold;
    font-size: 1.1em;
    text-shadow: ${theme.shadows.text};
    margin-top: 10px;

    &::before {
        content: '🪙';
        font-size: 1.3em;
        filter: drop-shadow(${theme.shadows.text});
    }
`;

const ResetTimer = styled.div`
    color: ${theme.colors.text.secondary};
    font-size: 0.9em;
    margin-top: 10px;
    font-style: italic;
    text-align: right;
    text-shadow: ${theme.shadows.text};
`;

const AcceptButton = styled.button`
    background: linear-gradient(135deg, ${theme.colors.secondary} 0%, ${theme.colors.backgroundLight} 100%);
    border: 2px solid transparent;
    border-image: ${theme.colors.border.golden};
    border-image-slice: 1;
    border-radius: 8px;
    padding: 12px 24px;
    color: ${theme.colors.text.primary};
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 15px;
    text-transform: uppercase;
    letter-spacing: 2px;
    width: 100%;
    text-shadow: ${theme.shadows.text};
    position: relative;
    overflow: hidden;

    &:before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 215, 0, 0.2),
            transparent
        );
        transition: 0.5s;
    }

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${theme.shadows.golden};
        
        &:before {
            left: 100%;
        }
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }

    &:active {
        transform: translateY(1px);
    }
`;

const ClaimButton = styled(AcceptButton)`
    background: linear-gradient(135deg, 
        ${theme.colors.success} 0%, 
        ${theme.colors.primary} 100%
    );
    color: ${theme.colors.background};
    font-weight: bold;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    border: 1px solid ${theme.colors.success};
    
    &:hover {
        background: linear-gradient(135deg, 
            ${theme.colors.success} 20%, 
            ${theme.colors.primary} 120%
        );
        color: ${theme.colors.background};
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
    }

    &:active {
        background: linear-gradient(135deg, 
            ${theme.colors.primary} 0%, 
            ${theme.colors.success} 100%
        );
    }
`;

const ChallengeTypeTag = styled.div`
    background: ${props => {
        switch (props.type) {
            case 'daily':
                return `linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%)`;
            case 'weekly':
                return `linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(76, 175, 80, 0.1) 100%)`;
            default:
                return `linear-gradient(135deg, rgba(44, 24, 16, 0.4) 0%, rgba(56, 34, 25, 0.4) 100%)`;
        }
    }};
    border: 1px solid ${props => {
        switch (props.type) {
            case 'daily':
                return theme.colors.gold;
            case 'weekly':
                return theme.colors.success;
            default:
                return theme.colors.border.golden;
        }
    }};
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 0.75em;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: ${theme.colors.text.primary};
    text-shadow: ${theme.shadows.text};
    display: flex;
    align-items: center;
    gap: 5px;

    &:before {
        content: ${props => {
            switch (props.type) {
                case 'daily':
                    return "'⌛'";
                case 'weekly':
                    return "'📅'";
                default:
                    return "'🏆'";
            }
        }};
        font-size: 1.2em;
    }
`;

const EmptyState = styled.div`
    background: linear-gradient(135deg, 
        ${theme.colors.background} 0%,
        ${theme.colors.secondary} 100%
    );
    border: 2px solid transparent;
    border-image: ${theme.colors.border.golden};
    border-image-slice: 1;
    border-radius: 6px;
    padding: 30px;
    text-align: center;
    color: ${theme.colors.text.secondary};
    font-size: 1.1em;
    margin: 20px 0;
    text-shadow: ${theme.shadows.text};

    &::before {
        content: '🏆';
        display: block;
        font-size: 2em;
        margin-bottom: 10px;
    }
`;

const LoadingSpinner = styled.div`
    text-align: center;
    padding: 20px;
    color: ${theme.colors.text.primary};
    font-size: 1.2em;
    text-transform: uppercase;
    letter-spacing: 2px;
    animation: pulse 1.5s infinite;

    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
    }
`;

// Přidáme pomocnou funkci pro řazení výzev
const sortChallenges = (challenges) => {
    const priorityOrder = {
        'unlimited': 0,
        'daily': 1,
        'weekly': 2
    };

    return [...challenges].sort((a, b) => {
        const challengeA = a.challenge || a;
        const challengeB = b.challenge || b;
        
        const resetPeriodA = challengeA.reset_period || 'unlimited';
        const resetPeriodB = challengeB.reset_period || 'unlimited';
        
        return priorityOrder[resetPeriodA] - priorityOrder[resetPeriodB];
    });
};

function ChallengesPanel({ userId, onGoldUpdate }) {
    const [challenges, setChallenges] = useState([]);
    const [availableChallenges, setAvailableChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reward, setReward] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadChallenges();
        loadAvailableChallenges();
    }, [userId]);

    const loadChallenges = async () => {
        try {
            const data = await supabaseService.getPlayerChallenges(userId);
            setChallenges(sortChallenges(data));
        } catch (error) {
            console.error('Error loading challenges:', error);
        }
    };

    const loadAvailableChallenges = async () => {
        try {
            const data = await supabaseService.getAvailableChallenges();
            setAvailableChallenges(sortChallenges(data));
        } catch (error) {
            console.error('Error loading available challenges:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptChallenge = async (challengeId) => {
        if (actionLoading) return;

        try {
            setActionLoading(true);
            await supabaseService.acceptChallenge(userId, challengeId);
            await loadChallenges();
            await loadAvailableChallenges();
        } catch (error) {
            console.error('Error accepting challenge:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const calculateTimeRemaining = (resetPeriod, lastReset) => {
        if (!resetPeriod) return null;

        const now = new Date();
        const lastResetDate = new Date(lastReset);
        let nextReset;

        if (resetPeriod === 'daily') {
            nextReset = new Date(lastResetDate.setDate(lastResetDate.getDate() + 1));
        } else if (resetPeriod === 'weekly') {
            nextReset = new Date(lastResetDate.setDate(lastResetDate.getDate() + 7));
        }

        const timeRemaining = nextReset - now;
        if (timeRemaining <= 0) return 'Resets soon';

        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

        return `Resets in ${hours}h ${minutes}m`;
    };

    const handleClaimReward = async (challengeId, rewardGold) => {
        if (actionLoading) return;

        try {
            setActionLoading(true);
            await supabaseService.claimChallengeReward(userId, challengeId);
            await loadChallenges();
            await loadAvailableChallenges();
            if (onGoldUpdate) {
                onGoldUpdate();
            }
            setReward({
                gold: rewardGold,
                completedChallenges: [{
                    challengeName: challenges.find(c => c.challenge.id === challengeId)?.challenge.name,
                    reward: rewardGold
                }]
            });
        } catch (error) {
            console.error('Error claiming reward:', error);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <LoadingSpinner>Loading challenges...</LoadingSpinner>;

    return (
        <Container>
            {reward && (
                <RewardNotification 
                    reward={reward} 
                    onClose={() => setReward(null)}
                />
            )}
            <Title>Active Challenges</Title>
            <ChallengeList>
                {challenges.length > 0 ? (
                    challenges.map(challenge => {
                        const progress = (challenge.progress / challenge.challenge.condition_value) * 100;
                        const timeRemaining = calculateTimeRemaining(
                            challenge.challenge.reset_period,
                            challenge.last_reset
                        );

                        return (
                            <ChallengeCard key={challenge.challenge.id} completed={challenge.completed}>
                                <ChallengeName>
                                    {challenge.challenge.name}
                                    <ChallengeTypeTag type={challenge.challenge.reset_period}>
                                        {challenge.challenge.reset_period || 'Unlimited'}
                                    </ChallengeTypeTag>
                                </ChallengeName>
                                <ChallengeDescription>
                                    {challenge.challenge.description}
                                </ChallengeDescription>
                                <ProgressBarContainer>
                                    <ProgressBar progress={progress} />
                                    <ProgressText>
                                        {challenge.progress} / {challenge.challenge.condition_value}
                                    </ProgressText>
                                </ProgressBarContainer>
                                <Reward>{challenge.challenge.reward_gold}</Reward>
                                {timeRemaining && (
                                    <ResetTimer>{timeRemaining}</ResetTimer>
                                )}
                                {challenge.completed && !challenge.reward_claimed && (
                                    <ClaimButton 
                                        onClick={() => handleClaimReward(
                                            challenge.challenge.id,
                                            challenge.challenge.reward_gold
                                        )}
                                        disabled={actionLoading}
                                    >
                                        Claim Reward
                                    </ClaimButton>
                                )}
                            </ChallengeCard>
                        );
                    })
                ) : (
                    <EmptyState>
                        No active challenges. Accept new challenges to earn rewards!
                    </EmptyState>
                )}
            </ChallengeList>

            <Title style={{ marginTop: '30px' }}>Available Challenges</Title>
            <ChallengeList>
                {availableChallenges.length > 0 ? (
                    availableChallenges.map(challenge => (
                        <ChallengeCard key={challenge.id}>
                            <ChallengeName>
                                {challenge.name}
                                <ChallengeTypeTag type={challenge.reset_period}>
                                    {challenge.reset_period || 'Unlimited'}
                                </ChallengeTypeTag>
                            </ChallengeName>
                            <ChallengeDescription>
                                {challenge.description}
                            </ChallengeDescription>
                            <Reward>{challenge.reward_gold}</Reward>
                            <AcceptButton 
                                onClick={() => handleAcceptChallenge(challenge.id)}
                                disabled={actionLoading}
                            >
                                Accept Challenge
                            </AcceptButton>
                        </ChallengeCard>
                    ))
                ) : (
                    <EmptyState>
                        No available challenges at the moment. Check back later!
                    </EmptyState>
                )}
            </ChallengeList>
        </Container>
    );
}

export default ChallengesPanel; 