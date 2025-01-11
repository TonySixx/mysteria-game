import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom';
import styled, { keyframes } from 'styled-components';
import { FaEdit, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import supabaseService from '../../services/supabaseService';
import { theme } from '../../styles/theme';
import priestHero from '../../assets/images/priest-hero.png';
import mageHero from '../../assets/images/fire-mage-hero.png';
import mageAbility from '../../assets/images/mage.png';
import priestAbility from '../../assets/images/priest.png';
import seerHero from '../../assets/images/seer-hero.png';
import seerAbility from '../../assets/images/seer.png';
import defenderHero from '../../assets/images/defender-hero.png';
import defenderAbility from '../../assets/images/defender.png';
import warriorHero from '../../assets/images/warrior-hero.png';
import warriorAbility from '../../assets/images/warrior.png';
import frostMageHero from '../../assets/images/frost-mage-hero.png';
import frostMageAbility from '../../assets/images/frost-mage.png';

const glowAnimation = keyframes`
    0% { box-shadow: 0 0 5px ${theme.colors.primary}; }
    50% { box-shadow: 0 0 20px ${theme.colors.primary}; }
    100% { box-shadow: 0 0 5px ${theme.colors.primary}; }
`;

const HeroPortrait = styled.div`
    position: relative;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    border: 3px solid ${theme.colors.primary};
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-left: 20px;
    display: inline-block;
    vertical-align: middle;

    &:hover {
        animation: ${glowAnimation} 2s infinite;
        
        .edit-icon {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }

        &::after {
            opacity: 0.7;
        }
    }

    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`;

const EditIcon = styled(FaEdit)`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.8);
    color: ${theme.colors.primary};
    z-index: 2;
    opacity: 0;
    transition: all 0.3s ease;
    font-size: 24px;
`;

const Modal = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.95) 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    opacity: 0;
    animation: fadeIn 0.3s forwards;
    padding: 20px;

    @keyframes fadeIn {
        to { opacity: 1; }
    }
`;

const darkenGradient = (gradient) => {
    return gradient.replace(
        /(\d+\.?\d*%)/g, 
        (match) => `${Math.max(0, parseInt(match) - 15)}%`
    );
};

const ModalContent = styled.div`
    background: ${props => {
        const heroType = props.$activeHero?.toLowerCase();
        if (!heroType) return `linear-gradient(to bottom, 
            rgba(0, 0, 0, 0.95) 0%,
            rgba(0, 0, 0, 0.98) 100%)`;

        const baseGradient = theme.heroes[heroType].gradient;
        const darkGradient = baseGradient
            .replace('135deg', 'circle at center')
            .replace(/\d+%/g, match => `${Math.max(0, parseInt(match) - 25)}%`)
            .replace(/(#[0-9a-f]{6}|rgba?\([^)]+\))/gi, color => {
                if (color.startsWith('#')) {
                    return color + '99';
                }
                return color.replace(')', ', 0.6)');
            });
        
        return `
            radial-gradient(
                circle at center,
                ${darkGradient}
            ),
            linear-gradient(
                to bottom,
                rgba(0, 0, 0, 0.95) 0%,
                rgba(0, 0, 0, 0.98) 100%
            )
        `;
    }};
    padding: 40px;
    border-radius: 20px;
    border: 2px solid ${theme.colors.border.golden};
    width: 95%;
    max-width: 1400px;
    max-height: 95vh;
    position: relative;
    overflow: hidden;
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.5),
                inset 0 0 100px rgba(0, 0, 0, 0.2);
    transition: all 0.5s ease;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 100px;
        background: linear-gradient(to bottom, 
            rgba(0, 0, 0, 0.4) 0%,
            transparent 100%);
        pointer-events: none;
    }

    &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 200px;
        background: linear-gradient(to top, 
            ${props => {
                const heroType = props.$activeHero?.toLowerCase();
                if (!heroType) return 'rgba(0, 0, 0, 0.8)';
                return `${theme.heroes[heroType].accent.replace('0.3', '0.15')}`;
            }} 0%,
            transparent 100%);
        pointer-events: none;
        opacity: 0.8;
    }
