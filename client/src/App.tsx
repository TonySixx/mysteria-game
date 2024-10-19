import React, { useEffect, useState } from 'react';
import './App.css';
import { initSocket, getSocket } from './services/socket';
import { Auth } from './components/Auth';
import { supabase } from './services/supabase';
import { Session } from '@supabase/auth-js';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    initSocket();
    const socket = getSocket();
    
    if (socket) {
      socket.on('connect', () => setIsConnected(true));
      socket.on('disconnect', () => setIsConnected(false));
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
      }
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Mysteria</h1>
        {!session ? (
          <Auth />
        ) : (
          <div>
            <p>Vítejte ve hře Mysteria, {session.user.email}!</p>
            <p>Stav připojení: {isConnected ? 'Připojeno' : 'Odpojeno'}</p>
            <button onClick={() => supabase.auth.signOut()}>Odhlásit se</button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
