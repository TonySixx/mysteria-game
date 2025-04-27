import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import supabaseService from '../../services/supabaseService';
import { theme } from '../../styles/theme';

const LeaderboardContainer = styled.div`
    max-width: 800px;
    margin: 0 auto;
    padding: 30px;
    color: ${theme.colors.text.primary};

    h2 {
        text-align: center;
        font-size: 2.5em;
        margin-bottom: 30px;
        text-transform: uppercase;
        letter-spacing: 2px;
        color: ${theme.colors.text.primary};
        text-shadow: ${theme.shadows.golden};
    }
`;

const Table = styled.table`
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    background: linear-gradient(135deg, ${theme.colors.secondary} 0%, ${theme.colors.backgroundLight} 100%);
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid transparent;
    border-image: ${theme.colors.border.golden};
    border-image-slice: 1;
`;

const Th = styled.th`
    padding: 20px 15px;
    text-align: left;
    background: rgba(255, 215, 0, 0.1);
    color: ${theme.colors.text.secondary};
    text-transform: uppercase;
    letter-spacing: 1px;
    border-bottom: 2px solid ${theme.colors.primary};
`;

const Td = styled.td`
    padding: 15px;
    border-bottom: 1px solid ${theme.colors.backgroundLight};
    color: ${theme.colors.text.light};
`;

const Tr = styled.tr`
    transition: all 0.3s;

    &:hover {
        background: rgba(255, 215, 0, 0.05);
        transform: translateX(5px);
    }
`;

const RankSpan = styled.span`
    display: inline-block;
    width: 35px;
    height: 35px;
    line-height: 35px;
    text-align: center;
    border-radius: 50%;
    background: ${props => {
        if (props.rank === 1) return 'linear-gradient(45deg, #FFD700, #FFA500)';
        if (props.rank === 2) return 'linear-gradient(45deg, #C0C0C0, #A9A9A9)';
        if (props.rank === 3) return 'linear-gradient(45deg, #CD7F32, #8B4513)';
        return 'transparent';
    }};
    color: ${props => props.rank <= 3 ? '#000' : theme.colors.text.primary};
    font-weight: bold;
    box-shadow: ${props => props.rank <= 3 ? theme.shadows.golden : 'none'};
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

function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadLeaderboard = async () => {
            try {
                const data = await supabaseService.getLeaderboard();
                setLeaderboard(data);
            } catch (error) {
                setError('Failed to load leaderboard');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadLeaderboard();
    }, []);

    if (loading) {
        return <LoadingSpinner>Loading leaderboard...</LoadingSpinner>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <LeaderboardContainer>
            <h2>Leaderboard</h2>
            <Table>
                <thead>
                    <tr>
                        <Th>Rank</Th>
                        <Th>Player</Th>
                        <Th>Points</Th>
                        <Th>Wins</Th>
                        <Th>Losses</Th>
                        <Th>Win Rate</Th>
                    </tr>
                </thead>
                <tbody>
                    {leaderboard.map((player, index) => {
                        const winRate = player.total_games > 0
                            ? ((player.wins / (player.wins + player.losses)) * 100).toFixed(1)
                            : '0.0';

                        return (
                            <Tr key={player.username}>
                                <Td>
                                    <RankSpan rank={index + 1}>
                                        {index + 1}
                                    </RankSpan>
                                </Td>
                                <Td>{player.username}</Td>
                                <Td>{player.rank}</Td>
                                <Td>{player.wins}</Td>
                                <Td>{player.losses}</Td>
                                <Td>{winRate}%</Td>
                            </Tr>
                        );
                    })}
                </tbody>
            </Table>
        </LeaderboardContainer>
    );
}

export default Leaderboard;