`;

const HeroesContainer = styled.div`
    position: relative;
    width: 100%;
    overflow: hidden;
    padding: 0 40px;
    margin: 20px 0;
`;

const NavigationContainer = styled.div`
    display: flex;
    justify-content: center;
    gap: 20px;
`;

const HeroesSlider = styled.div`
    display: flex;
    transition: ${props => props.$isTransitioning ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'};
    transform: translateX(calc(50% - ${props => (props.$currentSlide + 2) * 395}px - 150px));
    gap: 40px;
    padding: 20px 0;
    position: relative;
    left: -70px;
}
`;

const HeroCard = styled.div`
    flex: 0 0 300px;
    width: 300px;
    background: ${props => theme.heroes[props.$heroType.toLowerCase()].gradient};
    border: ${props => props.$isSelected ? 
        `3px solid ${theme.colors.primary}` : 
        '3px solid transparent'};
    border-radius: 15px;
    padding: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    box-shadow: ${props => props.$isSelected ? 
        `0 0 20px ${theme.colors.primary}40` : 
        '0 4px 15px rgba(0, 0, 0, 0.5)'};
    transform: ${props => props.$isActive ? 'scale(1)' : 'scale(0.8)'};
    opacity: ${props => props.$isActive ? '1' : '0.5'};
    filter: ${props => props.$isActive ? 'blur(0)' : 'blur(2px)'};

    &:hover {
        transform: ${props => props.$isActive ? 'scale(1.05)' : 'scale(0.85)'};
        box-shadow: 0 8px 25px ${props => theme.heroes[props.$heroType.toLowerCase()].glow};
        opacity: ${props => props.$isActive ? '1' : '0.7'};
        filter: blur(0);
    }
`;

const HeroImage = styled.div`
    width: 100%;
    height: 300px;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 20px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: top center;
    }
`;

const HeroName = styled.h3`
    font-family: 'MedievalSharp', cursive;
    color: ${theme.colors.text.primary};
    font-size: 1.8em;
    margin-bottom: 15px;
    text-align: center;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const HeroAbility = styled.div`
    color: ${theme.colors.text.secondary};
    text-align: center;
    
    h4 {
        font-family: 'Cinzel', serif;
        color: ${theme.colors.text.primary};
        margin-bottom: 8px;
        font-size: 1.2em;
        letter-spacing: 1px;
    }

    p {
        font-family: 'Crimson Pro', serif;
        font-size: 1em;
        line-height: 1.4;
        color: ${props => props.$isMage ? 
            'rgba(179, 229, 252, 0.9)' : 
            'rgba(255, 223, 186, 0.9)'};
    }
`;

const ModalTitle = styled.h2`
    font-family: 'MedievalSharp', cursive;
    color: ${theme.colors.text.primary};
    text-align: center;
    margin-bottom: 30px;
    margin-top:0px;
    font-size: 2.5em;
    text-transform: uppercase;
    letter-spacing: 3px;
    text-shadow: ${theme.shadows.text},
                 0 0 20px ${theme.colors.primary}40;
    position: relative;
    padding-bottom: 15px;

    &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 150px;
        height: 3px;
        background: ${theme.colors.border.golden};
    }
`;

const CloseButton = styled.button`
    position: absolute;
    top: 20px;
    right: 20px;
    background: none;
    border: none;
    color: ${theme.colors.text.primary};
    font-size: 1.5em;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        color: ${theme.colors.primary};
        transform: rotate(90deg);
    }
`;

const HeroQuote = styled.div`
    font-family: 'Crimson Pro', serif;
    font-style: italic;
    font-size: 0.9em;
    color: ${props => props.$isMage ? 
        'rgba(179, 229, 252, 0.7)' : 
        'rgba(255, 223, 186, 0.7)'};
    text-align: center;
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid ${props => props.$isMage ? 
        'rgba(33, 150, 243, 0.2)' : 
        'rgba(218, 165, 32, 0.2)'};

    &::before {
        content: '"';
        font-size: 1.2em;
    }

    &::after {
        content: '"';
        font-size: 1.2em;
    }
`;

