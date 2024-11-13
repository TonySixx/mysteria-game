export const theme = {
    colors: {
        primary: '#FFD700', // Základní zlatá
        primaryHover: '#FFC800',
        secondary: '#2C1810', // Tmavě hnědá
        background: '#1A0F0A', // Velmi tmavě hnědá
        backgroundLight: '#382219', // Světlejší hnědá pro karty
        accent: '#8B0000', // Tmavě červená pro důležité prvky
        text: {
            primary: '#FFD700',
            secondary: '#D4AF37',
            light: '#FFF8DC'
        },
        border: {
            golden: 'linear-gradient(to right, #462523 0%, #cb9b51 22%, #f6e27a 45%, #f6f2c0 50%, #f6e27a 55%, #cb9b51 78%, #462523 100%)',
        },
        gold: '#FFD700',
        success: '#4CAF50',
        error: '#FF5252',
        premium: {
            dark: '#151b3b',    // Velmi tmavá námořnická modrá
            main: '#1b2147',    // Tmavá námořnická modrá
            light: '#212957',   // Středně tmavá námořnická modrá
            border: '#2a3573',  // Světlejší námořnická modrá pro okraj
            glow: 'rgba(41, 98, 255, 0.15)', // Jemnější modrá záře
            text: '#a5b0ff',    // Světle modrý text
            description: '#8490e8', // Světlejší modrý text
            price: '#0d1129',   // Velmi tmavá modrá pro cenovku
            priceHover: '#131a3d', // Tmavá modrá pro hover cenovky
            priceText: '#ffffff'  // Bílý text ceny
        },
        basic: {
            dark: '#2d2116',    // Tmavě hnědošedá
            main: '#382a1c',    // Hnědošedá
            light: '#443324',   // Světlejší hnědošedá
            border: '#4e3b2a',  // Světlý okraj
            text: '#d4af37',    // Zlatavý text
            description: '#b39329', // Tmavší zlatavý text
            price: '#241a11',   // Tmavá pro cenovku
            priceHover: '#2d2116', // Tmavší pro hover cenovky
            priceText: '#ffffff'  // Bílý text ceny
        }
    },
    shadows: {
        golden: '0 0 10px rgba(255, 215, 0, 0.3)',
        intense: '0 0 20px rgba(255, 215, 0, 0.5)',
        text: '2px 2px 4px rgba(0, 0, 0, 0.3)'
    },
    animations: {
        shine: 'shine 3s infinite linear',
        float: 'float 3s infinite ease-in-out'
    },
    heroes: {
        mage: {
            gradient: 'linear-gradient(135deg, #050813 0%, #0d1642 100%)',
            accent: 'rgba(33, 150, 243, 0.3)',
            text: 'rgba(179, 229, 252, 0.9)',
            quote: 'rgba(179, 229, 252, 0.7)',
            glow: 'rgba(33, 150, 243, 0.1)'
        },
        priest: {
            gradient: 'linear-gradient(135deg, #003333 0%, #006666 100%)',
            accent: 'rgba(0, 255, 255, 0.3)',
            text: 'rgba(179, 255, 255, 0.9)',
            quote: 'rgba(153, 255, 255, 0.7)',
            glow: 'rgba(0, 255, 255, 0.1)'
        },
        seer: {
            gradient: 'linear-gradient(135deg, #1a0033 0%, #4d0066 100%)',
            accent: 'rgba(255, 0, 255, 0.3)',
            text: 'rgba(255, 179, 255, 0.9)',
            quote: 'rgba(255, 204, 255, 0.7)',
            glow: 'rgba(255, 0, 255, 0.1)'
        },
        defender: {
            gradient: 'linear-gradient(135deg, #330000 0%, #660000 100%)',
            accent: 'rgba(255, 0, 0, 0.3)',
            text: 'rgba(255, 179, 179, 0.9)',
            quote: 'rgba(255, 204, 204, 0.7)',
            glow: 'rgba(255, 0, 0, 0.1)'
        },
        warrior: {
            gradient: 'linear-gradient(135deg, #2F4F2F 0%, #556B2F 100%)',
            accent: 'rgba(107, 142, 35, 0.3)',
            text: 'rgba(238, 232, 170, 0.9)',
            quote: 'rgba(238, 232, 170, 0.7)',
            glow: 'rgba(107, 142, 35, 0.1)'
        }
    }
};
