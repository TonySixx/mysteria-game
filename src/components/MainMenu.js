import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';
import PlayerProfile from './profile/PlayerProfile';
import Leaderboard from './leaderboard/Leaderboard';
import socketService from '../services/socketService';
import { theme } from '../styles/theme';
import OnlinePlayers from './play/OnlinePlayers';
import { DeckList } from './deck/DeckList';
import { deckService } from '../services/deckService';
import DeckBuilder from './deck/DeckBuilder';

const MenuContainer = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
    color: ${theme.colors.text.primary};
    background: ${theme.colors.background};
    position: relative;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: ${theme.colors.border.golden};
    }
`;

const TabContainer = styled.div`
    display: flex;
    margin-bottom: 30px;
    justify-content: center;
    gap: 10px;
`;

const Tab = styled.button`
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
    position: relative;
    width: ${props => props.$vertical ? '150px' : 'auto'};

    &:hover {
        color: ${theme.colors.text.primary};
        box-shadow: ${theme.shadows.golden};
        transform: translateY(-2px);
    }

    &::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 100%;
        height: 2px;
        background: ${props => props.$active ? theme.colors.primary : 'transparent'};
        transition: all 0.3s;
    }
`;

const PlayButton = styled.button`
    width: 300px;
    padding: 20px;
    background: linear-gradient(45deg, ${theme.colors.secondary}, ${theme.colors.backgroundLight});
    border: 3px solid transparent;
    border-image: ${theme.colors.border.golden};
    border-image-slice: 1;
    color: ${theme.colors.text.primary};
    font-size: 1.5em;
    font-weight: bold;
    cursor: pointer;
    margin: 30px auto;
    display: block;
    transition: all 0.3s;
    text-transform: uppercase;
    letter-spacing: 2px;
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-3px);
        box-shadow: ${theme.shadows.intense};
        
        &::after {
            transform: translateY(0);
            opacity: 1;
        }
    }

    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
            45deg,
            transparent 0%,
            rgba(255, 215, 0, 0.1) 50%,
            transparent 100%
        );
        transform: translateY(-100%);
        opacity: 0;
        transition: all 0.3s;
    }

    &:disabled {
        background: ${theme.colors.secondary};
        cursor: not-allowed;
        opacity: 0.7;
    }
`;

const LoadingText = styled.div`
    font-size: 1.3em;
    color: ${theme.colors.text.primary};
    text-align: center;
    margin: 30px 0;
    text-transform: uppercase;
    letter-spacing: 2px;
    animation: pulse 1.5s infinite;

    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
    }
`;

const CancelButton = styled(PlayButton)`
    background: linear-gradient(45deg, ${theme.colors.accent}, ${theme.colors.secondary});
    width: 250px;
`;

const Tooltip = styled.span`
    position: absolute;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 0.8em;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s;

    ${PlayButton}:hover & {
        opacity: 1;
    }
`;

const WarningMessage = styled.div`
    color: ${theme.colors.accent};
    text-align: center;
    margin-bottom: 15px;
    padding: 10px;
    background: rgba(139, 0, 0, 0.2);
    border: 1px solid ${theme.colors.accent};
    border-radius: 5px;
    font-weight: bold;
