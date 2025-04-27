import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../../styles/theme';
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';

const fadeIn = keyframes`
    0% { opacity: 0; }
    100% { opacity: 1; }
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
    z-index: 1001;
    animation: ${fadeIn} 0.3s forwards;
    padding: 20px;
`;

const ModalContent = styled.div`
    background: linear-gradient(135deg, rgba(20, 10, 6, 0.98) 0%, rgba(28, 15, 8, 0.98) 100%);
    padding: 40px;
    border-radius: 20px;
    border: 2px solid ${theme.colors.border.golden};
    width: 95%;
    max-width: 1000px;
    max-height: 95vh;
    position: relative;
    overflow-y: auto;
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
`;

const TutorialTitle = styled.h2`
    font-family: 'MedievalSharp', cursive;
    color: ${theme.colors.text.primary};
    text-align: center;
    margin-bottom: 30px;
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
    background: transparent;
    border: none;
    color: ${theme.colors.text.primary};
    font-size: 1.5em;
    cursor: pointer;
    z-index: 10;
    transition: all 0.3s ease;

    &:hover {
        color: ${theme.colors.primary};
        transform: scale(1.1);
    }
`;

const TutorialContent = styled.div`
    color: ${theme.colors.text.secondary};
    font-family: 'Crimson Pro', serif;
    font-size: 1.2em;
    line-height: 1.6;
    margin-bottom: 40px;
    text-align: center;
`;

const StepIndicator = styled.div`
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
`;

const Step = styled.div`
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin: 0 5px;
    background-color: ${props => 
        props.$active ? theme.colors.primary : 'rgba(255, 215, 0, 0.3)'};
    transition: all 0.3s ease;
`;

const NavigationContainer = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 30px;
`;

const NavigationButton = styled.button`
    background: linear-gradient(45deg, ${theme.colors.secondary}, ${theme.colors.backgroundLight});
    border: 2px solid transparent;
    border-image: ${theme.colors.border.golden};
    border-image-slice: 1;
    color: ${theme.colors.text.primary};
    padding: 10px 20px;
    cursor: pointer;
    font-size: 1em;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${theme.shadows.golden};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }
`;

const FinishButton = styled(NavigationButton)`
    background: linear-gradient(45deg, ${theme.colors.primary}, ${theme.colors.secondary});
`;

const ImageContainer = styled.div`
    margin: 20px 0;
    text-align: center;
    
    img {
        max-width: 100%;
        max-height: 300px;
        border-radius: 10px;
        border: 2px solid ${theme.colors.border.golden};
        box-shadow: ${theme.shadows.golden};
    }
`;

const tutorialSteps = [
    {
        title: "Welcome to Mysteria",
        content: "Welcome to the magical world of Mysteria! This game combines strategy, card collecting, and battles against other players. In this short guide, we'll show you the basics of the game.",
        image: null
    },
    {
        title: "Creating a Deck",
        content: "To play, you need a deck of cards. Click on the 'Decks' tab and create your first deck using the 'Create New Deck' button. Choose cards you want to add to your deck and don't forget to activate it.",
        image: null
    },
    {
        title: "Starting a Game",
        content: "After creating your deck, return to the 'Play' tab. Here you can choose between playing against a computer or against another player online. For beginners, we recommend playing against the computer first.",
        image: null
    },
    {
        title: "Battle Process",
        content: "In the game, you start with 30 health and cards in your deck. Each turn you get one additional mana (up to a maximum of 10) and draw one card. Place units, cast spells, and attack the enemy until you reduce their health to 0.",
        image: null
    },
    {
        title: "Profile and Rewards",
        content: "In the 'Profile' tab, you'll find your game profile with statistics and your card collection. By playing, you earn gold which you can use to buy new card packs and expand your collection.",
        image: null
    },
    {
        title: "Leaderboard",
        content: "In the 'Leaderboard' tab, you'll find a ranking of the best players. Play online against other players and climb up the leaderboard!",
        image: null
    },
    {
        title: "You're Ready!",
        content: "Now you know the basics of Mysteria! Explore the game, create decks, and battle with other players. Good luck on your path to glory!",
        image: null
    }
];

const TutorialGuide = ({ userId, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    
    const handleNextStep = () => {
        if (currentStep < tutorialSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };
    
    const handlePrevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };
    
    const handleFinish = async () => {
        // Save tutorial completion status to localStorage
        localStorage.setItem(`tutorial_completed_${userId}`, 'true');
        onClose();
    };
    
    return (
        <Modal>
            <ModalContent>
                <CloseButton onClick={handleFinish}>
                    <FaTimes />
                </CloseButton>
                <TutorialTitle>{tutorialSteps[currentStep].title}</TutorialTitle>
                
                <StepIndicator>
                    {tutorialSteps.map((_, index) => (
                        <Step key={index} $active={index === currentStep} />
                    ))}
                </StepIndicator>
                
                <TutorialContent>
                    {tutorialSteps[currentStep].content}
                </TutorialContent>
                
                {tutorialSteps[currentStep].image && (
                    <ImageContainer>
                        <img src={tutorialSteps[currentStep].image} alt="Tutorial" />
                    </ImageContainer>
                )}
                
                <NavigationContainer>
                    <NavigationButton 
                        onClick={handlePrevStep} 
                        disabled={currentStep === 0}
                    >
                        <FaChevronLeft /> Previous
                    </NavigationButton>
                    
                    {currentStep < tutorialSteps.length - 1 ? (
                        <NavigationButton onClick={handleNextStep}>
                            Next <FaChevronRight />
                        </NavigationButton>
                    ) : (
                        <FinishButton onClick={handleFinish}>
                            Finish
                        </FinishButton>
                    )}
                </NavigationContainer>
            </ModalContent>
        </Modal>
    );
};

export default TutorialGuide; 