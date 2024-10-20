import React from 'react';
import styled, { keyframes } from 'styled-components';

const fadeInOut = keyframes`
  0% { opacity: 0; transform: translateY(-20px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px); }
`;

const NotificationContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const NotificationItem = styled.div`
  background-color: rgba(0, 0, 0, 0.7);
  color: ${props => props.type === 'warning' ? '#ffcc00' : '#4CAF50'};
  padding: 15px 25px;
  margin-bottom: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  text-align: center;
  animation: ${fadeInOut} 3s ease-in-out forwards;
  max-width: 80%;
`;

export const Notification = ({ notifications }) => {
  return (
    <NotificationContainer>
      {notifications.map(notification => (
        <NotificationItem key={notification.id} type={notification.type}>
          {notification.message}
        </NotificationItem>
      ))}
    </NotificationContainer>
  );
};
