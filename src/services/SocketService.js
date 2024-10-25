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

    isConnected() {
        return this.socket?.connected || false;
    }

    connect() {
        if (this.isConnected()) {
            console.log('Socket je již připojen');
            return;
        }

        console.log('Připojuji k serveru:', process.env.REACT_APP_SERVER_URL);
        this.socket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            autoConnect: true
        });

        this.setupSocketListeners();
    }

    setupSocketListeners() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('Připojeno k serveru, socket ID:', this.socket.id);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Chyba připojení:', error);
            if (this.errorCallback) {
                this.errorCallback('Nepodařilo se připojit k serveru');
            }
        });

        this.socket.on('gameState', (serverState) => {
            console.log('Přijat herní stav:', serverState);
            if (this.gameStateCallback) {
                this.gameStateCallback(serverState);
            }
        });

        this.socket.on('joinGameResponse', (response) => {
            console.log('Přijata odpověď na připojení do hry:', response);
            if (response.status === 'joined' && this.matchFoundCallback) {
                this.matchFoundCallback(response);
            }
        });

        this.socket.on('opponentDisconnected', () => {
            console.log('Protihráč se odpojil');
            if (this.errorCallback) {
                this.errorCallback('Protihráč se odpojil');
            }
        });

        this.socket.on('error', (error) => {
            console.error('Chyba ze serveru:', error);
            if (this.errorCallback) {
                this.errorCallback(error);
            }
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Odpojeno od serveru, důvod:', reason);
            if (reason === 'io server disconnect') {
                // Server nás odpojil, zkusíme se znovu připojit
                this.socket.connect();
            }
        });
    }

    joinGame() {
        if (!this.socket?.connected) {
            console.error('Socket není připojen');
            if (this.errorCallback) {
                this.errorCallback('Není připojení k serveru');
            }
            return;
        }

        console.log('Odesílám požadavek na připojení do hry');
        this.socket.emit('joinGame');
    }

    cancelSearch() {
        if (this.socket?.connected) {
            console.log('Ruším hledání hry');
            this.socket.emit('cancelSearch');
        }
    }

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
            console.log('Odpojuji socket');
            this.socket.disconnect();
            this.socket = null;
            this.localGameState = null;
        }
    }

    // Herní akce
    playCard(cardData) {
        if (!this.socket?.connected) return;
        console.log('Hraji kartu:', cardData);
        this.socket.emit('playCard', cardData);
    }

    attack(attackData) {
        if (!this.socket?.connected) return;
        console.log('Útočím:', attackData);
        this.socket.emit('attack', attackData);
    }

    endTurn() {
        if (!this.socket?.connected) return;
        console.log('Končím tah');
        this.socket.emit('endTurn');
    }
}

const socketService = new SocketService();
export default socketService;
