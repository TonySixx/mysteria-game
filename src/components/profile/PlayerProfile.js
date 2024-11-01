import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import supabaseService from '../../services/supabaseService';
import { theme } from '../../styles/theme';
import { FaChevronDown, FaUser, FaTrophy, FaStore } from 'react-icons/fa';
import CardPackStore from './CardPackStore';
import CardPackOpening from './CardPackOpening';
import ChallengesPanel from './ChallengesPanel';
import RewardPopup from '../rewards/RewardPopup';
import socketService from '../../services/socketService';

const ProfileContainer = styled.div`
    max-width: 800px;
    margin: 0 auto;
    padding: 30px;
    color: ${theme.colors.text.primary};
    position: relative;

    h1 {
        text-align: center;
        font-size: 2.5em;
        margin-bottom: 30px;
        text-transform: uppercase;
        letter-spacing: 2px;
        color: ${theme.colors.text.primary};
        text-shadow: ${theme.shadows.golden};
    }

    h2 {
        font-size: 2em;
        margin: 40px 0 20px;
        text-transform: uppercase;
        letter-spacing: 2px;
        color: ${theme.colors.text.primary};
        text-shadow: ${theme.shadows.golden};
    }
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin: 20px 0;
`;

const StatCard = styled.div`
    background: linear-gradient(135deg, ${theme.colors.secondary} 0%, ${theme.colors.backgroundLight} 100%);
    padding: 25px;
    border-radius: 8px;
    text-align: center;
    border: 2px solid transparent;
    border-image: ${theme.colors.border.golden};
    border-image-slice: 1;
    transition: all 0.3s;

    &:hover {
        transform: translateY(-5px);
        box-shadow: ${theme.shadows.golden};
    }

    h3 {
        color: ${theme.colors.text.secondary};
        font-size: 1.2em;
        margin-bottom: 15px;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    div {
        font-size: 2em;
        color: ${theme.colors.text.primary};
        text-shadow: ${theme.shadows.golden};
    }
`;

const GameHistoryTable = styled.table`
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin-top: 20px;
    background: linear-gradient(135deg, ${theme.colors.secondary} 0%, ${theme.colors.backgroundLight} 100%);
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid transparent;
    border-image: ${theme.colors.border.golden};
    border-image-slice: 1;

    th, td {
        padding: 15px;
        text-align: left;
        border-bottom: 1px solid ${theme.colors.backgroundLight};
    }

    th {
        background: rgba(255, 215, 0, 0.1);
        color: ${theme.colors.text.secondary};
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    tr:hover td {
        background: rgba(255, 215, 0, 0.05);
    }

    td {
        color: ${theme.colors.text.light};
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

const LoadMoreButton = styled.button`
    width: 100%;
    padding: 15px;
    margin-top: 20px;
    background: linear-gradient(135deg, ${theme.colors.secondary} 0%, ${theme.colors.backgroundLight} 100%);
    border: 2px solid transparent;
    border-image: ${theme.colors.border.golden};
    border-image-slice: 1;
    border-radius: 8px;
    color: ${theme.colors.text.primary};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${theme.shadows.golden};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }

    svg {
        transition: transform 0.3s ease;
        position: relative;
        top: 1px;
    }

    &:hover svg {
        animation: bounceDown 1s infinite;
    }

    @keyframes bounceDown {
        0%, 100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(4px);
        }
    }
`;

const LoadingIndicator = styled.div`
    text-align: center;
    padding: 10px;
    color: ${theme.colors.text.secondary};
`;

const GoldDisplay = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 15px;
    background: linear-gradient(135deg, ${theme.colors.secondary} 0%, ${theme.colors.backgroundLight} 100%);
    border-radius: 8px;
    margin-bottom: 20px;
    border: 2px solid ${theme.colors.border.golden};

    span {
        color: ${theme.colors.gold};
        font-size: 1.2em;
        font-weight: bold;
    }
`;

const ProfileTabs = styled.div`
    display: flex;
    gap: 10px;
    margin-bottom: 30px;
    justify-content: center;
`;

const ProfileTab = styled.button`
    padding: 15px 30px;
    background: ${props => props.$active ? theme.colors.backgroundLight : 'transparent'};
    border: 2px solid transparent;
    border-image: ${props => props.$active ? theme.colors.border.golden : 'none'};
    border-image-slice: ${props => props.$active ? 1 : 'none'};
    color: ${props => props.$active ? theme.colors.text.primary : theme.colors.text.secondary};
    cursor: pointer;
    transition: all 0.3s;
    font-size: 1.1em;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    display: flex;
    align-items: center;
    gap: 10px;

    &:hover {
        color: ${theme.colors.text.primary};
        box-shadow: ${theme.shadows.golden};
        transform: translateY(-2px);
    }

    svg {
        font-size: 1.2em;
    }
`;

