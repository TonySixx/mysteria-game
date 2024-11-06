import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styled, { keyframes } from 'styled-components';
import { FaEdit } from 'react-icons/fa';
import supabaseService from '../../services/supabaseService';
import { theme } from '../../styles/theme';
import priestHero from '../../assets/images/priest-hero.png';
import mageHero from '../../assets/images/mage-hero.png';
import mageAbility from '../../assets/images/mage.png';
import priestAbility from '../../assets/images/priest.png';

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
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    opacity: 0;
    animation: fadeIn 0.3s forwards;

    @keyframes fadeIn {
        to { opacity: 1; }
    }
`;

const ModalContent = styled.div`
    background: ${theme.colors.background};
    padding: 40px;
    border-radius: 15px;
    border: 2px solid ${theme.colors.border.golden};
    max-width: 900px;
    width: 90%;
    position: relative;
`;

const HeroesGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
    margin-top: 30px;
`;

const HeroCard = styled.div`
    background: ${props => props.$isMage ? 
        `linear-gradient(135deg, #050813 0%, #0d1642 100%)` : 
        `linear-gradient(135deg, #0d1a1a 0%, #1a3333 100%)`};
    border: 2px solid ${props => props.$isSelected ? theme.colors.primary : 'transparent'};
    border-radius: 15px;
    padding: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);

    &:hover {
        transform: translateY(-5px);
        box-shadow: ${props => props.$isMage ? 
            '0 8px 25px rgba(33, 150, 243, 0.1)' : 
            '0 8px 25px rgba(218, 165, 32, 0.1)'};
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, transparent, ${props => props.$isMage ? 
            'rgba(33, 150, 243, 0.03)' : 
            'rgba(218, 165, 32, 0.03)'}, transparent);
        transform: translateX(-100%);
        transition: transform 0.6s;
    }

    &:hover::before {
        transform: translateX(100%);
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
    margin-bottom: 20px;
    font-size: 1.8em;
    text-transform: uppercase;
    letter-spacing: 3px;
    text-shadow: ${theme.shadows.text};
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
        'rgba(218, 165, 32, 0.3)'};

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

export const heroImages = {
    priest: priestHero,
    mage: mageHero
};

export const heroAbilities = {
    priest: priestAbility,
    mage: mageAbility
};

function HeroSelector({ userId, currentHeroId, onHeroChange }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [heroes, setHeroes] = useState([]);
    const [selectedHero, setSelectedHero] = useState(currentHeroId);
    const [currentHero, setCurrentHero] = useState(null);

    useEffect(() => {
        const loadHeroes = async () => {
            try {
                const heroesData = await supabaseService.getHeroes();
                setHeroes(heroesData);
                const current = heroesData.find(h => h.id === currentHeroId);
                setCurrentHero(current);
            } catch (error) {
                console.error('Error loading heroes:', error);
            }
        };

        loadHeroes();
    }, [currentHeroId]);

    const handleHeroSelect = async (heroId) => {
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
    };

    const heroQuotes = {
        'Mage': "Knowledge is power, and I have plenty of both.",
        'Priest': "The Light shall bring victory!"
    };

    const modalContent = (
        <Modal>
            <ModalContent>
                <CloseButton onClick={() => setIsModalOpen(false)}>&times;</CloseButton>
                <ModalTitle>Choose Your Hero</ModalTitle>
                <HeroesGrid>
                    {heroes.map(hero => (
                        <HeroCard 
                            key={hero.id}
                            $isSelected={selectedHero === hero.id}
                            $isMage={hero.name === 'Mage'}
                            onClick={() => handleHeroSelect(hero.id)}
                        >
                            <HeroImage>
                                <img src={heroImages[hero.image]} alt={hero.name} />
                            </HeroImage>
                            <HeroName>{hero.name}</HeroName>
                            <AbilityContainer>
                                <AbilitySection $isMage={hero.name === 'Mage'}>
                                    <AbilityIcon $isMage={hero.name === 'Mage'}>
                                        <img src={heroAbilities[hero.image]} alt={hero.ability_name} />
                                    </AbilityIcon>
                                    <AbilityInfo>
                                        <HeroAbility $isMage={hero.name === 'Mage'}>
                                            <h4>{hero.ability_name}</h4>
                                            <p>{hero.ability_description}</p>
                                        </HeroAbility>
                                    </AbilityInfo>
                                    <AbilityCost>{hero.ability_cost}</AbilityCost>
                                </AbilitySection>
                            </AbilityContainer>
                            <HeroQuote $isMage={hero.name === 'Mage'}>
                                {heroQuotes[hero.name]}
                            </HeroQuote>
                        </HeroCard>
                    ))}
                </HeroesGrid>
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