import React from 'react';

const SpectatorView = ({ gameInfo }) => {
  return (
    <div>
      <h3>Spectator View</h3>
      <p>Watching game: {gameInfo.code}</p>
      {/* This is where you'll display live stats, scores, and possibly video feeds from players */}
      <p>This view will show live game stats.</p>
    </div>
  );
};

export default SpectatorView;