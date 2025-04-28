import React, { useState, useEffect, useCallback } from 'react';
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
import PropTypes from 'prop-types';
import { FaVolumeUp, FaVolumeMute, FaExpand, FaCompress, FaDiscord, FaSignOutAlt, FaStore } from 'react-icons/fa';
import supabaseService from '../services/supabaseService';
import CardPackStore from './profile/CardPackStore';
import CardPackOpening from './profile/CardPackOpening';

const MenuContainer = styled.div`
    min-height: 100vh;
    width: 100%;
    margin: 0 auto;
    padding: 40px 20px;
    color: ${theme.colors.text.primary};
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: ${theme.colors.border.golden};
        box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
    }

    &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: ${theme.colors.border.golden};
        box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
    }
`;

const ContentWrapper = styled.div`
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 40px;
    background: linear-gradient(
        135deg,
        rgba(20, 10, 6, 0.98) 0%,
        rgba(28, 15, 8, 0.98) 100%
    );
    border-radius: 20px;
    box-shadow: 
        0 0 30px rgba(0, 0, 0, 0.7),
        0 0 2px rgba(255, 215, 0, 0.3),
        inset 0 0 50px rgba(0, 0, 0, 0.5);
    position: relative;
    border: 1px solid rgba(255, 215, 0, 0.1);
    max-height: 80vh;
    min-height: 60vh;
    overflow-y: auto;
    overflow-x: hidden;
    transition: all 0.3s ease-in-out;

    & > div:first-child {
        position: relative;
        min-height: 100%;
        opacity: 1;
        transition: opacity 0.2s ease-in-out;
    }

    &.loading > div:first-child {
        opacity: 0;
    }

    &::-webkit-scrollbar {
        width: 8px;
        background-color: transparent;
    }

    &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 4px;
        margin: 10px;
    }

    &::-webkit-scrollbar-thumb {
        background: linear-gradient(
            to bottom,
            rgba(255, 215, 0, 0.3),
            rgba(255, 215, 0, 0.5)
        );
        border-radius: 4px;
        border: 2px solid transparent;
        background-clip: padding-box;

        &:hover {
            background: linear-gradient(
                to bottom,
                rgba(255, 215, 0, 0.5),
                rgba(255, 215, 0, 0.7)
            );
        }
    }

    scrollbar-width: thin;
    scrollbar-color: rgba(255, 215, 0, 0.5) rgba(0, 0, 0, 0.2);

    &::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('./background-pattern.jpg') repeat;
        opacity: 0.02;
        pointer-events: none;
        z-index: 1;
    }

    &::after {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(
            circle at center,
            transparent 0%,
            rgba(0, 0, 0, 0.3) 100%
        );
        pointer-events: none;
        z-index: 1;
    }

    & > * {
        position: relative;
        z-index: 2;
    }
`;

const MenuHeader = styled.div`
    text-align: center;
    margin-bottom: 60px;
    position: relative;

    &::after {
        content: '';
        position: absolute;
        bottom: -30px;
        left: 50%;
        transform: translateX(-50%);
        width: 300px;
        height: 2px;
        background: ${theme.colors.border.golden};
        box-shadow: 
            0 0 10px rgba(255, 215, 0, 0.3),
            0 0 20px rgba(255, 215, 0, 0.2);
    }
`;

const MenuTitle = styled.h1`
    font-family: 'MedievalSharp', cursive;
    font-size: 4.5em;
    color: ${theme.colors.text.primary};
    text-transform: uppercase;
    letter-spacing: 5px;
    margin: 0;
    position: relative;
    text-shadow: 
        2px 2px 2px rgba(0, 0, 0, 0.5),
        0 0 5px rgba(255, 215, 0, 0.3),
        0 0 15px rgba(255, 215, 0, 0.2);
    background: linear-gradient(
        to bottom, 
        #ffd700 0%, 
        #b8860b 40%,
        #ffd700 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: titleGlow 3s ease-in-out infinite alternate;

    &::before {
        content: 'MYSTERIA';
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        z-index: -1;
        color: rgba(0, 0, 0, 0.3);
        filter: blur(4px);
    }

    @keyframes titleGlow {
        from {
            filter: drop-shadow(0 0 1px rgba(255, 215, 0, 0.5))
                   drop-shadow(0 0 2px rgba(255, 215, 0, 0.3));
        }
        to {
            filter: drop-shadow(0 0 2px rgba(255, 215, 0, 0.7))
                   drop-shadow(0 0 4px rgba(255, 215, 0, 0.4));
        }
    }
`;

