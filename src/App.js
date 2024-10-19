import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import GameScene from './components/GameScene';
import config from './config';

function App() {
  React.useEffect(() => {
    // Zde můžete inicializovat spojení se serverem
    console.log('Připojuji se k:', config.API_URL);
  }, []);

  return (
    <div className="App">
      <Canvas>
        <OrbitControls />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <GameScene />
      </Canvas>
    </div>
  );
}

export default App;
