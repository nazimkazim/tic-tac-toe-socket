import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import Board from "./Board";
import "./App.css";
import { nanoid } from "nanoid";

const socket = io("http://localhost:3000");

function App() {
  const [roomId, setRoomId] = useState("");
  const [player, setPlayer] = useState("");
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isWinner, setIsWinner] = useState(false);
  const [isDraw, setIsDraw] = useState(false);
  const [isWaiting, setIsWaiting] = useState(true);
  const [playerSymbol, setPlayerSymbol] = useState("");
  const [currentTurn, setCurrentTurn] = useState("");

  useEffect(() => {
    socket.on("move", (data) => {
      setBoard(data.board);
      setIsWinner(data.isWinner);
      setIsDraw(data.isDraw);
      setCurrentTurn((prevTurn) => (prevTurn === "X" ? "O" : "X"));
    });
  }, [board, isWinner, isDraw]);

  useEffect(() => {
    socket.on("setTurn", (data) => {
      setCurrentTurn(data.turn);
    });
  }, [board]);

  useEffect(() => {
    socket.on("playerSymbol", (data) => {
      setPlayerSymbol(data.symbol);
    });
  }, []);

  useEffect(() => {
    socket.on("roomCreated", (data) => {
      setRoomId(data.roomId);
      setPlayer("X");
      setIsWaiting(false);
    });
  }, [player, roomId]);

  useEffect(() => {
    socket.on("joining", (data) => {
      setBoard(data.board);
      setPlayer(data.players[0] === socket.id ? "X" : "O");
      setIsWaiting(false);
    });

    socket.on("playerSymbol", (data) => {
      console.log("playerSymbol", data.symbol);
      setPlayerSymbol(data.symbol);
    });

    // Clean up event listeners when the component unmounts
    return () => {
      socket.off("joining");
      socket.off("playerSymbol");
    };
  }, []);

  function handleJoinRoom() {
    socket.emit("joinRoom", { roomId });
  }

  function handleCreateGame() {
    const roomId = nanoid();
    socket.emit("createRoom", roomId);
  }

  const handleMakeMove = (index) => {
    if (!board[index] && !isWinner && !isDraw && currentTurn === playerSymbol) {
      const newBoard = [...board];
      newBoard[index] = playerSymbol;
      setBoard(newBoard);
      const data = {
        roomId,
        board: newBoard,
        isWinner: checkWinner(newBoard),
        isDraw: checkDraw(newBoard),
        currentPlayer: playerSymbol,
      };
      socket.emit("move", data);
    }
  };

  const checkWinner = (board) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return true;
      }
    }

    return false;
  };

  const checkDraw = (board) => {
    return board.every((cell) => cell !== null);
  };

  const handleRestart = () => {
    setBoard(Array(9).fill(null));
    setIsWinner(false);
    setIsDraw(false);
  };

  return (
    <>
      {!isWaiting ? (
        <>
          <p>You are player {player}</p>
          <Board board={board} handleMakeMove={handleMakeMove} />
          {isWinner ? (
            <p>Player {player} wins!</p>
          ) : isDraw ? (
            <p>It's a draw!</p>
          ) : (
            <p>It's player {player}'s turn</p>
          )}
          <button onClick={handleRestart}>Restart</button>
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button onClick={handleJoinRoom}>Join Room</button>
          <button onClick={handleCreateGame}>Create New Game</button>
        </>
      )}
    </>
  );
}

export default App;
