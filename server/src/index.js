const io = require("socket.io")(4000);

const rooms = {};

io.on("connection", (socket) => {
  socket.on("createRoom", (roomId) => {
    socket.join(roomId);
    console.log("Room created: ", roomId);
    rooms[roomId] = {
      players: [socket.id],
      board: Array(9).fill(null),
      hasAccess: true,
    };
    socket.emit("roomCreated", { roomId });
  });

  socket.on("joinRoom", ({ roomId }) => {
    const room = io.sockets.adapter.rooms.get(roomId);
    if (room && room.size === 1) {
      socket.join(roomId);
      rooms[roomId].players.push(socket.id);
      io.to(rooms[roomId].players[0]).emit("playerSymbol", { symbol: "X" });
      io.to(rooms[roomId].players[1]).emit("playerSymbol", { symbol: "O" });
      const board = rooms[roomId].board;
      io.to(roomId).emit("joining", { board, players: rooms[roomId].players });
    } else if (room && room.size === 2) {
      io.to(roomId).emit("setTurn", { turn: "X" });
    } else {
      socket.emit("roomError", { message: "Room not found" });
    }
  });
  
  socket.on("move", (data) => {
    const { roomId, board, isWinner, isDraw, currentPlayer } = data;
    rooms[roomId].board = board;
    console.log("move", board);
    socket.to(roomId).emit("move", { board, isWinner, isDraw, currentPlayer });
  });
});
