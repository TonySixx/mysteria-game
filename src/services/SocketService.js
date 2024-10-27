import io from 'socket.io-client';


const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';

class SocketService {
    constructor() {
        this.socket = null;
        this.gameStateCallback = null;
        this.matchFoundCallback = null;
        this.errorCallback = null;
        this.localGameState = null; // Pro optimistické aktualizace
        this.serverUrl = SERVER_URL;
        this.userId = null;
        this.userProfile = null;
        this.token = null; // Přidáme property pro JWT token
        this.autoConnect = true; // Změníme na true pro automatické připojení
    }

    isConnected() {
        return this.socket?.connected || false;
    }

    async connect() {
        if (this.socket?.connected) {
            console.log('Socket je již připojen');
            return true;
        }

        if (!this.token || !this.userId || !this.userProfile) {
            console.error('Chybí autentizační údaje:', {
                token: !!this.token,
                userId: !!this.userId,
                userProfile: !!this.userProfile
            });
            return false;
        }

        return new Promise((resolve) => {
            this.socket = io(this.serverUrl, {
                auth: {
                    token: this.token,
                    userId: this.userId,
                    username: this.userProfile.username
                },
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            });

            this.socket.on('connect', () => {
                console.log('Socket připojen');
                resolve(true);
            });

            this.socket.on('connect_error', (error) => {
                console.error('Chyba připojení socketu:', error);
                resolve(false);
            });

            this.setupSocketListeners();
        });
    }

    setupSocketListeners() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('Socket připojen');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Chyba připojení socketu:', error);
            if (this.errorCallback) {
                this.errorCallback('Chyba připojení k serveru');
            }
        });

        this.socket.on('gameState', (state) => {
            if (this.gameStateCallback) {
                this.gameStateCallback(state);
            }
        });

        this.socket.on('joinGameResponse', (response) => {
            if (this.matchFoundCallback) {
                this.matchFoundCallback(response);
            }
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
            if (this.errorCallback) {
                this.errorCallback(error);
            }
        });

        this.socket.on('disconnect', () => {
            console.log('Socket odpojen');
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

        if (!this.userId) {
            console.error('Uživatel není přihlášen');
            if (this.errorCallback) {
                this.errorCallback('Pro hraní se musíte přihlásit');
            }
            return;
        }

        console.log('Odesílám požadavek na připojení do hry');
        this.socket.emit('joinGame', {
            userId: this.userId,
            username: this.userProfile?.username
        });
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

    setUserData(userId, userProfile) {
        this.userId = userId;
        this.userProfile = userProfile;
    }

    // Přidáme metodu pro nastavení autentizačních údajů
    setAuthData(token, userId, userProfile) {
        console.log('Nastavuji auth data:', { token: !!token, userId, profile: userProfile });
        this.token = token;
        this.userId = userId;
        this.userProfile = userProfile;
        
        if (token && userId && userProfile && this.autoConnect) {
            this.connect();
        } else if (!token || !userId || !userProfile) {
            this.disconnect();
        }
    }

    subscribeToOnlinePlayers(callback) {
        if (!this.socket) {
            console.warn('Socket není inicializován, nelze se přihlásit k odběru online hráčů');
            return;
        }
        
        // Nejprve se odhlásíme od předchozího odběru
        this.unsubscribeFromOnlinePlayers();
        
        console.log('Subscribing to online players updates');
        
        // Uložíme callback pro pozdější odhlášení
        this.onlinePlayersCallback = callback;
        
        this.socket.on('online_players_update', (players) => {
            console.log('Received online players update:', {
                socketId: this.socket.id,
                players
            });
            this.onlinePlayersCallback(players);
        });
    }

    unsubscribeFromOnlinePlayers() {
        if (!this.socket) {
            console.warn('Socket není inicializován, nelze se odhlásit z odběru online hráčů');
            return;
        }
        if (this.onlinePlayersCallback) {
            this.socket.off('online_players_update');
            this.onlinePlayersCallback = null;
        }
    }
}

const socketService = new SocketService();
export default socketService;