`;

function MainMenu({ user, onGameStart, onLogin, onLogout }) {
    const [activeTab, setActiveTab] = useState(user ? 'play' : 'login');
    const [isSearching, setIsSearching] = useState(false);
    const [onlinePlayers, setOnlinePlayers] = useState([]);
    const [gameId, setGameId] = useState(null);
    const [decks, setDecks] = useState([]);
    const [currentScreen, setCurrentScreen] = useState('menu'); // Přidáme state pro navigaci
    const [editingDeck, setEditingDeck] = useState(null); // Přidáme state pro editovaný balíček

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

    useEffect(() => {
        let isSubscribed = true;

        const setupOnlinePlayers = async () => {
            if (user) {
                // Počkáme na připojení socketu
                if (!socketService.isConnected()) {
                    await socketService.connect();
                }
                
                if (isSubscribed) {
                    socketService.subscribeToOnlinePlayers((players) => {
                        console.log('Updating online players:', {
                            currentUser: user.id,
                            players
                        });
                        setOnlinePlayers(players);
                    });
                }
            }
        };

        setupOnlinePlayers();

        return () => {
            isSubscribed = false;
            socketService.unsubscribeFromOnlinePlayers();
        };
    }, [user]);

  
        // Přidáme useEffect pro změnu tabu při přihlášení
        useEffect(() => {
            if (user) {
                setActiveTab('play');
            } else {
                setActiveTab('login');
            }
        }, [user]); // Reagujeme na změnu user prop

    useEffect(() => {
        if (gameId) {
            // Když se spustí hra, odešleme událost na server
            socketService.socket?.emit('gameStarted', gameId);
        }
    }, [gameId]);

    // Přidáme načítání balíčků
    useEffect(() => {
        if (user && activeTab === 'decks') {
            loadDecks();
        }
    }, [user, activeTab]);

    const loadDecks = async () => {
        try {
            const userDecks = await deckService.getDecks(user.id);
            setDecks(userDecks);
        } catch (error) {
            console.error('Error loading decks:', error);
        }
    };

    const handleDeckSelect = async (deck) => {
        try {
            await deckService.setActiveDeck(user.id, deck.id);
            // Aktualizujeme seznam balíčků
            loadDecks();
        } catch (error) {
            console.error('Error setting active deck:', error);
        }
    };

    const handleCreateDeck = () => {
        setCurrentScreen('deck-builder');
    };

    const handleBackToMenu = () => {
        setCurrentScreen('menu');
        // Při návratu do menu aktualizujeme seznam balíčků
        if (user) {
            loadDecks();
        }
    };

    const handleDeleteDeck = async (deckId) => {
        try {
            await deckService.deleteDeck(deckId);
            // Po smazání znovu načteme seznam balíčků
            loadDecks();
        } catch (error) {
            console.error('Error deleting deck:', error);
        }
    };

    const handleEditDeck = (deck) => {
        // Nastavíme editovaný balíček a přepneme na DeckBuilder
        setCurrentScreen('deck-builder');
        setEditingDeck(deck);
    };

    if (currentScreen === 'deck-builder') {
        return (
            <DeckBuilder 
                onBack={handleBackToMenu} 
                userId={user.id}
                editingDeck={editingDeck} // Předáme editovaný balíček
            />
        );
    }

    return (
        <MenuContainer>
            {user ? (
                <>
                    <TabContainer>
                        <Tab 
                            $active={activeTab === 'play'} 
                            onClick={() => setActiveTab('play')}
                        >
                            Play
                        </Tab>
                        <Tab 
                            $active={activeTab === 'decks'} 
                            onClick={() => setActiveTab('decks')}
                        >
                            Decks
                        </Tab>
                        <Tab 
                            $active={activeTab === 'profile'} 
                            onClick={() => setActiveTab('profile')}
                        >
                            Profile
                        </Tab>
                        <Tab 
                            $active={activeTab === 'leaderboard'} 
                            onClick={() => setActiveTab('leaderboard')}
                        >
                            Leaderboard
                        </Tab>
                        <Tab onClick={onLogout}>
                            Logout
                        </Tab>
                    </TabContainer>

                    {activeTab === 'play' && (
                        <div>
                            {isSearching ? (
                                <>
                                    <LoadingText>Searching for opponent...</LoadingText>
                                    <CancelButton onClick={handleCancelSearch}>
                                        Cancel Search
                                    </CancelButton>
                                </>
                            ) : (
                                <>
                                    {!decks.some(deck => deck.is_active) && (
                                        <WarningMessage>
                                            You need to select an active deck before starting a game!
                                        </WarningMessage>
                                    )}
                                    <PlayButton 
                                        onClick={handleStartGame}
                                        disabled={!decks.some(deck => deck.is_active)}
                                    >
                                        Find Game
                                    </PlayButton>
                                </>
                            )}
                            <OnlinePlayers players={onlinePlayers} />
                        </div>
                    )}

                    {activeTab === 'decks' && (
                        <DeckList 
                            decks={decks}
                            onDeckSelect={handleDeckSelect}
                            onCreateDeck={handleCreateDeck}
                            onEditDeck={handleEditDeck}
                            onDeleteDeck={handleDeleteDeck}
                        />
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
                        $vertical={true}
                        onClick={() => setActiveTab('login')}
                    >
                        Login
                    </Tab>
                    <Tab 
                        $vertical={true}
                        $active={activeTab === 'register'} 
                        onClick={() => setActiveTab('register')}
                    >
                        Register
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
