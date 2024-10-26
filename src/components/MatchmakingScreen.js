import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import socketService from '../services/socketService';

const MatchmakingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background: linear-gradient(
        135deg,
        #1a1a2e 0%,
        #16213e 50%,
        #1a1a2e 100%
    );
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(
            circle at center,
            rgba(255, 215, 0, 0.1) 0%,
            transparent 70%
        );
        pointer-events: none;
    }

    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
            45deg,
            transparent 0%,
            rgba(255, 215, 0, 0.05) 50%,
            transparent 100%
        );
        animation: shimmer 3s infinite linear;
        pointer-events: none;
    }


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
        // Připojení k socket serveru pouze pokud není připojen
        if (!socketService.isConnected()) {
            socketService.connect();
        }

        // Nastavení callback funkcí
        socketService.onMatchFound((response) => {
            console.log('Match found response:', response);
            if (response.status === 'joined') {
                setIsSearching(false);
                onGameStart(response.gameId);
            }
        });

        socketService.onError((error) => {
            console.error('Matchmaking error:', error);
            setIsSearching(false);
            setError(error);
        });

        // Cleanup - NEODPOJUJEME socket při unmount
        return () => {
            if (isSearching) {
                socketService.cancelSearch();
                setIsSearching(false);
            }
        };
    }, [onGameStart]);

    const handleFindGame = () => {
        setIsSearching(true);
        setError(null);
        socketService.joinGame();
    };

    const handleCancel = () => {
        socketService.cancelSearch();
        setIsSearching(false);
    };

    return (
        <MatchmakingContainer>
            {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}
            
            {isSearching ? (
                <>
                    <SearchingText>Searching for opponent...</SearchingText>
                    <LoadingSpinner />
                    <Button onClick={handleCancel}>Cancel search</Button>
                </>
            ) : (
                <Button onClick={handleFindGame}>Find game</Button>
            )}
        </MatchmakingContainer>
    );
};

export default MatchmakingScreen;
