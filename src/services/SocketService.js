import io from 'socket.io-client';
import { startNextTurn, checkGameOver, playCardCommon } from '../shared/game/gameLogic';
import { attack, performAIAttacks } from '../shared/game/combatLogic';

class SocketService {
    constructor() {
        this.socket = null;
        this.gameStateCallback = null;
        this.matchFoundCallback = null;
        this.errorCallback = null;
        this.localGameState = null; // Pro optimistické aktualizace
    }

    connect() {
        this.socket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000');

        this.socket.on('connect', () => {
            console.log('Připojeno k serveru');
        });

        this.socket.on('gameState', (serverState) => {
            console.log('Received game state:', serverState); // Pro debugging
            this.localGameState = this.mergeGameStates(this.localGameState, serverState);
            
            if (this.gameStateCallback) {
                this.gameStateCallback(this.localGameState);
            }
        });

        this.socket.on('joinGameResponse', (response) => {
            if (response.status === 'joined') {
                console.log('Hra nalezena, gameId:', response.gameId);
                if (this.matchFoundCallback) {
                    this.matchFoundCallback(response);
                }
            }
        });

        this.socket.on('opponentDisconnected', () => {
            if (this.errorCallback) {
                this.errorCallback('Protihráč se odpojil');
            }
        });

        this.socket.on('error', (error) => {
            if (this.errorCallback) {
                this.errorCallback(error);
            }
        });
    }

    // Sloučení stavů s preferencí serverového stavu pro kritické údaje
    mergeGameStates(localState, serverState) {
        if (!localState) {
            console.log('Initial game state:', serverState); // Pro debugging
            return serverState;
        }

        return {
            ...localState,
            currentPlayer: serverState.currentPlayer,
            turn: serverState.turn,
            gameOver: serverState.gameOver,
            winner: serverState.winner,
            players: serverState.players.map((player, index) => ({
                ...localState.players[index],
                ...player,
                // Zachováme lokální stav pro animace a vizuální efekty
                field: this.mergeFields(localState.players[index].field, player.field),
                hand: player.hand, // Vždy použijeme serverový stav pro karty v ruce
                mana: player.mana,
                maxMana: player.maxMana
            }))
        };
    }

    mergeFields(localField, serverField) {
        return serverField.map(serverCard => {
            const localCard = localField.find(c => c.id === serverCard.id);
            return {
                ...serverCard,
                // Zachováme lokální animační stavy
                isAnimating: localCard?.isAnimating || false,
                visualEffects: localCard?.visualEffects || []
            };
        });
    }

    // Herní akce
    playCard(cardData) {
        // Optimistická aktualizace
        if (this.localGameState) {
            this.localGameState = playCardCommon(
                this.localGameState, 
                this.localGameState.currentPlayer, 
                cardData.cardIndex
            );
            this.gameStateCallback?.(this.localGameState);
        }

        // Odeslání na server
        this.socket.emit('playCard', cardData);
    }

    attack(attackData) {
        // Optimistická aktualizace
        if (this.localGameState) {
            this.localGameState = attack(
                attackData.attackerIndex,
                attackData.targetIndex,
                attackData.isHeroTarget,
                false
            )(this.localGameState);
            this.gameStateCallback?.(this.localGameState);
        }

        // Odeslání na server
        this.socket.emit('attack', attackData);
    }

    endTurn() {
        // Optimistická aktualizace
        if (this.localGameState) {
            const nextPlayer = (this.localGameState.currentPlayer + 1) % 2;
            this.localGameState = startNextTurn(this.localGameState, nextPlayer);
            this.gameStateCallback?.(this.localGameState);
        }

        this.socket.emit('endTurn');
    }

    // Připojení do hry
    joinGame() {
        this.socket.emit('joinGame');
    }

    cancelSearch() {
        this.socket.emit('cancelSearch');
    }

    // Callback registrace
    onGameState(callback) {
        this.gameStateCallback = callback;
    }

    onMatchFound(callback) {
        this.matchFoundCallback = callback;
    }

    onError(callback) {
        this.errorCallback = callback;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.localGameState = null;
        }
    }
}

const socketService = new SocketService();
export default socketService;
