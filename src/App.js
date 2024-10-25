import React, { useState } from 'react';
import GameScene from './components/GameScene';
import MatchmakingScreen from './components/MatchmakingScreen';
import socketService from './services/SocketService';

function App() {
    const [gameId, setGameId] = useState(null);
    const [gameState, setGameState] = useState(null);

    const handleGameStart = (newGameId) => {
        setGameId(newGameId);
        socketService.onGameState((state) => {
            setGameState(state);
        });
    };

    return (
        <div>
            {!gameId ? (
                <MatchmakingScreen onGameStart={handleGameStart} />
            ) : (
                <GameScene 
                    gameState={gameState}
                    onPlayCard={(cardData) => socketService.playCard(cardData)}
                    onAttack={(attackData) => socketService.attack(attackData)}
                    onEndTurn={() => socketService.endTurn()}
                />
            )}
        </div>
    );
}

export default App;
