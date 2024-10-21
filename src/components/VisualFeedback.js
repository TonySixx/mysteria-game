import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const floatUpAndFade = keyframes`
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateY(-30px) scale(0.7);
    opacity: 0;
  }
`;

const AnimatedText = styled.div`
  position: absolute;
  font-size: 36px;
  font-weight: bold;
  pointer-events: none;
  animation: ${floatUpAndFade} 2.5s ease-out forwards;
  text-shadow: 2px 2px 4px #000;
  z-index: 1000;
`;

const DamageText = styled(AnimatedText)`
  color: #ff3333;
`;

const HealText = styled(AnimatedText)`
  color: #33ff33;
`;

const DrawText = styled(AnimatedText)`
  color: #3333ff;
`;

const SpellText = styled(AnimatedText)`
  color: #ff33ff;
`;

const BurnFeedback = styled(AnimatedText)`
  color: #ff4500;
  font-weight: bold;
`;

export const VisualFeedback = ({ type, value, position }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  let TextComponent;
  let displayText;

  switch (type) {
    case 'damage':
      TextComponent = DamageText;
      displayText = `-${value}`;
      break;
    case 'heal':
      TextComponent = HealText;
      displayText = `+${value}`;
      break;
    case 'draw':
      TextComponent = DrawText;
      displayText = `+${value} karty`;
      break;
    case 'spell':
      TextComponent = SpellText;
      displayText = value;
      break;
    case 'burn':
      TextComponent = BurnFeedback;
      displayText = `${value} 🔥`;
      break;
    default:
      TextComponent = AnimatedText;
      displayText = value;
  }

  return (
    <TextComponent style={{ left: position.x, top: position.y }}>
      {displayText}
    </TextComponent>
  );
};

export const VisualFeedbackContainer = ({ feedbacks }) => (
  <>
    {feedbacks.map(feedback => (
      <VisualFeedback key={feedback.id} {...feedback} />
    ))}
  </>
);
