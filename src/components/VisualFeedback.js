import React from 'react';
import styled, { keyframes } from 'styled-components';

const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-20px);
  }
`;

const FeedbackText = styled.div`
  position: absolute;
  color: ${props => {
    switch (props.$type) {
      case 'damage':
        return '#ff0000';
      case 'heal':
        return '#00ff00';
      case 'mana':
        return '#4fc3f7';
      case 'freeze':
        return '#00ffff';
      case 'draw':
        return '#ffd700';
      case 'buff':
        return '#ff00ff';
      case 'taunt':
        return '#8b4513';
      case 'shield':
        return '#ffd700';
      default:
        return '#ffffff';
    }
  }};
  font-size: 24px;
  font-weight: bold;
  text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.5);
  animation: ${fadeOut} 3s forwards;
  pointer-events: none;
  z-index: 1000;
  left: ${props => (props.$position?.x || '50%')};
  top: ${props => (props.$position?.y || '50%')};
`;

export const VisualFeedbackContainer = ({ feedbacks = [] }) => {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      {feedbacks.map((feedback, index) => (
        <FeedbackText
          key={`${feedback.id}-${index}`}
          $type={feedback.type}
          $position={feedback.position || { x: '50%', y: '50%' }}
        >
          {(() => {
            switch (feedback.type) {
              case 'damage':
                return `-${feedback.value}`;
              case 'heal':
                return `+${feedback.value} ❤️`;
              case 'mana':
                return `+${feedback.value} 🔮`;
              case 'freeze':
                return feedback.value === 'all' ? '❄️❄️❄️' : '❄️';
              case 'draw':
                return `+${feedback.value} 🎴`;
              case 'buff':
                return `${feedback.value} ⚔️`;
              case 'taunt':
                return '🛡️';
              case 'shield':
                return '✨';
              default:
                return feedback.value;
            }
          })()}
        </FeedbackText>
      ))}
    </div>
  );
};
