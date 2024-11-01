import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../../styles/theme';
import supabaseService from '../../services/supabaseService';

const progressAnimation = (width) => keyframes`
    from { width: 0; }
    to { width: ${width}%; }
`;

const Container = styled.div`
    background: linear-gradient(135deg, ${theme.colors.secondary} 0%, ${theme.colors.backgroundLight} 100%);
    border-radius: 8px;
    padding: 20px;
    margin-top: 20px;
`;

const Title = styled.h2`
    color: ${theme.colors.text.primary};
    text-shadow: ${theme.shadows.golden};
    margin-bottom: 20px;
    font-size: 1.8em;
    text-transform: uppercase;
    letter-spacing: 2px;
`;

const ChallengeList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 15px;
`;

const ChallengeCard = styled.div`
    background: rgba(0, 0, 0, 0.3);
    border: 2px solid ${props => props.completed ? theme.colors.success : theme.colors.border.golden};
    border-radius: 6px;
    padding: 15px;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${theme.shadows.golden};
    }

    ${props => props.completed && `
        &::after {
            content: '✓';
            position: absolute;
            top: 10px;
            right: 10px;
            color: ${theme.colors.success};
            font-size: 1.2em;
        }
    `}
`;

const ChallengeName = styled.h3`
    color: ${theme.colors.text.primary};
    margin-bottom: 5px;
    font-size: 1.2em;
`;

const ChallengeDescription = styled.p`
    color: ${theme.colors.text.secondary};
    font-size: 0.9em;
    margin-bottom: 15px;
`;

const ProgressBarContainer = styled.div`
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
    height: 20px;
    overflow: hidden;
    position: relative;
    margin: 10px 0;
`;

const ProgressBar = styled.div`
    background: linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.success});
    height: 100%;
    width: ${props => props.progress}%;
    animation: ${props => progressAnimation(props.progress)} 1s ease-out;
    transition: width 0.3s ease;
`;

const ProgressText = styled.span`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: ${theme.colors.text.light};
    font-size: 0.8em;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
`;

const Reward = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
    color: ${theme.colors.gold};
    font-weight: bold;

    &::before {
        content: '🪙';
        font-size: 1.2em;
    }
`;

const ResetTimer = styled.div`
    color: ${theme.colors.text.secondary};
    font-size: 0.8em;
    margin-top: 5px;
    font-style: italic;
`;

function ChallengesPanel({ userId }) {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadChallenges();
    }, [userId]);

    const loadChallenges = async () => {
        try {
            const data = await supabaseService.getPlayerChallenges(userId);
            setChallenges(data);
        } catch (error) {
            console.error('Chyba při načítání výzev:', error);
        } finally {
            setLoading(false);
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
        if (timeRemaining <= 0) return 'Obnoví se brzy';

        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

        return `Obnoví se za ${hours}h ${minutes}m`;
    };

    if (loading) return <div>Načítání výzev...</div>;

    return (
        <Container>
            <Title>Denní výzvy</Title>
            <ChallengeList>
                {challenges.map(challenge => {
                    const progress = (challenge.progress / challenge.challenge.condition_value) * 100;
                    const timeRemaining = calculateTimeRemaining(
                        challenge.challenge.reset_period,
                        challenge.last_reset
                    );

                    return (
                        <ChallengeCard key={challenge.challenge.id} completed={challenge.completed}>
                            <ChallengeName>{challenge.challenge.name}</ChallengeName>
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
                        </ChallengeCard>
                    );
                })}
            </ChallengeList>
        </Container>
    );
}

export default ChallengesPanel; 