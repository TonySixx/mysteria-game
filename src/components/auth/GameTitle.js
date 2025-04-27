import React, { useEffect } from 'react';
import './GameTitle.css';

const GameTitle = () => {
  return (
    <div className="game-title-container">
      <div className="game-title">
        <span className="letter">M</span>
        <span className="letter">Y</span>
        <span className="letter">S</span>
        <span className="letter">T</span>
        <span className="letter">E</span>
        <span className="letter">R</span>
        <span className="letter">I</span>
        <span className="letter">A</span>
      </div>
      <div className="title-glow"></div>
    </div>
  );
};

export default GameTitle;
