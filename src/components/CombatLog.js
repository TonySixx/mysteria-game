import React, { memo, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const DraggableContainer = styled.div`
  position: fixed;
  left: ${props => props.$position.x}px;
  top: ${props => props.$position.y}px;
  z-index: 1000;
  cursor: move;
`;

const LogContainer = styled.div`
  width: 400px;
  height: 300px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #444;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  padding: 10px;
  overflow-y: auto;
  font-family: 'Arial', sans-serif;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
  }

  &::-webkit-scrollbar-thumb {
    background: #666;
    border-radius: 4px;
  }
`;

const Header = styled.div`
  background: rgba(0, 0, 0, 0.9);
  padding: 5px 10px;
  border-bottom: 1px solid #444;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  font-weight: bold;
  color: #f1c40f;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
`;

const LogEntry = styled.div`
  margin: 4px 0;
  font-size: 14px;
  color: #fff;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);
  line-height: 1.4;
  display: flex;
  gap: 8px;

  .timestamp {
    color: #666;
    font-family: monospace;
    white-space: nowrap;
  }

  .message {
    flex: 1;
  }

  .player-name {
    color: #3498db;
    font-weight: bold;
  }

  .enemy-name {
    color: #e04864;
    font-weight: bold;
  }

  .spell-name {
    color: #f1c40f;
    font-style: italic;
  }

  .damage {
    color: #e74c3c;
    font-weight: bold;
  }

  .heal {
    color: #2ecc71;
    font-weight: bold;
  }

  .mana {
    color: #9b59b6;
    font-weight: bold;
  }

  .shield {
    color: #f1c40f;
    font-weight: bold;
  }

  .taunt {
    color: #e67e22;
    font-weight: bold;
  }

  .freeze {
    color: #00ffff;
    font-weight: bold;
  }

  .draw {
    color: #3498db;
    font-weight: bold;
  }
`;

const ResetButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 2px 5px;
  font-size: 12px;

  &:hover {
    color: #fff;
  }
`;

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

 const _CombatLog = ({ logEntries }) => {
  const logRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 90 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logEntries]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Omezení pohybu v rámci okna
      const maxX = window.innerWidth - 400; // šířka logu
      const maxY = window.innerHeight - 300; // výška logu
      
      setPosition({
        x: Math.min(Math.max(0, newX), maxX),
        y: Math.min(Math.max(0, newY), maxY)
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetPosition = () => {
    setPosition({ x: 20, y: 90 });
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <DraggableContainer $position={position}>
      <Header onMouseDown={handleMouseDown}>
        Combat Log
        <ResetButton onClick={resetPosition} onMouseDown={e => e.stopPropagation()}>
          Reset Position
        </ResetButton>
      </Header>
      <LogContainer ref={logRef}>
        {logEntries.map((entry, index) => (
          <LogEntry key={index} $isPlayer={entry.isPlayer}>
            <span className="timestamp">[{formatTime(entry.timestamp)}]</span>
            <span className="message" dangerouslySetInnerHTML={{ __html: entry.message }} />
          </LogEntry>
        ))}
      </LogContainer>
    </DraggableContainer>
  );
};
export const CombatLog = memo(_CombatLog);