const MenuSubtitle = styled.div`
    font-family: 'Crimson Pro', serif;
    font-size: 1.2em;
    color: ${theme.colors.text.secondary};
    text-align: center;
    margin-top: 10px;
    letter-spacing: 2px;
    opacity: 0.8;
`;

const TabContainer = styled.div`
    display: flex;
    margin-bottom: 30px;
    justify-content: center;
    gap: 10px;
`;

const Tab = styled.button`
    font-family: 'Cinzel', serif;
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
    font-family: 'Cinzel', serif;
    width: 250px;
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
    font-family: 'Crimson Pro', serif;
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
    font-family: 'Crimson Pro', serif;
    color: ${theme.colors.accent};
    text-align: center;
    margin-bottom: 15px;
    padding: 10px;
    background: rgba(139, 0, 0, 0.2);
    border: 1px solid ${theme.colors.accent};
    border-radius: 5px;
    font-weight: bold;
`;

const AuthTabContainer = styled.div`
    display: flex;
    justify-content: center;
    margin-bottom: 30px;
    background: linear-gradient(135deg, rgba(20, 10, 6, 0.98) 0%, rgba(28, 15, 8, 0.98) 100%);
    padding: 10px;
    border-radius: 10px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 215, 0, 0.1);
    width: fit-content;
    margin: 0 auto 30px auto;
`;

const AuthTab = styled.button`
    font-family: 'Cinzel', serif;
    padding: 12px 40px;
    background: ${props => props.$active ? 
        'linear-gradient(45deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.2))' : 
        'transparent'
    };
    border: none;
    color: ${props => props.$active ? theme.colors.text.primary : theme.colors.text.secondary};
    cursor: pointer;
    transition: all 0.3s;
    font-size: 1.1em;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    position: relative;
    min-width: 160px;

    &:first-child {
        border-right: 1px solid rgba(255, 215, 0, 0.1);
    }

    &:hover {
        color: ${theme.colors.text.primary};
        background: linear-gradient(45deg, rgba(255, 215, 0, 0.05), rgba(255, 215, 0, 0.1));
    }

    &::after {
        content: '';
        position: absolute;
        bottom: ${props => props.$active ? '-2px' : '0'};
        left: 0;
        width: 100%;
        height: 2px;
        background: ${props => props.$active ? theme.colors.border.golden : 'transparent'};
        box-shadow: ${props => props.$active ? '0 0 10px rgba(255, 215, 0, 0.3)' : 'none'};
        transition: all 0.3s;
    }
`;