function PlayerProfile({ userId }) {
    const [profile, setProfile] = useState(null);
    const [gameHistory, setGameHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [showPackOpening, setShowPackOpening] = useState(false);
    const [openedCards, setOpenedCards] = useState([]);
    const [playerGold, setPlayerGold] = useState(0);
    const [showReward, setShowReward] = useState(false);
    const [currentReward, setCurrentReward] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');

    useEffect(() => {
        const loadProfileData = async () => {
            try {
                const profileData = await supabaseService.getProfile(userId);
                const historyData = await supabaseService.getGameHistory(userId, 0);
                
                setProfile(profileData);
                setGameHistory(historyData.data);
                setHasMore(historyData.hasMore);
            } catch (error) {
                setError('Failed to load profile data');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadProfileData();
        loadPlayerCurrency();
        
        // Přidáme socket listener pro odměny
        socketService.socket.on('rewardEarned', handleRewardEarned);
        
        return () => {
            socketService.socket.off('rewardEarned', handleRewardEarned);
        };
    }, [userId]);

    const loadPlayerCurrency = async () => {
        try {
            const currency = await supabaseService.getPlayerCurrency(userId);
            setPlayerGold(currency.gold_amount);
        } catch (error) {
            console.error('Error loading currency:', error);
        }
    };

    const handleRewardEarned = (reward) => {
        setCurrentReward(reward);
        setShowReward(true);
        loadPlayerCurrency(); // Aktualizujeme zobrazení zlata
    };

    const handlePackPurchase = async (packId) => {
        try {
            const cards = await supabaseService.purchaseCardPack(userId, packId);
            
            // Ověříme, že cards je pole nebo ho převedeme na pole
            const cardsArray = Array.isArray(cards) ? cards : JSON.parse(cards);
            
            if (cardsArray && cardsArray.length > 0) {
                setOpenedCards(cardsArray);
                setShowPackOpening(true);
                await loadPlayerCurrency(); // Aktualizujeme zobrazení zlata po nákupu
            } else {
                throw new Error('Nepodařilo se získat karty z balíčku');
            }
        } catch (error) {
            console.error('Error purchasing pack:', error);
            // Zde můžete přidat notifikaci o chybě
        }
    };

    const handleLoadMore = async () => {
        if (loadingMore || !hasMore) return;

        try {
            setLoadingMore(true);
            const nextPage = page + 1;
            const historyData = await supabaseService.getGameHistory(userId, nextPage);
            
            setGameHistory(prev => [...prev, ...historyData.data]);
            setHasMore(historyData.hasMore);
            setPage(nextPage);
        } catch (error) {
            console.error('Failed to load more history:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    if (loading) {
        return <LoadingSpinner>Loading...</LoadingSpinner>;
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
            
            <ProfileTabs>
                <ProfileTab 
                    $active={activeTab === 'dashboard'} 
                    onClick={() => setActiveTab('dashboard')}
                >
                    <FaUser /> Dashboard
                </ProfileTab>
                <ProfileTab 
                    $active={activeTab === 'challenges'} 
                    onClick={() => setActiveTab('challenges')}
                >
                    <FaTrophy /> Challenges
                </ProfileTab>
                <ProfileTab 
                    $active={activeTab === 'store'} 
                    onClick={() => setActiveTab('store')}
                >
                    <FaStore /> Store
                </ProfileTab>
            </ProfileTabs>

            {activeTab === 'dashboard' && (
                <>
                    <GoldDisplay>
                        🪙 <span>{playerGold}</span> Gold
                    </GoldDisplay>
                    <StatsGrid>
                        <StatCard>
                            <h3>Rank</h3>
                            <div>{profile.rank}</div>
                        </StatCard>
                        <StatCard>
                            <h3>Total Games</h3>
                            <div>{profile.total_games}</div>
                        </StatCard>
                        <StatCard>
                            <h3>Wins</h3>
                            <div>{profile.wins}</div>
                        </StatCard>
                        <StatCard>
                            <h3>Losses</h3>
                            <div>{profile.losses}</div>
                        </StatCard>
                        <StatCard>
                            <h3>Win Rate</h3>
                            <div>{winRate}%</div>
                        </StatCard>
                    </StatsGrid>
                    <h2>Game History</h2>
                    <GameHistoryTable>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Opponent</th>
                                <th>Result</th>
                                <th>Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gameHistory.map((game) => {
                                const isPlayer1 = game.player_id === userId;
                                const opponentUsername = isPlayer1 ? game.opponent.username : game.player.username;
                                
                                const isWinner = game.winner_id === userId;

                                return (
                                    <tr key={game.id}>
                                        <td>{new Date(game.created_at).toLocaleDateString()}</td>
                                        <td>{opponentUsername}</td>
                                        <td>{isWinner ? 'Victory' : 'Defeat'}</td>
                                        <td>{game.game_duration}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </GameHistoryTable>
                </>
            )}

            {activeTab === 'challenges' && (
                <ChallengesPanel userId={userId} />
            )}

            {activeTab === 'store' && (
                <>
                    <GoldDisplay>
                        🪙 <span>{playerGold}</span> Gold
                    </GoldDisplay>
                    <CardPackStore 
                        onPurchase={handlePackPurchase} 
                        userId={userId}
                        playerGold={playerGold}
                    />
                </>
            )}

            {showPackOpening && (
                <CardPackOpening
                    cards={openedCards}
                    onClose={() => {
                        setShowPackOpening(false);
                        setOpenedCards([]);
                    }}
                />
            )}

            {showReward && (
                <RewardPopup
                    rewards={currentReward}
                    onClose={() => setShowReward(false)}
                />
            )}
        </ProfileContainer>
    );
}

export default PlayerProfile;
