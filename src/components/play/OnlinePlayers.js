import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const OnlinePlayersContainer = styled.div`
    margin-top: 30px;
    background: linear-gradient(135deg, ${theme.colors.secondary} 0%, ${theme.colors.backgroundLight} 100%);
    border: 2px solid transparent;
    border-image: ${theme.colors.border.golden};
    border-image-slice: 1;
    border-radius: 8px;
    overflow: hidden;
`;

const Title = styled.h3`
    text-align: center;
    font-size: 1.5em;
    margin: 20px 0;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: ${theme.colors.text.primary};
    text-shadow: ${theme.shadows.golden};
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

const Th = styled.th`
    padding: 15px;
    text-align: left;
    background: rgba(255, 215, 0, 0.1);
    color: ${theme.colors.text.secondary};
    text-transform: uppercase;
    letter-spacing: 1px;
    border-bottom: 2px solid ${theme.colors.primary};
`;

const Td = styled.td`
    padding: 12px 15px;
    border-bottom: 1px solid ${theme.colors.backgroundLight};
    color: ${theme.colors.text.light};
`;

const Tr = styled.tr`
    transition: all 0.3s;

    &:hover {
        background: rgba(255, 215, 0, 0.05);
    }
`;

const StatusIndicator = styled.span`
    display: inline-flex;
    align-items: center;
    color: ${props => {
        switch (props.status) {
            case 'searching': return '#FFD700';
            case 'in_game': return '#4CAF50';
            default: return '#D4AF37';
        }
    }};

    &::before {
        content: '';
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 8px;
        background-color: ${props => {
            switch (props.status) {
                case 'searching': return '#FFD700';
                case 'in_game': return '#4CAF50';
                default: return '#D4AF37';
            }
        }};
    }
`;

function OnlinePlayers({ players }) {
    const getStatusText = (status) => {
        switch (status) {
            case 'searching': return 'Searching for game';
            case 'in_game': return 'In game';
            default: return 'Online';
        }
    };

    return (
        <OnlinePlayersContainer>
            <Title>Online Players</Title>
            <Table>
                <thead>
                    <tr>
                        <Th>Player</Th>
                        <Th>Rank</Th>
                        <Th>Status</Th>
                    </tr>
                </thead>
                <tbody>
                    {players.map((player) => (
                        <Tr key={player.id}>
                            <Td>{player.username}</Td>
                            <Td>{player.rank}</Td>
                            <Td>
                                <StatusIndicator status={player.status}>
                                    {getStatusText(player.status)}
                                </StatusIndicator>
                            </Td>
                        </Tr>
                    ))}
                </tbody>
            </Table>
        </OnlinePlayersContainer>
    );
}

export default OnlinePlayers;
