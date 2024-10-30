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

const TabsContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const Tab = styled.div`
  padding: 5px 15px;
  cursor: pointer;
  color: ${props => props.$isActive ? '#f1c40f' : '#666'};
  position: relative;
  transition: color 0.3s;

  &:hover {
    color: ${props => props.$isActive ? '#f1c40f' : '#999'};
  }
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  background: #e74c3c;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ChatMessages = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 10px;

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

const ChatMessage = styled.div`
  margin: 4px 0;
  padding: 4px 8px;
  border-radius: 4px;
  background: ${props => props.$isOwn ? 'rgba(52, 152, 219, 0.2)' : 'rgba(255, 255, 255, 0.1)'};

  .sender {
    color: ${props => props.$isOwn ? '#3498db' : '#e74c3c'};
    font-weight: bold;
    margin-right: 8px;
  }

  .message {
    color: #fff;
  }

  .timestamp {
    float: right;
    color: #666;
    font-size: 0.8em;
  }
`;

const ChatInput = styled.div`
  display: flex;
  gap: 8px;
`;

const Input = styled.input`
  flex-grow: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid #444;
  border-radius: 4px;
  padding: 8px;
  color: white;
  outline: none;

  &:focus {
    border-color: #f1c40f;
  }
`;

const SendButton = styled.button`
  background: #f1c40f;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  color: black;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #f39c12;
  }

  &:disabled {
    background: #666;
    cursor: not-allowed;
  }
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

  .destroyed {
    color: #e74c3c;
    font-weight: bold;
    text-decoration: line-through;
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

const _CombatLog = ({ logEntries, socket, playerUsername, opponentUsername }) => {
  const logRef = useRef(null);
  const chatRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 90 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState('log');
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [unreadLogs, setUnreadLogs] = useState(0);
  const [unreadChats, setUnreadChats] = useState(0);

  // Přidáme refs pro sledování posledních přečtených zpráv
  const lastReadLogRef = useRef(0);
  const lastReadChatRef = useRef(0);

  // Efekt pro scrollování na nové zprávy
  useEffect(() => {
    if (activeTab === 'log' && logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    } else if (activeTab === 'chat' && chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [logEntries, chatMessages, activeTab]);

  // Upravíme efekt pro chat zprávy
  useEffect(() => {
    if (!socket) return;

    socket.on('chatMessage', (data) => {
      const newMessage = {
        id: Date.now(),
        sender: data.sender,
        message: data.message,
        timestamp: new Date(),
        isOwn: data.sender === playerUsername
      };
      
      setChatMessages(prev => [...prev, newMessage]);
      
      if (activeTab !== 'chat') {
        setUnreadChats(prev => prev + 1);
      } else {
        lastReadChatRef.current = chatMessages.length + 1;
      }
    });

    return () => {
      socket.off('chatMessage');
    };
  }, [socket, playerUsername, activeTab, chatMessages.length]);

  // Odstraníme původní efekt pro počítání nepřečtených chat zpráv
  // a necháme pouze efekt pro combat log
  useEffect(() => {
    if (activeTab !== 'log' && logEntries.length > lastReadLogRef.current) {
      setUnreadLogs(logEntries.length - lastReadLogRef.current);
    }
  }, [logEntries, activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'log') {
      setUnreadLogs(0);
      lastReadLogRef.current = logEntries.length;
    } else if (tab === 'chat') {
      setUnreadChats(0);
      lastReadChatRef.current = chatMessages.length;
    }
  };

  const handleSendMessage = () => {
    if (!message.trim() || !socket) return;

    socket.emit('chatMessage', {
      message: message.trim(),
      sender: playerUsername
    });

    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Drag and drop logika...
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
      
      const maxX = window.innerWidth - 400;
      const maxY = window.innerHeight - 300;
      
      setPosition({
        x: Math.min(Math.max(0, newX), maxX),
        y: Math.min(Math.max(0, newY), maxY)
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
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
        <TabsContainer>
          <Tab 
            $isActive={activeTab === 'log'} 
            onClick={() => handleTabChange('log')}
          >
            Combat Log
            {unreadLogs > 0 && <NotificationBadge>{unreadLogs}</NotificationBadge>}
          </Tab>
          <Tab 
            $isActive={activeTab === 'chat'} 
            onClick={() => handleTabChange('chat')}
          >
            Chat
            {unreadChats > 0 && <NotificationBadge>{unreadChats}</NotificationBadge>}
          </Tab>
        </TabsContainer>
      </Header>
      <LogContainer>
        {activeTab === 'log' ? (
          <div ref={logRef}>
            {logEntries.map((entry) => (
              <LogEntry key={entry.id} $isPlayer={entry.isPlayer}>
                <span className="timestamp">[{formatTime(entry.timestamp)}]</span>
                <span className="message" dangerouslySetInnerHTML={{ __html: entry.message }} />
              </LogEntry>
            ))}
          </div>
        ) : (
          <ChatContainer>
            <ChatMessages ref={chatRef}>
              {chatMessages.map((msg) => (
                <ChatMessage key={msg.id} $isOwn={msg.isOwn}>
                  <span className="sender">{msg.sender}</span>
                  <span className="message">{msg.message}</span>
                  <span className="timestamp">{formatTime(msg.timestamp)}</span>
                </ChatMessage>
              ))}
            </ChatMessages>
            <ChatInput>
              <Input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                maxLength={100}
              />
              <SendButton 
                onClick={handleSendMessage}
                disabled={!message.trim()}
              >
                Send
              </SendButton>
            </ChatInput>
          </ChatContainer>
        )}
      </LogContainer>
    </DraggableContainer>
  );
};

export const CombatLog = memo(_CombatLog);
