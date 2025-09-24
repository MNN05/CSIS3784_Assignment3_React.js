import React from 'react';
import '../styles/App.css';

const COLORS = ['#00e0ff', '#ff00c8', '#8a00ff', '#ffec00', '#00ff41', '#000000', '#ffffff', '#808080']; //only limited to these colours(but not in neon form)

const ColorSelectionScreen = ({ onSelectColor }) => {
  return (
    <div className="screen-container">
      <h2>Select Your Color</h2>
      <p>Choose a color that you are wearing.</p>
      <div className="color-selection-buttons">
        {COLORS.map(color => (
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