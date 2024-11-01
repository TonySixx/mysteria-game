import React, { useState, useEffect, useCallback } from 'react';
import GameScene from './components/GameScene';
import socketService from './services/socketService';
import supabaseService from './services/supabaseService';
import MainMenu from './components/MainMenu';
import ConnectionStatus from './components/ConnectionStatus';
import GlobalStyles from './styles/GlobalStyles';
import RewardNotification from './components/rewards/RewardNotification';

function App() {
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
        // Inicializace session při načtení aplikace
        const initApp = async () => {
            try {
                const userData = await supabaseService.initSession();
                setUser(userData?.user || null);
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
                if (event === 'SIGNED_IN') {
                    setUser(session.user);
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                    setGameId(null);
                    setGameState(null);
                }
            }
        );

        return () => {
            authListener?.subscription?.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (!isInitialized) return;

        const handleConnect = () => {
            setConnectionStatus({
                isConnected: true,
                show: true
            });
            // Skryjeme zprávu o úspěšném připojení po 3 sekundách
            setTimeout(() => {
                setConnectionStatus(prev => ({ ...prev, show: false }));
            }, 3000);
        };

        const handleDisconnect = () => {
            setConnectionStatus({
                isConnected: false,
                show: true
            });
        };

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

        // Přidáme handler pro rewardEarned
        socketService.socket.on('rewardEarned', (rewardData) => {
            setReward(rewardData);
        });

        return () => {
            socketService.disconnect();
            socketService.socket.off('rewardEarned');
        };
    }, [isInitialized]);

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
            <div>
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
                        onLogin={(userData) => setUser(userData.user)}
                        onLogout={() => {
                            supabaseService.signOut();
                            setUser(null);
                        }}
                        isConnected={connectionStatus.isConnected}
                    />
                ) : (
                    gameState && <GameScene 
                        gameState={gameState}
                        onPlayCard={(cardData) => socketService.playCard(cardData)}
                        onAttack={(attackData) => socketService.attack(attackData)}
                        onEndTurn={() => socketService.endTurn()}
                    />
                )}
            </div>
        </>
    );
}

export default App;
