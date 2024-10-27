import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import supabaseService from '../../services/supabaseService';

const ProfileContainer = styled.div`
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    color: white;
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin: 20px 0;
`;

const StatCard = styled.div`
    background: rgba(0, 0, 0, 0.8);
    padding: 20px;
    border-radius: 8px;
    text-align: center;
`;

const GameHistoryTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
    background: rgba(0, 0, 0, 0.8);
    border-radius: 8px;

    th, td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #444;
    }

    th {
        background: rgba(74, 144, 226, 0.1);
    }
`;

const LoadingSpinner = styled.div`
    text-align: center;
    padding: 20px;
`;

function PlayerProfile({ userId }) {
    const [profile, setProfile] = useState(null);
    const [gameHistory, setGameHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadProfileData = async () => {
            try {
                const profileData = await supabaseService.getProfile(userId);
                const historyData = await supabaseService.getGameHistory(userId);
                
                setProfile(profileData);
                setGameHistory(historyData);
            } catch (error) {
                setError('Nepodařilo se načíst data profilu');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadProfileData();
    }, [userId]);

    if (loading) {
        return <LoadingSpinner>Načítám...</LoadingSpinner>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    const winRate = profile.total_games > 0 
        ? ((profile.wins / profile.total_games) * 100).toFixed(1) 
        : 0;

    return (
        <ProfileContainer>
            <h1>{profile.username}</h1>
            
            <StatsGrid>
                <StatCard>
                    <h3>Rank</h3>
                    <div>{profile.rank}</div>
                </StatCard>
                <StatCard>
                    <h3>Celkem her</h3>
                    <div>{profile.total_games}</div>
                </StatCard>
                <StatCard>
                    <h3>Výhry</h3>
                    <div>{profile.wins}</div>
                </StatCard>
                <StatCard>
                    <h3>Prohry</h3>
                    <div>{profile.losses}</div>
                </StatCard>
                <StatCard>
                    <h3>Úspěšnost</h3>
                    <div>{winRate}%</div>
                </StatCard>
            </StatsGrid>

            <h2>Historie her</h2>
            <GameHistoryTable>
                <thead>
                    <tr>
                        <th>Datum</th>
                        <th>Protihráč</th>
                        <th>Výsledek</th>
                        <th>Délka hry</th>
                    </tr>
                </thead>
                <tbody>
                    {gameHistory.map((game) => (
                        <tr key={game.id}>
                            <td>{new Date(game.created_at).toLocaleDateString()}</td>
                            <td>{game.opponent.username}</td>
                            <td>{game.winner_id === userId ? 'Výhra' : 'Prohra'}</td>
                            <td>{Math.floor(game.game_duration / 1000 / 60)} min</td>
                        </tr>
                    ))}
                </tbody>
            </GameHistoryTable>
        </ProfileContainer>
    );
}

export default PlayerProfile;
