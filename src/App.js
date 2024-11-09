import React, { useState, useEffect, useCallback } from 'react';
import GameScene from './components/GameScene';
import socketService from './services/socketService';
import supabaseService from './services/supabaseService';
import MainMenu from './components/MainMenu';
import ConnectionStatus from './components/ConnectionStatus';
import GlobalStyles from './styles/GlobalStyles';
import RewardNotification from './components/rewards/RewardNotification';
import styled from 'styled-components';
import { useSound } from 'use-sound';
import mainMenuMusic from './assets/music/msc_main.mp3';
import gameMusic from './assets/music/msc_game.mp3';
const AppWrapper = styled.div`
    min-height: 100vh;
    width: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
`;

function App() {
    const [isMusicEnabled, setIsMusicEnabled] = useState(true);
    const [playMainMenuMusic, { duration, stop: stopMainMenuMusic }] = useSound(mainMenuMusic, { 
        volume: 0.5,
        soundEnabled: isMusicEnabled, 
        interrupt: true
    });
    const [playGameMusic, { duration: durationGameMusic, stop: stopGameMusic }] = useSound(gameMusic, { 
        volume: 0.5,
        soundEnabled: isMusicEnabled,
        interrupt: true
    });
    const [gameId, setGameId] = useState(null);
    const [gameState, setGameState] = useState(null);
    const [error, setError] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [user, setUser] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState({
        isConnected: false,
        show: false
    });
    const [reward, setReward] = useState(null);

    useEffect(() => {
        if (duration && !gameId && isMusicEnabled) {
            playMainMenuMusic();
            stopGameMusic();
        }
        else {
            if (durationGameMusic && isMusicEnabled) {
                stopMainMenuMusic();
                playGameMusic();
            }
        }
    }, [duration, playMainMenuMusic, gameId, stopMainMenuMusic, playGameMusic, durationGameMusic, stopGameMusic, isMusicEnabled]);

    useEffect(() => {
        if (!isMusicEnabled) {
            stopMainMenuMusic();
            stopGameMusic();
        }
    }, [isMusicEnabled, stopGameMusic, stopMainMenuMusic]);

    useEffect(() => {
        // Inicializace session při načtení aplikace
        const initApp = async () => {
            try {
                const userData = await supabaseService.initSession();
                if (userData?.user) {
                    const success = await initializeUserSession(userData.user);
                    if (success) {
                        setUser(userData.user);
                    }
                }
                setIsInitialized(true);
            } catch (error) {
                console.error('Chyba při inicializaci aplikace:', error);
                setConnectionStatus({
                    isConnected: false,
                    show: true
                });
            }
        };

        initApp();

        // Přidáme listener pro změny auth stavu
        const { data: authListener } = supabaseService.supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth state changed:', event, session?.user?.id);
                if (event === 'SIGNED_OUT') {
                    socketService.disconnect();
                    setUser(null);
                    setGameId(null);
                    setGameState(null);
                }
                // Odstraníme SIGNED_IN handling odsud, protože to budeme řešit přes handleLogin
            }
        );

        return () => {
            authListener?.subscription?.unsubscribe();
        };
    }, []);

    // Nová funkce pro inicializaci uživatelské session
    const initializeUserSession = async (user) => {
        try {
            console.log('Initializing user session for:', user.id);
            
            // Získáme JWT token
            const { data: { session }, error: sessionError } = await supabaseService.supabase.auth.getSession();
            if (sessionError) throw sessionError;

            if (!session) {
                throw new Error('No session available');
            }

            // Získáme profil uživatele
            const { data: profile, error: profileError } = await supabaseService.supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError) throw profileError;

            if (!profile) {
                throw new Error('User profile not found');
            }

            console.log('Setting auth data with profile:', profile);

            // Nastavíme auth data pro socket
            socketService.setAuthData(
                session.access_token,
                user.id,
                profile
            );

            // Počkáme na připojení socketu
            const connected = await socketService.connect();
            
            if (!connected) {
                throw new Error('Failed to connect to socket server');
            }

            console.log('Socket connected successfully');

            // Vyžádáme si aktuální seznam hráčů
            socketService.socket?.emit('request_online_players');

            return true;
        } catch (error) {
            console.error('Error initializing user session:', error);
            return false;
        }
    };

    // Upravíme handler pro přihlášení
    const handleLogin = async (userData) => {
        try {
            console.log('Starting login process for user:', userData.user.id);
            const success = await initializeUserSession(userData.user);
            
            if (success) {
                console.log('User session initialized successfully, setting user');
                setUser(userData.user);
                return true;
            } else {
                console.error('Failed to initialize user session');
                throw new Error('Failed to initialize user session');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    useEffect(() => {
        if (!isInitialized) return;

        const handleConnect = () => {
            console.log('Socket connected - updating connection status');
            setConnectionStatus({
                isConnected: true,
                show: true
            });
            setTimeout(() => {
                setConnectionStatus(prev => ({ ...prev, show: false }));
            }, 3000);
        };

        const handleDisconnect = () => {
            console.log('Socket disconnected - updating connection status');
            setConnectionStatus({
                isConnected: false,
                show: true
            });
        };

        // Nastavení počátečního stavu připojení
        setConnectionStatus(prev => ({
            ...prev,
            isConnected: socketService.isConnected()
        }));

        // Nastavení callbacků pro Socket.IO
        socketService.onGameState((state) => {
            setGameState(state);
        });

        socketService.onError((errorMessage) => {
            if (errorMessage === 'Opponent disconnected') {
                setGameId(null);
                setGameState(null);
            }
        });

        // Přidáme posluchače pro připojení/odpojení
        socketService.onConnect(handleConnect);
        socketService.onDisconnect(handleDisconnect);

        return () => {
            // Bezpečné odstranění listenerů
            if (socketService.socket) {
                socketService.socket.off('gameState');
                socketService.socket.off('error');
            }
            socketService.onConnect(null);
            socketService.onDisconnect(null);
        };
    }, [isInitialized]);

    // Přidáme samostatný useEffect pro cleanup socketu
    useEffect(() => {
        return () => {
            socketService.disconnect();
        };
    }, []);

    useEffect(() => {
        if (user && isInitialized) {
            const handleReward = (rewardData) => {
                setReward(rewardData);
            };

            socketService.socket?.on('rewardEarned', handleReward);

            return () => {
                // Bezpečné odstranění listeneru
                socketService.socket?.off('rewardEarned', handleReward);
            };
        }
    }, [user, isInitialized]);

    const handleGameStart = useCallback((newGameId) => {
        setGameId(newGameId);
    }, []);

    useEffect(() => {
        const handleContextMenu = (e) => {
            e.preventDefault();
        };

        document.addEventListener('contextmenu', handleContextMenu);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);

    return (
        <>
            <GlobalStyles />
            <AppWrapper>
                <ConnectionStatus
                    isConnected={connectionStatus.isConnected}
                    show={connectionStatus.show}
                />
                {reward && (
                    <RewardNotification
                        reward={reward}
                        onClose={() => setReward(null)}
                    />
                )}
                {!gameId ? (
                    <MainMenu
                        user={user}
                        onGameStart={handleGameStart}
                        onLogin={handleLogin}
                        onLogout={() => {
                            supabaseService.signOut();
                            socketService.disconnect();
                            setUser(null);
                        }}
                        isConnected={connectionStatus.isConnected}
                        isMusicEnabled={isMusicEnabled}
                        onToggleMusic={() => setIsMusicEnabled(!isMusicEnabled)}
                    />
                ) : (
                    gameState && <GameScene
                        gameState={gameState}
                        onPlayCard={(cardData) => socketService.playCard(cardData)}
                        onAttack={(attackData) => socketService.attack(attackData)}
                        onUseHeroAbility={() => socketService.useHeroAbility()}
                        onEndTurn={() => socketService.endTurn()}
                    />
                )}
            </AppWrapper>
        </>
    );
}

export default App;
