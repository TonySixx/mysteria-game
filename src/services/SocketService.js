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
        this.connectionPromise = null; // Přidáme pro sledování stavu připojení
        this.connectCallback = null;
        this.disconnectCallback = null;
    }

    isConnected() {
        return this.socket?.connected || false;
    }

    async connect() {
        // Pokud již probíhá připojování, vrátíme existující Promise
        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        // Pokud je socket již připojen, vrátíme true
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

        this.connectionPromise = new Promise((resolve) => {
            if (this.socket) {
                this.socket.disconnect();
                this.socket = null;
            }

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
                this.connectionPromise = null;
                resolve(true);
            });

            this.socket.on('connect_error', (error) => {
                console.error('Chyba připojení socketu:', error);
                this.connectionPromise = null;
                resolve(false);
            });

            this.setupSocketListeners();
        });

        return this.connectionPromise;
    }

    setupSocketListeners() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('Socket připojen');
            if (this.connectCallback) {
                this.connectCallback();
            }
        });

        this.socket.on('disconnect', () => {
            console.log('Socket odpojen');
            if (this.disconnectCallback) {
                this.disconnectCallback();
            }
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

        this.socket.on('gameStarted', (gameId) => {
            console.log('Game started:', gameId);
            // Aktualizujeme lokální stav
            if (this.userProfile) {
                this.socket.emit('gameStarted', gameId); // Potvrdíme serveru, že jsme připraveni
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
        console.log('SocketService - Subscribing to online players with callback:', !!callback);
        this.onlinePlayersCallback = callback;

        if (!this.socket?.connected) {
            console.warn('Socket není připojen, pokusím se připojit...');
            this.connect().then((connected) => {
                if (connected) {
                    console.log('SocketService - Connected, setting up listener');
                    this.setupOnlinePlayersListener();
                } else {
                    console.error('SocketService - Failed to connect');
                }
            });
            return;
        }

        this.setupOnlinePlayersListener();
    }

    setupOnlinePlayersListener() {
        if (!this.socket) {
            console.error('SocketService - No socket available');
            return;
        }

        console.log('SocketService - Setting up online players listener');
        
        // Nejprve odstraníme existující listener
        this.socket.off('online_players_update');
        
        // Přidáme nový listener
        this.socket.on('online_players_update', (data) => {
            console.log('SocketService - Received raw data:', data);
            
            // Kontrola, zda data obsahují pole players
            const players = data.players || data;
            
            console.log('SocketService - Processed players:', players);
            
            if (this.onlinePlayersCallback) {
                console.log('SocketService - Calling callback');
                this.onlinePlayersCallback(players);
            } else {
                console.warn('SocketService - No callback registered');
            }
        });

        // Vyžádáme si aktuální seznam hráčů
        console.log('SocketService - Requesting online players list');
        this.socket.emit('request_online_players');
    }

    unsubscribeFromOnlinePlayers() {
        if (this.socket) {
            this.socket.off('online_players_update');
        }
        this.onlinePlayersCallback = null;
    }

    onConnect(callback) {
        this.connectCallback = callback;
    }

    onDisconnect(callback) {
        this.disconnectCallback = callback;
    }
}

const socketService = new SocketService();
export default socketService;
