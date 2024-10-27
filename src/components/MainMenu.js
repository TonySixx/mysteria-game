import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';
import PlayerProfile from './profile/PlayerProfile';
import Leaderboard from './leaderboard/Leaderboard';
import socketService from '../services/socketService';

const MenuContainer = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    color: white;
`;

const TabContainer = styled.div`
    display: flex;
    margin-bottom: 20px;
`;

const Tab = styled.button`
    padding: 10px 20px;
    margin: 0 5px;
    background: ${props => props.$active ? 'rgba(74, 144, 226, 0.2)' : 'transparent'};
    border: none;
    border-bottom: 2px solid ${props => props.$active ? '#4a90e2' : 'transparent'};
    color: white;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
        background: rgba(74, 144, 226, 0.1);
    }
`;

const PlayButton = styled.button`
    width: 200px;
    padding: 15px;
    background: #4CAF50;
    border: none;
    border-radius: 4px;
    color: white;
    font-size: 1.2em;
    cursor: pointer;
    margin: 20px 0;
    transition: background 0.3s;

    &:hover {
        background: #45a049;
    }

    &:disabled {
        background: #666;
        cursor: not-allowed;
    }
`;

const LoadingText = styled.div`
    font-size: 1.2em;
    color: white;
    text-align: center;
    margin: 20px 0;
`;

const CancelButton = styled.button`
    width: 200px;
    padding: 15px;
    background: #e74c3c;
    border: none;
    border-radius: 4px;
    color: white;
    font-size: 1.2em;
    cursor: pointer;
    margin: 20px 0;
    transition: background 0.3s;

    &:hover {
        background: #c0392b;
    }
`;

function MainMenu({ user, onGameStart, onLogin, onLogout }) {
    const [activeTab, setActiveTab] = useState(user ? 'play' : 'login');
    const [isSearching, setIsSearching] = useState(false);

    const handleStartGame = () => {
        if (!user) {
            setActiveTab('login');
            return;
        }
        setIsSearching(true);
        socketService.joinGame();
    };

    const handleCancelSearch = () => {
        setIsSearching(false);
        socketService.cancelSearch();
    };

    useEffect(() => {
        socketService.onMatchFound((gameId) => {
            setIsSearching(false);
            onGameStart(gameId);
        });
    }, [onGameStart]);

    return (
        <MenuContainer>
            {user ? (
                <>
                    <TabContainer>
                        <Tab 
                            $active={activeTab === 'play'} 
                            onClick={() => setActiveTab('play')}
                        >
                            Hrát
                        </Tab>
                        <Tab 
                            $active={activeTab === 'profile'} 
                            onClick={() => setActiveTab('profile')}
                        >
                            Profil
                        </Tab>
                        <Tab 
                            $active={activeTab === 'leaderboard'} 
                            onClick={() => setActiveTab('leaderboard')}
                        >
                            Žebříček
                        </Tab>
                        <Tab onClick={onLogout}>
                            Odhlásit se
                        </Tab>
                    </TabContainer>

                    {activeTab === 'play' && (
                        <div>
                            {isSearching ? (
                                <>
                                    <LoadingText>Hledám protihráče...</LoadingText>
                                    <CancelButton onClick={handleCancelSearch}>
                                        Zrušit hledání
                                    </CancelButton>
                                </>
                            ) : (
                                <PlayButton onClick={handleStartGame}>
                                    Hrát
                                </PlayButton>
                            )}
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <PlayerProfile userId={user.id} />
                    )}

                    {activeTab === 'leaderboard' && (
                        <Leaderboard />
                    )}
                </>
            ) : (
                <TabContainer>
                    <Tab 
                        $active={activeTab === 'login'} 
                        onClick={() => setActiveTab('login')}
                    >
                        Přihlášení
                    </Tab>
                    <Tab 
                        $active={activeTab === 'register'} 
                        onClick={() => setActiveTab('register')}
                    >
                        Registrace
                    </Tab>
                    {activeTab === 'login' && (
                        <LoginForm onSuccess={onLogin} />
                    )}
                    {activeTab === 'register' && (
                        <RegisterForm onSuccess={onLogin} />
                    )}
                </TabContainer>
            )}
        </MenuContainer>
    );
}

export default MainMenu;
