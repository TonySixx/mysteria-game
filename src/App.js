import React, { useState, useEffect, useCallback } from 'react';
import GameScene from './components/GameScene';
import socketService from './services/socketService';
import supabaseService from './services/supabaseService';
import MainMenu from './components/MainMenu';

function App() {
    const [gameId, setGameId] = useState(null);
    const [gameState, setGameState] = useState(null);
    const [error, setError] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [user, setUser] = useState(null); // Přidáme stav pro uživatele

    useEffect(() => {
        // Inicializace session při načtení aplikace
        const initApp = async () => {
            try {
                const userData = await supabaseService.initSession();
                setUser(userData?.user || null);
                setIsInitialized(true);
            } catch (error) {
                console.error('Chyba při inicializaci aplikace:', error);
                setError('Nepodařilo se inicializovat aplikaci');
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

        // Nastavení callbacků pro Socket.IO
        socketService.onGameState((state) => {
            console.log('Received game state in App:', state);
            setGameState(state);
        });

        socketService.onError((errorMessage) => {
            console.error('Game error:', errorMessage);
            setError(errorMessage);
            if (errorMessage === 'Opponent disconnected') {
                setGameId(null);
                setGameState(null);
            }
        });

        return () => {
            socketService.disconnect();
        };
    }, [isInitialized]);

    const handleGameStart = useCallback((newGameId) => {
        console.log('Game started with ID:', newGameId);
        setGameId(newGameId);
    }, []);

    return (
        <div>
            {error && <div className="error-message">{error}</div>}
            {!gameId ? (
                <MainMenu 
                    user={user} 
                    onGameStart={handleGameStart}
                    onLogin={(userData) => setUser(userData.user)}
                    onLogout={() => {
                        supabaseService.signOut();
                        setUser(null);
                    }}
                />
            ) : (
                gameState && <GameScene 
                    gameState={gameState}
                    onPlayCard={(cardData) => {
                        console.log('Playing card:', cardData);
                        socketService.playCard(cardData);
                    }}
                    onAttack={(attackData) => {
                        console.log('Attacking:', attackData);
                        socketService.attack(attackData);
                    }}
                    onEndTurn={() => {
                        console.log('Ending turn');
                        socketService.endTurn();
                    }}
                />
            )}
        </div>
    );
}

export default App;
