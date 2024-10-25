import React, { useState, useEffect } from 'react';
import GameScene from './components/GameScene';
import MatchmakingScreen from './components/MatchmakingScreen';
import socketService from './services/SocketService';

function App() {
    const [gameId, setGameId] = useState(null);
    const [gameState, setGameState] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Nastavení callbacků pro Socket.IO
        socketService.onGameState((state) => {
            console.log('Received game state in App:', state);
            setGameState(state);
        });

        socketService.onError((errorMessage) => {
            console.error('Game error:', errorMessage);
            setError(errorMessage);
            if (errorMessage === 'Protihráč se odpojil') {
                setGameId(null);
                setGameState(null);
            }
        });

        return () => {
            socketService.disconnect();
        };
    }, []);

    const handleGameStart = (newGameId) => {
        console.log('Game started with ID:', newGameId);
        setGameId(newGameId);
    };

    return (
        <div>
            {error && <div className="error-message">{error}</div>}
            {!gameId ? (
                <MatchmakingScreen onGameStart={handleGameStart} />
            ) : (
                <GameScene 
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