const AbilitySection = styled.div`
    display: flex;
    align-items: center;
    gap: 15px;
    margin-top: 20px;
    padding: 15px;
    background: ${props => props.$isMage ? 
        'rgba(13, 22, 66, 0.5)' : 
        'rgba(26, 51, 51, 0.5)'};
    border-radius: 10px;
`;

const AbilityIcon = styled.div`
    width: 50px;
    height: 50px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
    border: 2px solid ${props => props.$isMage ? 
        'rgba(33, 150, 243, 0.3)' : 
        'rgba(150, 150, 150, 0.3)'};

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`;

const AbilityInfo = styled.div`
    flex-grow: 1;
`;

const AbilityCost = styled.div`
    position: absolute;
    top: -10px;
    left: -10px;
    width: 30px;
    height: 30px;
    background: ${theme.colors.primary};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: ${theme.colors.background};
    border: 2px solid ${theme.colors.background};
`;

const AbilityContainer = styled.div`
    position: relative;
    margin-top: 30px;
`;

const NavigationButton = styled.button`
    background: rgba(0, 0, 0, 0.7);
    border: 2px solid ${theme.colors.primary};
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    color: ${theme.colors.primary};
    position: relative;
    z-index: 2;

    &:hover {
        background: rgba(0, 0, 0, 0.9);
        transform: scale(1.1);
        box-shadow: 0 0 15px ${theme.colors.primary}40;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        &:hover {
            transform: none;
        }
    }

    svg {
        font-size: 20px;
    }

    &:active {
        transform: scale(0.95);
    }

    &:focus {
        outline: none;
        box-shadow: 0 0 0 2px ${theme.colors.primary}40;
    }
`;

export const heroImages = {
    priest: priestHero,
    mage: mageHero,
    seer: seerHero,
    defender: defenderHero,
    warrior: warriorHero,
    frostmage: frostMageHero
};

export const heroAbilities = {
    priest: priestAbility,
    mage: mageAbility,
    seer: seerAbility,
    defender: defenderAbility,
    warrior: warriorAbility,
    frostmage: frostMageAbility
};

