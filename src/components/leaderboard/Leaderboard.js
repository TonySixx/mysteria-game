import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import supabaseService from '../../services/supabaseService';

const LeaderboardContainer = styled.div`
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    color: white;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    background: rgba(0, 0, 0, 0.8);
    border-radius: 8px;
    overflow: hidden;
`;

const Th = styled.th`
    padding: 15px;
    text-align: left;
    background: rgba(74, 144, 226, 0.1);
    border-bottom: 2px solid #4a90e2;
`;

const Td = styled.td`
    padding: 12px 15px;
    border-bottom: 1px solid #444;
`;

const Tr = styled.tr`
    &:hover {
        background: rgba(74, 144, 226, 0.05);
    }
`;

const RankSpan = styled.span`
    display: inline-block;
    width: 30px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    border-radius: 50%;
    background: ${props => {
        if (props.rank === 1) return '#ffd700';
        if (props.rank === 2) return '#c0c0c0';
        if (props.rank === 3) return '#cd7f32';
        return 'transparent';
    }};
    color: ${props => props.rank <= 3 ? '#000' : 'inherit'};
`;

const LoadingSpinner = styled.div`
    text-align: center;
    padding: 20px;
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
                setError('Nepodařilo se načíst žebříček');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadLeaderboard();
    }, []);

    if (loading) {
        return <LoadingSpinner>Načítám žebříček...</LoadingSpinner>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <LeaderboardContainer>
            <h2>Žebříček hráčů</h2>
            <Table>
                <thead>
                    <tr>
                        <Th>Pořadí</Th>
                        <Th>Hráč</Th>
                        <Th>Body</Th>
                        <Th>Výhry</Th>
                        <Th>Prohry</Th>
                        <Th>Úspěšnost</Th>
                    </tr>
                </thead>
                <tbody>
                    {leaderboard.map((player, index) => {
                        console.log('Player:', player);
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