// Přidáme nový custom hook pro scrollování
const useScrollToContent = () => {
    const scrollToContent = useCallback((elementId, delay = 0, isMainTabChange = false) => {
        setTimeout(() => {
            const element = document.getElementById(elementId);
            if (element && !isMainTabChange) {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }, delay);
    }, []);

    return scrollToContent;
};

// Přidáme wrapper pro obsah tabů
const TabContent = styled.div`
    opacity: ${props => props.$isVisible ? 1 : 0};
    transform: translateY(${props => props.$isVisible ? '0' : '20px'});
    transition: all 0.3s ease-in-out;
    min-height: 200px; // Minimální výška pro předejití skákání obsahu
`;

// Přidáme nový styled komponent pro tlačítko hudby
const ControlButton = styled.button`
    position: fixed;
    top: 20px;
    background: ${theme.colors.backgroundLight};
    border: 2px solid ${theme.colors.border.golden};
    border-radius: 50%;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    color: ${theme.colors.border.golden};
    z-index: 9999;
    box-shadow: 
        0 0 10px rgba(0, 0, 0, 0.5),
        0 0 5px ${theme.colors.border.golden};
    padding: 8px;

    &:hover {
        transform: scale(1.1);
        box-shadow: 
            0 0 15px rgba(255, 215, 0, 0.5),
            0 0 25px rgba(255, 215, 0, 0.2);
        background: ${theme.colors.secondary};
    }

    svg {
        width: 28px;
        height: 28px;
        filter: drop-shadow(0 0 2px rgba(255, 215, 0, 0.5));
    }

    &:focus {
        outline: none;
        box-shadow: 
            0 0 0 2px ${theme.colors.border.golden},
            0 0 15px rgba(255, 215, 0, 0.3);
    }
`;

const MusicToggleButton = styled(ControlButton)`
    right: 80px; // Posuneme tlačítko hudby doleva
`;

const FullscreenButton = styled(ControlButton)`
    right: 20px; // Umístění vlevo od hudby
`;

const LogoutButton = styled(ControlButton)`
    right: 140px; 
`;

// Přidáme nové styled komponenty pro AI tlačítko
const PlayAIButton = styled(PlayButton)`
    background: linear-gradient(45deg, 
        rgba(26, 71, 42, 0.9),  // Tmavší, méně sytá zelená s průhledností
        ${props => props.disabled ? theme.colors.secondary : 'rgba(45, 90, 64, 0.9)'}  // Tmavší odstín pro hover
    );

    &:hover {
        transform: translateY(-3px);
        box-shadow: ${theme.shadows.intense};
        background: linear-gradient(45deg, 
            rgba(45, 90, 64, 0.9),
            rgba(26, 71, 42, 0.9)
        );
    }

    &:disabled {
        background: ${theme.colors.secondary};
        cursor: not-allowed;
        opacity: 0.7;
    }

    // Zachováme stejný border jako u PlayButton
    border: 3px solid transparent;
    border-image: ${theme.colors.border.golden};
    border-image-slice: 1;

    // Zachováme stejný gradient efekt při hoveru
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

    &:hover::after {
        transform: translateY(0);
        opacity: 1;
    }
`;

const ButtonsContainer = styled.div`
    display: flex;
    flex-direction: row;  // Změníme na row pro horizontální layout
    justify-content: center;
    gap: 20px;  // Zvětšíme mezeru mezi tlačítky
    margin: 30px 0;
`;

const GoldDisplay = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 15px;
    background: linear-gradient(135deg, ${theme.colors.secondary} 0%, ${theme.colors.backgroundLight} 100%);
    border-radius: 8px;
    position: fixed;
    top: 20px;
    left: 20px;
    border: 2px solid ${theme.colors.border.golden};
    z-index: 9999;
    box-shadow: ${theme.shadows.golden};

    span {
        color: ${theme.colors.gold};
        font-size: 1.2em;
        font-weight: bold;
    }
`;

function MainMenu({ 
    user, 
    onGameStart, 
    onLogin, 
    onLogout, 
    isConnected, 
    isMusicEnabled, 
    onToggleMusic 
}) {
    const [activeTab, setActiveTab] = useState(user ? 'play' : 'login');
    const [isSearching, setIsSearching] = useState(false);
    const [onlinePlayers, setOnlinePlayers] = useState([]);
    const [gameId, setGameId] = useState(null);
    const [decks, setDecks] = useState([]);
    const [currentScreen, setCurrentScreen] = useState('menu'); // Přidáme state pro navigaci
    const [editingDeck, setEditingDeck] = useState(null); // Přidáme state pro editovaný balíček
    const [isLoading, setIsLoading] = useState(false);
    const [contentVisible, setContentVisible] = useState(false);
    const scrollToContent = useScrollToContent();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isPlayingAI, setIsPlayingAI] = useState(false);
    const [playerGold, setPlayerGold] = useState(0);
    const [showPackOpening, setShowPackOpening] = useState(false);
    const [openedCards, setOpenedCards] = useState([]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Chyba při přepnutí do fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    const handleStartGame = () => {
        if (!user) {
            setActiveTab('login');
            return;
        }
        setIsSearching(true);
        setIsPlayingAI(false); // Deaktivujeme AI tlačítko
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
                try {
                    // Zajistíme, že socket je připojen
                    if (!socketService.isConnected()) {
                        await socketService.connect();
                    }
                    
                    if (isSubscribed) {
                        // Explicitně požádáme o aktuální seznam hráčů
                        socketService.socket?.emit('request_online_players');
                        
                        socketService.subscribeToOnlinePlayers((players) => {
                            console.log('Updating online players:', {
                                currentUser: user.id,
                                players
                            });
                            setOnlinePlayers(players);
                        });
                    }
                } catch (error) {
                    console.error('Error setting up online players:', error);
                }
            }
        };

        setupOnlinePlayers();

        return () => {
            isSubscribed = false;
            socketService.unsubscribeFromOnlinePlayers();
        };
    }, [user]); // Reagujeme pouze na změnu uživatele

  
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

    // Upravíme useEffect pro načítání balíčků
    useEffect(() => {
        if (user && (activeTab === 'decks' || activeTab === 'play')) {
            loadDecks();
        }
    }, [user, activeTab]); // Reagujeme na změnu uživatele a aktivní záložky

    // Přidáme nový useEffect pro inicializační načtení balíčků
    useEffect(() => {
        if (user) {
            loadDecks();
        }
    }, [user]); // Načteme balíčky při přihlášení uživatele

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
            // Aktualizujeme seznam balíků
            loadDecks();
        } catch (error) {
            console.error('Error setting active deck:', error);
        }
    };

    const handleCreateDeck = () => {
        setEditingDeck(null); // Vyčistíme stav editovaného balíčku
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

    // Funkce pro změnu tabu s plynulým přechodem
    const handleTabChange = async (newTab) => {
        setIsLoading(true);
        setContentVisible(false);

        // If we're switching from the profile tab, reload gold amount
        // since the user might have made transactions there
        if (activeTab === 'profile' && newTab !== 'profile') {
            loadPlayerCurrency();
        }
        
        // Always reload gold when switching to the store tab
        if (newTab === 'store') {
            loadPlayerCurrency();
        }

        setTimeout(() => {
            setActiveTab(newTab);
            setIsLoading(false);
            
            // Po změně tabu počkáme na vykreslení obsahu
            setTimeout(() => {
                setContentVisible(true);
                scrollToContent('tab-content', 100); // Scrollujeme až po zobrazení obsahu
            }, 50);
        }, 200);
    };

    // Přidáme efekt pro inicializaci viditelnosti obsahu
    useEffect(() => {
        if (!isLoading) {
            setTimeout(() => {
                setContentVisible(true);
            }, 100);
        }
    }, [isLoading]);

    // Přidáme handler pro hru proti AI
    const handlePlayAI = () => {
        if (!user) {
            setActiveTab('login');
            return;
        }
        setIsPlayingAI(true);
        socketService.startAIGame();
    };

    // Funkce pro otevření odkazu na Discord komunitu
    const openDiscordCommunity = () => {
        window.open('https://discord.gg/E7MM4ys6fb', '_blank');
    };

    // Add function to load player gold
    const loadPlayerCurrency = async () => {
        if (user) {
            try {
                const currency = await supabaseService.getPlayerCurrency(user.id);
                setPlayerGold(currency.gold_amount);
            } catch (error) {
                console.error('Error loading currency:', error);
            }
        }
    };

    // Load currency when user changes
    useEffect(() => {
        if (user) {
            loadPlayerCurrency();
        }
    }, [user]);

    // Handle pack purchase
    const handlePackPurchase = async (packId) => {
        try {
            const cards = await supabaseService.purchaseCardPack(user.id, packId);

            const cardsArray = Array.isArray(cards) ? cards : JSON.parse(cards);

            if (cardsArray && cardsArray.length > 0) {
                setOpenedCards(cardsArray);
                setShowPackOpening(true);
                await loadPlayerCurrency();
            } else {
                throw new Error('Failed to get cards from pack');
            }
        } catch (error) {
            console.error('Error purchasing pack:', error);
        }
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
            {user && (
                <>
                    <LogoutButton
                        onClick={onLogout}
                        title="Logout"
                        aria-label="Logout"
                    >
                        <FaSignOutAlt size={24} />
                    </LogoutButton>
                    <GoldDisplay>
                        🪙 <span>{playerGold}</span> Gold
                    </GoldDisplay>
                </>
            )}
            <MusicToggleButton 
                onClick={onToggleMusic} 
                title={isMusicEnabled ? 'Disable Music' : 'Enable Music'}
            >
                {isMusicEnabled ? <FaVolumeUp size={24} /> : <FaVolumeMute size={24} />}
            </MusicToggleButton>
            <FullscreenButton
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
                {isFullscreen ? <FaCompress size={24} /> : <FaExpand size={24} />}
            </FullscreenButton>
            <ContentWrapper className={isLoading ? 'loading' : ''}>
                <div>
                    <MenuHeader>
                        <MenuTitle>Mysteria</MenuTitle>
                        <MenuSubtitle>The Card Masters Saga</MenuSubtitle>
                    </MenuHeader>
                    {!user && (
                        <>
                            <AuthTabContainer>
                                <AuthTab 
                                    $active={activeTab === 'login'}
                                    onClick={() => handleTabChange('login')}
                                >
                                    Login
                                </AuthTab>
                                <AuthTab 
                                    $active={activeTab === 'register'}
                                    onClick={() => handleTabChange('register')}
                                >
                                    Register
                                </AuthTab>
                            </AuthTabContainer>
                            {activeTab === 'login' && (
                                <LoginForm onSuccess={onLogin} />
                            )}
                            {activeTab === 'register' && (
                                <RegisterForm onSuccess={onLogin} />
                            )}
                        </>
                    )}
                    {user && (
                        <>
                            <TabContainer>
                                <Tab 
                                    $active={activeTab === 'play'} 
                                    onClick={() => handleTabChange('play')}
                                >
                                    Play
                                </Tab>
                                <Tab 
                                    $active={activeTab === 'decks'} 
                                    onClick={() => handleTabChange('decks')}
                                >
                                    Decks
                                </Tab>
                                <Tab 
                                    $active={activeTab === 'profile'} 
                                    onClick={() => handleTabChange('profile')}
                                >
                                    Profile
                                </Tab>
                                <Tab 
                                    $active={activeTab === 'leaderboard'} 
                                    onClick={() => handleTabChange('leaderboard')}
                                >
                                    Leaderboard
                                </Tab>
                                                                <Tab 
                                    $active={activeTab === 'store'} 
                                    onClick={() => handleTabChange('store')}
                                >
                                    Store
                                </Tab>
                                <Tab onClick={openDiscordCommunity}>
                                    <FaDiscord style={{marginRight: '8px'}} /> Community
                                </Tab>
                            </TabContainer>

                            <TabContent 
                                id="tab-content"
                                $isVisible={contentVisible}
                            >
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
                                                <ButtonsContainer>
                                                    <PlayButton 
                                                        onClick={handleStartGame}
                                                        disabled={!decks.some(deck => deck.is_active) || !isConnected || isPlayingAI}
                                                    >
                                                        {isConnected ? 'Find Game' : 'Connecting to server...'}
                                                        {!isConnected && (
                                                            <Tooltip>
                                                                Please wait while connecting to the server
                                                            </Tooltip>
                                                        )}
                                                    </PlayButton>
                                                    <PlayAIButton
                                                        onClick={handlePlayAI}
                                                        disabled={!decks.some(deck => deck.is_active) || isSearching}
                                                    >
                                                        Play vs AI
                                                    </PlayAIButton>
                                                </ButtonsContainer>
                                            </>
                                        )}
                                        {console.log('MainMenu - Rendering OnlinePlayers with:', onlinePlayers)}
                                        <OnlinePlayers players={onlinePlayers} />
                                    </div>
                                )}

                                {activeTab === 'decks' && (
                                    <div>
                                        <DeckList 
                                            decks={decks}
                                            onDeckSelect={handleDeckSelect}
                                            onCreateDeck={handleCreateDeck}
                                            onEditDeck={handleEditDeck}
                                            onDeleteDeck={handleDeleteDeck}
                                        />
                                    </div>
                                )}

                                {activeTab === 'profile' && (
                                    <div>
                                        <PlayerProfile 
                                            userId={user.id}
                                            onContentLoad={() => {
                                                setContentVisible(true);
                                                scrollToContent('tab-content', 100, true);
                                            }}
                                        />
                                    </div>
                                )}

                                {activeTab === 'store' && (
                                    <div style={{margin: 'auto',maxWidth:800}}>
                                        <CardPackStore
                                            onPurchase={handlePackPurchase}
                                            userId={user.id}
                                            playerGold={playerGold}
                                            onContentLoad={() => {
                                                setContentVisible(true);
                                                scrollToContent('tab-content', 100);
                                            }}
                                        />
                                    </div>
                                )}

                                {activeTab === 'leaderboard' && (
                                    <Leaderboard />
                                )}
                            </TabContent>
                        </>
                    )}
                </div>
            </ContentWrapper>
            
            {showPackOpening && (
                <CardPackOpening
                    cards={openedCards}
                    onClose={() => {
                        setShowPackOpening(false);
                        setOpenedCards([]);
                    }}
                />
            )}
        </MenuContainer>
    );
}

MainMenu.propTypes = {
    // ... existující PropTypes ...
    isMusicEnabled: PropTypes.bool.isRequired,
    onToggleMusic: PropTypes.func.isRequired,
};

export default MainMenu;