function HeroSelector({ userId, currentHeroId, onHeroChange }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [heroes, setHeroes] = useState([]);
    const [selectedHero, setSelectedHero] = useState(currentHeroId);
    const [currentHero, setCurrentHero] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const extendedHeroes = useMemo(() => {
        if (heroes.length === 0) return [];
        return [
            ...heroes.slice(-2),
            ...heroes,
            ...heroes.slice(0, 2)
        ];
    }, [heroes]);

    useEffect(() => {
        const loadHeroes = async () => {
            try {
                const heroesData = await supabaseService.getHeroes();
                const selectedHeroIndex = heroesData.findIndex(h => h.id === currentHeroId);
                setHeroes(heroesData);
                setCurrentSlide(selectedHeroIndex);
                const current = heroesData.find(h => h.id === currentHeroId);
                setCurrentHero(current);
            } catch (error) {
                console.error('Error loading heroes:', error);
            }
        };

        loadHeroes();
    }, [currentHeroId]);

    useEffect(() => {
        if (isModalOpen) {
            const selectedHeroIndex = heroes.findIndex(h => h.id === selectedHero);
            setCurrentSlide(selectedHeroIndex);
        }
    }, [isModalOpen, heroes, selectedHero]);

    const handlePrevSlide = useCallback(() => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        
        if (currentSlide === 0) {
            setIsTransitioning(false);
            setCurrentSlide(heroes.length);
            
            setTimeout(() => {
                setIsTransitioning(true);
                setCurrentSlide(heroes.length - 1);
            }, 50);
        } else {
            setCurrentSlide(prev => prev - 1);
        }
        
        setTimeout(() => setIsTransitioning(false), 500);
    }, [isTransitioning, currentSlide, heroes.length]);

    const handleNextSlide = useCallback(() => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        
        if (currentSlide === heroes.length - 1) {
            setIsTransitioning(false);
            setCurrentSlide(-1);
            
            setTimeout(() => {
                setIsTransitioning(true);
                setCurrentSlide(0);
            }, 50);
        } else {
            setCurrentSlide(prev => prev + 1);
        }
        
        setTimeout(() => setIsTransitioning(false), 500);
    }, [isTransitioning, currentSlide, heroes.length]);

    const handleHeroSelect = useCallback(async (heroId) => {
        try {
            await supabaseService.updateProfile(userId, { hero_id: heroId });
            setSelectedHero(heroId);
            const newHero = heroes.find(h => h.id === heroId);
            setCurrentHero(newHero);
            onHeroChange?.(newHero);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error updating hero:', error);
        }
    }, [userId, heroes, onHeroChange]);

    const heroQuotes = {
        'Fire Mage': "Knowledge is power, and I have plenty of both.",
        'Priest': "The Light shall bring victory!",
        'Seer': "I see your future... and it's going to cost you 2 mana.",
        'Defender': "Hide behind me! No, seriously, that's literally my job.",
        'Warrior': "I don't always hit things... but when I do, I hit them harder!",
        'Frost Mage': "Winter is coming... and it's going to freeze your board!"
    };

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (!isModalOpen) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    handlePrevSlide();
                    break;
                case 'ArrowRight':
                    handleNextSlide();
                    break;
                case 'Enter':
                    const currentHero = heroes[currentSlide];
                    if (currentHero) {
                        handleHeroSelect(currentHero.id);
                    }
                    break;
                case 'Escape':
                    setIsModalOpen(false);
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [isModalOpen, currentSlide, heroes, handlePrevSlide, handleNextSlide, handleHeroSelect]);

    const modalContent = (
        <Modal>
            <ModalContent $activeHero={heroes[currentSlide]?.image}>
                <CloseButton onClick={() => setIsModalOpen(false)}>&times;</CloseButton>
                <ModalTitle>Choose Your Hero</ModalTitle>
                <NavigationContainer>
                    <NavigationButton onClick={handlePrevSlide}>
                        <FaChevronLeft />
                    </NavigationButton>
                    <NavigationButton onClick={handleNextSlide}>
                        <FaChevronRight />
                    </NavigationButton>
                </NavigationContainer>
                <HeroesContainer>
                    <HeroesSlider 
                        $currentSlide={currentSlide}
                        $isTransitioning={isTransitioning}
                    >
                        {extendedHeroes.map((hero, index) => (
                            <HeroCard 
                                key={`${hero.id}-${index}`}
                                $isSelected={selectedHero === hero.id}
                                $heroType={hero.image}
                                $isActive={index - 2 === currentSlide}
                                onClick={() => handleHeroSelect(hero.id)}
                            >
                                <HeroImage>
                                    <img src={heroImages[hero.image]} alt={hero.name} />
                                </HeroImage>
                                <HeroName>{hero.name}</HeroName>
                                <AbilityContainer>
                                    <AbilitySection $isMage={false}>
                                        <AbilityIcon $isMage={false}>
                                            <img src={heroAbilities[hero.image]} alt={hero.ability_name} />
                                        </AbilityIcon>
                                        <AbilityInfo>
                                            <HeroAbility $isMage={false}>
                                                <h4>{hero.ability_name}</h4>
                                                <p>{hero.ability_description}</p>
                                            </HeroAbility>
                                        </AbilityInfo>
                                        <AbilityCost>{hero.ability_cost}</AbilityCost>
                                    </AbilitySection>
                                </AbilityContainer>
                                <HeroQuote $isMage={false}>
                                    {heroQuotes[hero.name]}
                                </HeroQuote>
                            </HeroCard>
                        ))}
                    </HeroesSlider>
                </HeroesContainer>
            </ModalContent>
        </Modal>
    );

    return (
        <>
            <HeroPortrait onClick={() => setIsModalOpen(true)}>
                {currentHero && <img src={heroImages[currentHero.image]} alt={currentHero.name} />}
                <EditIcon className="edit-icon" />
            </HeroPortrait>

            {isModalOpen && ReactDOM.createPortal(
                modalContent,
                document.body
            )}
        </>
    );
}

export default HeroSelector; 