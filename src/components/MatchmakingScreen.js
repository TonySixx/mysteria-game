import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import socketService from '../services/SocketService';

const MatchmakingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background: url('/background.png') no-repeat center center fixed;
    background-size: cover;
`;

const SearchingText = styled.h2`
    color: #ffd700;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    margin-bottom: 20px;
`;

const LoadingSpinner = styled.div`
    width: 50px;
    height: 50px;
    border: 5px solid #ffd700;
    border-top: 5px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const Button = styled.button`
    padding: 12px 24px;
    font-size: 18px;
    background: linear-gradient(45deg, #ffd700, #ff9900);
    border: none;
    border-radius: 5px;
    color: #000;
    cursor: pointer;
    transition: all 0.3s;
    margin-top: 20px;

    &:hover {
        transform: scale(1.05);
        box-shadow: 0 0 10px #ffd700;
    }
`;

const MatchmakingScreen = ({ onGameStart }) => {
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Připojení k socket serveru
        socketService.connect();

        // Nastavení callback funkcí
        socketService.onMatchFound((response) => {
            setIsSearching(false);
            onGameStart(response.gameId);
        });

        socketService.onError((error) => {
            setIsSearching(false);
            setError(error);
        });

        return () => {
            socketService.disconnect();
        };
    }, [onGameStart]);

    const handleFindGame = () => {
        setIsSearching(true);
        setError(null);
        socketService.joinGame();
    };

    const handleCancel = () => {
        setIsSearching(false);
        socketService.cancelSearch();
        // Již nemusíme odpojovat a znovu připojovat socket
    };

    return (
        <MatchmakingContainer>
            {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}
            
            {isSearching ? (
                <>
                    <SearchingText>Hledání protihráče...</SearchingText>
                    <LoadingSpinner />
                    <Button onClick={handleCancel}>Zrušit hledání</Button>
                </>
            ) : (
                <Button onClick={handleFindGame}>Najít hru</Button>
            )}
        </MatchmakingContainer>
    );
};

export default MatchmakingScreen;
