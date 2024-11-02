import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../../styles/theme';

const fadeIn = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
`;

const OnlinePlayersContainer = styled.div`
    margin-top: 30px;
    background: linear-gradient(135deg, ${theme.colors.secondary} 0%, ${theme.colors.backgroundLight} 100%);
    border: 2px solid transparent;
    border-image: ${theme.colors.border.golden};
    border-image-slice: 1;
    border-radius: 8px;
    overflow: hidden;
    min-height: 300px;
    display: flex;
    flex-direction: column;
    opacity: 0;
    animation: ${fadeIn} 0.3s ease-in-out forwards;
`;

const Title = styled.h3`
    text-align: center;
    font-size: 1.5em;
    margin: 20px 0;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: ${theme.colors.text.primary};
    text-shadow: ${theme.shadows.golden};
`;

const ContentContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: ${props => props.$centered ? 'center' : 'flex-start'};
    align-items: center;
    padding: 20px;
    transition: all 0.3s ease;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    opacity: 0;
    animation: ${fadeIn} 0.3s ease-in-out forwards;
    animation-delay: 0.2s;
`;

const Th = styled.th`
    padding: 15px;
    text-align: left;
    background: rgba(255, 215, 0, 0.1);
    color: ${theme.colors.text.secondary};
    text-transform: uppercase;
    letter-spacing: 1px;
    border-bottom: 2px solid ${theme.colors.primary};
`;

const Td = styled.td`
    padding: 12px 15px;
    border-bottom: 1px solid ${theme.colors.backgroundLight};
    color: ${theme.colors.text.light};
`;

const Tr = styled.tr`
    transition: all 0.3s;

    &:hover {
        background: rgba(255, 215, 0, 0.05);
    }
`;

const StatusIndicator = styled.span`
    display: inline-flex;
    align-items: center;
    color: ${props => {
        switch (props.status) {
            case 'searching': return '#FFD700';
            case 'in_game': return '#4CAF50';
            default: return '#D4AF37';
        }
    }};

    &::before {
        content: '';
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 8px;
        background-color: ${props => {
            switch (props.status) {
                case 'searching': return '#FFD700';
                case 'in_game': return '#4CAF50';
                default: return '#D4AF37';
            }
        }};
    }
`;

const LoadingSpinner = styled.div`
    width: 40px;
    height: 40px;
    border: 3px solid ${theme.colors.backgroundLight};
    border-top: 3px solid ${theme.colors.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 15px;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    text-align: center;
    color: ${theme.colors.text.light};
    font-style: italic;
    opacity: 0.8;
`;

const NoPlayersText = styled(LoadingText)`
    color: ${theme.colors.text.secondary};
`;

const TitleContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    position: relative;
`;

const RefreshButton = styled.button`
    background: none;
    border: none;
    color: ${theme.colors.text.secondary};
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    border-radius: 50%;
    
    &:hover {
        color: ${theme.colors.text.primary};
        background: rgba(255, 215, 0, 0.1);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    svg {
        width: 20px;
        height: 20px;
        transition: transform 0.5s ease;
    }

    &.rotating svg {
        transform: rotate(360deg);
    }
`;

const RefreshIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
    </svg>
);

function OnlinePlayers({ players, onRefresh }) {
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (players && Array.isArray(players)) {
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [players]);

    const handleRefresh = async () => {
        if (isRefreshing) return;
        
        setIsRefreshing(true);
        if (onRefresh) {
            await onRefresh();
        }
        
        // Přidáme minimální dobu rotace pro lepší vizuální efekt
        setTimeout(() => {
            setIsRefreshing(false);
        }, 500);
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'searching': return 'Searching for game';
            case 'in_game': return 'In game';
            default: return 'Online';
        }
    };

    return (
        <OnlinePlayersContainer>
            <TitleContainer>
                <Title>Online Players</Title>
                <RefreshButton 
                    onClick={handleRefresh} 
                    disabled={isLoading || isRefreshing}
                    className={isRefreshing ? 'rotating' : ''}
                    title="Refresh list"
                >
                    <RefreshIcon />
                </RefreshButton>
            </TitleContainer>
            <ContentContainer $centered={isLoading || !players || players.length === 0}>
                {isLoading ? (
                    <>
                        <LoadingSpinner />
                        <LoadingText>Loading players...</LoadingText>
                    </>
                ) : !players || players.length === 0 ? (
                    <NoPlayersText>No players online</NoPlayersText>
                ) : (
                    <Table>
                        <thead>
                            <tr>
                                <Th>Player</Th>
                                <Th>Rank</Th>
                                <Th>Status</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {players.map((player) => (
                                <Tr key={player.id || player.userId}>
                                    <Td>{player.username}</Td>
                                    <Td>{player.rank || 'Unranked'}</Td>
                                    <Td>
                                        <StatusIndicator status={player.status}>
                                            {getStatusText(player.status)}
                                        </StatusIndicator>
                                    </Td>
                                </Tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </ContentContainer>
        </OnlinePlayersContainer>
    );
}

export default OnlinePlayers;
