import React from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../styles/theme';

const fadeIn = keyframes`
  from { opacity: 0; transform: translate(-50%, -70%); }
  to { opacity: 1; transform: translate(-50%, -50%); }
`;

const fadeOut = keyframes`
  from { opacity: 1; transform: translate(-50%, -50%); }
  to { opacity: 0; transform: translate(-50%, -70%); }
`;

const StatusContainer = styled.div`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
    padding: 15px 25px;
    border-radius: 8px;
    background: ${props => props.$isError ? 'rgba(139, 0, 0, 0.95)' : 'rgba(0, 100, 0, 0.95)'};
    color: white;
    font-weight: bold;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    gap: 10px;
    animation: ${props => props.$show ? fadeIn : fadeOut} 0.3s ease-in-out forwards;
    max-width: 90%;
    text-align: center;
`;

const Dot = styled.div`
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${props => props.$isError ? theme.colors.accent : '#4CAF50'};
    animation: ${props => props.$pulse ? 'pulseIntense 1.5s infinite' : 'none'};

    @keyframes pulseIntense {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.2); opacity: 0.5; }
        100% { transform: scale(1); opacity: 1; }
    }
`;

const Message = styled.span`
    font-size: 1.1em;
    letter-spacing: 0.5px;
`;

const ConnectionStatus = ({ isConnected, show }) => {
    if (!show) return null;

    return (
        <StatusContainer $isError={!isConnected} $show={show}>
            <Dot $isError={!isConnected} $pulse={!isConnected} />
            <Message>
                {!isConnected 
                    ? "Server connection lost. Please try again later..." 
                    : "Connected to server successfully!"}
            </Message>
        </StatusContainer>
    );
};

export default ConnectionStatus; 