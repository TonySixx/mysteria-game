import React, { useEffect } from 'react';
import GameScene from './components/GameScene';
import config from './config';

function App() {
  useEffect(() => {
    console.log('Připojuji se k:', config.API_URL);
  }, []);

  return (
    <div className="App">
      <GameScene />
    </div>
  );
}

export default App;
