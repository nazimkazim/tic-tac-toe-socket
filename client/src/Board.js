import React from 'react';

function Board({ board, handleMakeMove }) {
    return (
      <div className="board">
        {board?.map((cell, index) => (
          <div key={index} className="cell" onClick={() => handleMakeMove(index)}>
            {cell === 'X' ? 'X' : cell === 'O' ? 'O' : ''}
          </div>
        ))}
      </div>
    );
  }
  

export default Board;
