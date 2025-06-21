import config from '../config';

class PingService {
    constructor() {
        this.intervalId = null;
        this.isActive = false;
        // Konfiguratelný interval - defaultně 3 minuty, může být přepsán environment variable
        const pingIntervalMinutes = 3;
        this.pingInterval = pingIntervalMinutes * 60 * 1000; // konverze na milisekundy
    }

    start() {
        // Spustíme ping pouze v produkci
        if (process.env.NODE_ENV !== 'production') {
            console.log('Ping service disabled in development mode');
            return;
        }

        if (this.isActive) {
            console.log('Ping service is already running');
            return;
        }

        const intervalMinutes = this.pingInterval / (60 * 1000);
        console.log(`Starting ping service - server will be pinged every ${intervalMinutes} minutes`);
        this.isActive = true;

        // Pošleme první ping ihned
        this.sendPing();

        // Nastavíme interval pro ping
        this.intervalId = setInterval(() => {
            this.sendPing();
        }, this.pingInterval);
    }

    stop() {
        if (!this.isActive) {
            return;
        }

        console.log('Stopping ping service');
        this.isActive = false;

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    async sendPing() {
        try {
            const response = await fetch(`${config.API_URL}/api/ping`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`Ping successful: ${data.message} at ${data.timestamp}`);
            } else {
                console.warn('Ping failed with status:', response.status);
            }
        } catch (error) {
            console.error('Ping request failed:', error.message);
        }
    }

    isRunning() {
        return this.isActive;
    }
}

const pingService = new PingService();
export default pingService; 