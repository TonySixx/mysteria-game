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
    cursor: pointer;
    transition: all 0.2s;
    position: relative;

    &:hover {
        background: rgba(255, 215, 0, 0.2);
    }

    &.active {
        color: ${theme.colors.text.primary};
        background: rgba(255, 215, 0, 0.25);
    }

    .sort-icon {
        display: inline-block;
        margin-left: 8px;
        font-size: 0.8em;
    }
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
    const [sortField, setSortField] = useState('rank');
    const [sortDirection, setSortDirection] = useState('desc');

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

    const handleSort = (field) => {
        // Pokud klikneme na stejný sloupec, změníme směr řazení
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // Pro nový sloupec nastavíme výchozí směr řazení
            setSortField(field);
            // Pro většinu sloupců je výchozí směr sestupný, jen pro username použijeme vzestupný
            setSortDirection(field === 'username' ? 'asc' : 'desc');
        }
    };

    const getSortedData = () => {
        if (!leaderboard) return [];

        return [...leaderboard].sort((a, b) => {
            // Speciální logika pro řazení podle win rate
            if (sortField === 'winRate') {
                const winRateA = a.total_games > 0 ? a.wins / (a.wins + a.losses) : 0;
                const winRateB = b.total_games > 0 ? b.wins / (b.wins + b.losses) : 0;
                
                if (sortDirection === 'asc') {
                    return winRateA - winRateB;
                } else {
                    return winRateB - winRateA;
                }
            }

            // Pro ostatní sloupce
            if (typeof a[sortField] === 'string') {
                // Řazení řetězců
                const compareResult = a[sortField].localeCompare(b[sortField]);
                return sortDirection === 'asc' ? compareResult : -compareResult;
            } else {
                // Řazení čísel
                if (sortDirection === 'asc') {
                    return a[sortField] - b[sortField];
                } else {
                    return b[sortField] - a[sortField];
                }
            }
        });
    };

    // Pomocná funkce pro zobrazení ikony řazení
    const getSortIcon = (field) => {
        if (sortField !== field) return null;
        return <span className="sort-icon">{sortDirection === 'asc' ? '▲' : '▼'}</span>;
    };

    if (loading) {
        return <LoadingSpinner>Loading leaderboard...</LoadingSpinner>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    // Získání původních indexů pro rank (pořadí)
    const originalRanks = {};
    leaderboard.forEach((player, index) => {
        originalRanks[player.username] = index + 1;
    });

    const sortedData = getSortedData();

    return (
        <LeaderboardContainer>
            <h2>Leaderboard</h2>
            <Table>
                <thead>
                    <tr>
                        <Th onClick={() => handleSort('rank')} className={sortField === 'rank' ? 'active' : ''}>
                            Rank{getSortIcon('rank')}
                        </Th>
                        <Th onClick={() => handleSort('username')} className={sortField === 'username' ? 'active' : ''}>
                            Player{getSortIcon('username')}
                        </Th>
                        <Th onClick={() => handleSort('rank')} className={sortField === 'rank' ? 'active' : ''}>
                            Points{getSortIcon('rank')}
                        </Th>
                        <Th onClick={() => handleSort('wins')} className={sortField === 'wins' ? 'active' : ''}>
                            Wins{getSortIcon('wins')}
                        </Th>
                        <Th onClick={() => handleSort('losses')} className={sortField === 'losses' ? 'active' : ''}>
                            Losses{getSortIcon('losses')}
                        </Th>
                        <Th onClick={() => handleSort('winRate')} className={sortField === 'winRate' ? 'active' : ''}>
                            Win Rate{getSortIcon('winRate')}
                        </Th>
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((player) => {
                        const winRate = player.total_games > 0
                            ? ((player.wins / (player.wins + player.losses)) * 100).toFixed(1)
                            : '0.0';

                        // Použití původního indexu pro rank
                        const originalRank = originalRanks[player.username];

                        return (
                            <Tr key={player.username}>
                                <Td>
                                    <RankSpan rank={originalRank}>
                                        {originalRank}
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
