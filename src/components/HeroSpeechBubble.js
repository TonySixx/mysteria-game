import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSound } from 'use-sound';
import mageSpeech from "../assets/sounds/mage_speech.mp3";
import defenderSpeech from "../assets/sounds/defender_speech.mp3";
import priestSpeech from "../assets/sounds/priest_speech.mp3";
import seerSpeech from "../assets/sounds/seer_speech.mp3";
import warriorSpeech from "../assets/sounds/warrior_speech.mp3";

const heroStartQuotes = {
    'mage': "Time to make things disappear... permanently!",
    'priest': "Let's heal... your defeat!",
    'seer': "I already saw you lose!",
    'defender': "Stand behind me... or else!",
    'warrior': "Strength needs no strategy!"
};

const SpeechBubbleContainer = styled.div`
  position: absolute;
  top: ${props => props.$isPlayer ? '-80px' : 'calc(100% + 20px)'};
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(to bottom, #ffffff, #f0f0f0);
  padding: 20px;
  border-radius: 25px;
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.2),
    inset 0 0 10px rgba(255, 255, 255, 0.5);
  max-width: 250px;
  border: 2px solid #d4d4d4;
  font-family: 'Cinzel', serif;
  font-size: 16px;
  color: #000000;
  text-align: center;
  font-weight: 700;
  letter-spacing: 0.5px;
  line-height: 1.4;
  text-shadow: 0.5px 0.5px 0px rgba(0, 0, 0, 0.2);
  pointer-events: none;
  opacity: 0;
  animation: ${props => props.$isVisible ? 'showBubble 3s forwards' : 'none'};

  &:after {
    content: '';
    position: absolute;
    left: 50%;
    width: 20px;
    height: 20px;
    background: linear-gradient(135deg, 
      #ffffff 0%,
      #f0f0f0 100%
    );
    transform: translateX(-50%) rotate(45deg);
    border: 2px solid #d4d4d4;
    ${props => props.$isPlayer ? `
      bottom: -10px;
      border-top: none;
      border-left: none;
      box-shadow: 4px 4px 5px rgba(0, 0, 0, 0.1);
      background: linear-gradient(315deg, 
        #f0f0f0 0%,
        #ffffff 100%
      );
    ` : `
      top: -10px;
      border-bottom: none;
      border-right: none;
      box-shadow: -4px -4px 5px rgba(0, 0, 0, 0.1);
      background: linear-gradient(135deg, 
        #ffffff 0%,
        #f0f0f0 100%
      );
    `}
  }

  @keyframes showBubble {
    0% { opacity: 0; transform: translateX(-50%) scale(0.8); }
    10% { opacity: 1; transform: translateX(-50%) scale(1); }
    80% { opacity: 1; transform: translateX(-50%) scale(1); }
    100% { opacity: 0; transform: translateX(-50%) scale(0.8); }
  }
`;

const HeroSpeechBubble = ({ heroClass, isPlayer, isVisible, onAnimationComplete }) => {
  const [hasSoundPlayed, setHasSoundPlayed] = useState(false);
  
  const soundMap = {
    'mage': mageSpeech,
    'priest': priestSpeech,
    'seer': seerSpeech,
    'defender': defenderSpeech,
    'warrior': warriorSpeech
  };

  const [playSound, { duration: soundDuration }] = useSound(soundMap[heroClass.toLowerCase()], { volume: 0.8 });

  useEffect(() => {
    if (isVisible && !hasSoundPlayed && soundDuration) {
      playSound();
      setHasSoundPlayed(true);
      const timer = setTimeout(onAnimationComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, playSound, hasSoundPlayed, soundDuration, onAnimationComplete]);

  return (
    <SpeechBubbleContainer 
      $isPlayer={isPlayer} 
      $isVisible={isVisible}
    >
      {heroStartQuotes[heroClass.toLowerCase()]}
    </SpeechBubbleContainer>
  );
};

export default HeroSpeechBubble;