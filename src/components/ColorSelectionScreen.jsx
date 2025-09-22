import React from 'react';
import '../styles/App.css';

const NEON_COLORS = ['#00e0ff', '#ff00c8', '#8a00ff', '#ffec00', '#00ff41', '#ff6f00', '#ff0000ff', '#080808ff', '#f7f2f4ff'];

const ColorSelectionScreen = ({ onSelectColor }) => {
  return (
    <div className="screen-container">
      <h2>Select Your Color</h2>
      <p>Choose a color that you are wearing.</p>
      <div className="color-selection-buttons">
        {NEON_COLORS.map(color => (
          <button
            key={color}
            className="color-button"
            style={{ backgroundColor: color }}
            onClick={() => onSelectColor(color)}
          />
        ))}
      </div>
    </div>
  );
};
export default ColorSelectionScreen;